// js/db.js
// Hybrid Database & State Manager (Supabase Cloud + LocalStorage Cache & Offline Fallback)

const DB_KEYS = {
  PRODUCTS: "toko_products_v2",
  ORDERS: "toko_orders_v2",
  CART: "toko_cart_v2",
  SETTINGS: "toko_settings_v2"
};

// Inisialisasi Database LocalStorage jika masih kosong atau upgrade versi
function initDatabase() {
  const existingProducts = localStorage.getItem(DB_KEYS.PRODUCTS);
  if (!existingProducts) {
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  } else {
    try {
      const parsed = JSON.parse(existingProducts);
      if (Array.isArray(parsed) && parsed.length < INITIAL_PRODUCTS.length) {
        const existingIds = new Set(parsed.map(p => p.id));
        const newProductsToAdd = INITIAL_PRODUCTS.filter(p => !existingIds.has(p.id));
        const combined = [...parsed, ...newProductsToAdd];
        localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(combined));
      }
    } catch (e) {
      localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    }
  }

  if (!localStorage.getItem(DB_KEYS.ORDERS)) {
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  }
  if (!localStorage.getItem(DB_KEYS.CART)) {
    localStorage.setItem(DB_KEYS.CART, JSON.stringify([]));
  }
  if (!localStorage.getItem(DB_KEYS.SETTINGS)) {
    localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  }

  // Jalankan sinkronisasi Supabase di background jika kredensial sudah ada
  if (typeof getSupabaseClient === "function") {
    initSupabaseSync();
  }
}

// Jalankan inisialisasi awal
initDatabase();

// ==========================================
// OPERASI PRODUK (PRODUCTS CRUD)
// ==========================================

function getProducts() {
  try {
    const data = localStorage.getItem(DB_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Gagal membaca produk:", e);
    return [];
  }
}

function getProductById(id) {
  const products = getProducts();
  return products.find(p => p.id === id) || null;
}

function saveProducts(products) {
  localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
  dispatchStorageChange();
}

async function addProduct(product) {
  const products = getProducts();
  const nextNum = products.length + 1;
  const newProduct = {
    ...product,
    id: product.id || "PROD-" + String(nextNum).padStart(3, "0") + "-" + Date.now().toString().slice(-4),
    soldCount: Number(product.soldCount) || 0,
    rating: Number(product.rating) || 5.0,
    stock: Number(product.stock) || 0,
    price: Number(product.price) || 0,
    originalPrice: Number(product.originalPrice) || Number(product.price) || 0,
    reviews: product.reviews || []
  };
  products.unshift(newProduct);
  saveProducts(products);

  // Sync Cloud Supabase
  let syncResult = null;
  if (typeof getSupabaseClient === "function" && getSupabaseClient()) {
    syncResult = await cloudInsertProduct(newProduct);
  }

  return { ...newProduct, _syncResult: syncResult };
}

async function updateProduct(id, updatedFields) {
  const products = getProducts();
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products[index] = {
      ...products[index],
      ...updatedFields,
      stock: Number(updatedFields.stock !== undefined ? updatedFields.stock : products[index].stock),
      price: Number(updatedFields.price !== undefined ? updatedFields.price : products[index].price),
      originalPrice: Number(updatedFields.originalPrice !== undefined ? updatedFields.originalPrice : products[index].originalPrice)
    };
    saveProducts(products);

    // Sync Cloud Supabase
    let syncResult = null;
    if (typeof getSupabaseClient === "function" && getSupabaseClient()) {
      syncResult = await cloudUpdateProduct(id, products[index]);
    }

    return { ...products[index], _syncResult: syncResult };
  }
  return null;
}

async function deleteProduct(id) {
  let products = getProducts();
  products = products.filter(p => p.id !== id);
  saveProducts(products);

  // Sync Cloud Supabase
  let syncResult = null;
  if (typeof getSupabaseClient === "function" && getSupabaseClient()) {
    syncResult = await cloudDeleteProduct(id);
  }
  return syncResult;
}

// Kurangi stok produk setelah checkout
function reduceProductStock(items) {
  const products = getProducts();
  items.forEach(item => {
    const prod = products.find(p => p.id === item.id);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
      prod.soldCount = (prod.soldCount || 0) + item.quantity;
      // Sync Cloud Supabase per item stock
      cloudUpdateProduct(prod.id, { stock: prod.stock, soldCount: prod.soldCount });
    }
  });
  saveProducts(products);
}

// Tambah ulasan pembeli ke produk
function addProductReview(productId, reviewData) {
  const products = getProducts();
  const product = products.find(p => p.id === productId);
  if (!product) return null;

  if (!product.reviews) {
    product.reviews = [];
  }

  const now = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
  const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

  const newReview = {
    id: "REV-" + Date.now().toString().slice(-5),
    author: reviewData.author || "Pembeli Terverifikasi",
    rating: Number(reviewData.rating) || 5,
    date: dateStr,
    comment: reviewData.comment || "",
    verified: true
  };

  product.reviews.unshift(newReview);

  // Recalculate average rating
  const totalStars = product.reviews.reduce((sum, r) => sum + Number(r.rating || 5), 0);
  product.rating = Number((totalStars / product.reviews.length).toFixed(1));

  saveProducts(products);

  // Sync Cloud Supabase
  cloudUpdateProduct(productId, { reviews: product.reviews, rating: product.rating });

  return newReview;
}

// ==========================================
// OPERASI PESANAN (ORDERS)
// ==========================================

function getOrders() {
  try {
    const data = localStorage.getItem(DB_KEYS.ORDERS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Gagal membaca pesanan:", e);
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
  dispatchStorageChange();
}

function addOrder(orderData) {
  const orders = getOrders();
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10) + " " + now.toTimeString().slice(0, 5);

  const newOrder = {
    id: "ORD-" + Math.floor(1000 + Math.random() * 9000),
    createdAt: dateStr,
    status: "Menunggu Pembayaran",
    trackingNumber: "-",
    ...orderData
  };

  orders.unshift(newOrder);
  saveOrders(orders);
  reduceProductStock(orderData.items);

  // Sync Cloud Supabase
  cloudInsertOrder(newOrder);

  return newOrder;
}

function updateOrderStatus(orderId, newStatus, trackingNumber = null) {
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }
    saveOrders(orders);

    // Sync Cloud Supabase
    cloudUpdateOrderStatus(orderId, newStatus, order.trackingNumber);

    return order;
  }
  return null;
}

// ==========================================
// OPERASI KERANJANG BELANJA (CART)
// Tetap di LocalStorage pengguna (client browser)
// ==========================================

function getCart() {
  try {
    const data = localStorage.getItem(DB_KEYS.CART);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(DB_KEYS.CART, JSON.stringify(cart));
  dispatchStorageChange();
}

function addToCart(productId, quantity = 1) {
  const product = getProductById(productId);
  if (!product) {
    showToast("Produk tidak ditemukan!", "error");
    return;
  }

  if (product.stock < 1) {
    showToast("Maaf, stok produk ini habis!", "error");
    return;
  }

  const cart = getCart();
  const existingIndex = cart.findIndex(item => item.id === productId);

  if (existingIndex > -1) {
    const newQty = cart[existingIndex].quantity + quantity;
    if (newQty > product.stock) {
      showToast(`Stok maksimal tersedia hanya ${product.stock} pcs!`, "warning");
      cart[existingIndex].quantity = product.stock;
    } else {
      cart[existingIndex].quantity = newQty;
      showToast(`Jumlah produk diperbarui di keranjang`, "success");
    }
  } else {
    const addQty = Math.min(quantity, product.stock);
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      quantity: addQty
    });
    showToast(`"${product.name.slice(0, 25)}..." dimasukkan ke keranjang`, "success");
  }

  saveCart(cart);
}

function updateCartQty(productId, quantity) {
  const cart = getCart();
  const product = getProductById(productId);
  const itemIndex = cart.findIndex(item => item.id === productId);

  if (itemIndex > -1) {
    if (quantity <= 0) {
      cart.splice(itemIndex, 1);
      showToast("Produk dihapus dari keranjang", "info");
    } else {
      const maxStock = product ? product.stock : 99;
      if (quantity > maxStock) {
        showToast(`Maksimal stok produk ini: ${maxStock}`, "warning");
        cart[itemIndex].quantity = maxStock;
      } else {
        cart[itemIndex].quantity = quantity;
      }
    }
    saveCart(cart);
  }
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  saveCart(cart);
  showToast("Produk dikeluarkan dari keranjang", "info");
}

function clearCart() {
  saveCart([]);
}

function getCartCount() {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
}

function getCartTotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// ==========================================
// PENGATURAN TOKO (SETTINGS)
// ==========================================

function getStoreSettings() {
  try {
    const data = localStorage.getItem(DB_KEYS.SETTINGS);
    if (!data) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

function saveStoreSettings(newSettings) {
  const current = getStoreSettings();
  const merged = { ...current, ...newSettings };
  localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(merged));
  dispatchStorageChange();

  // Sync Cloud Supabase
  cloudSaveSettings(merged);

  return merged;
}

function resetAllData() {
  localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  localStorage.setItem(DB_KEYS.CART, JSON.stringify([]));
  localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  dispatchStorageChange();
  showToast("Seluruh data toko (24 Produk, Pesanan, & Pengaturan) berhasil di-reset!", "success");
}

function resetSettingsOnly() {
  localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  dispatchStorageChange();
  showToast("Pengaturan profil toko berhasil dikembalikan ke default!", "success");
}

// ==========================================
// SUPABASE SYNC & DATA MAPPING
// ==========================================

function mapProductFromSupabase(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price) || 0,
    originalPrice: Number(row.original_price ?? row.price) || 0,
    stock: Number(row.stock) || 0,
    rating: Number(row.rating) || 5.0,
    soldCount: Number(row.sold_count) || 0,
    image: row.image || "",
    description: row.description || "",
    badge: row.badge || "",
    reviews: Array.isArray(row.reviews) ? row.reviews : []
  };
}

function mapProductToSupabase(p) {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    price: Number(p.price) || 0,
    original_price: Number(p.originalPrice ?? p.price) || 0,
    stock: Number(p.stock) || 0,
    rating: Number(p.rating) || 5.0,
    sold_count: Number(p.soldCount) || 0,
    image: p.image || "",
    description: p.description || "",
    badge: p.badge || "",
    reviews: p.reviews || []
  };
}

function mapOrderFromSupabase(row) {
  let createdStr = "";
  if (row.created_at) {
    try {
      const d = new Date(row.created_at);
      createdStr = d.toISOString().slice(0, 10) + " " + d.toTimeString().slice(0, 5);
    } catch (e) {
      createdStr = String(row.created_at);
    }
  }

  return {
    id: row.id,
    createdAt: createdStr || row.createdAt || "",
    courier: row.courier || "-",
    customer: row.customer || {},
    items: row.items || [],
    subtotal: Number(row.subtotal) || 0,
    shippingFee: Number(row.shipping_fee) || 0,
    discount: Number(row.discount) || 0,
    total: Number(row.total) || 0,
    paymentMethod: row.payment_method || "-",
    status: row.status || "Menunggu Pembayaran",
    trackingNumber: row.tracking_number || "-"
  };
}

function mapOrderToSupabase(o) {
  return {
    id: o.id,
    customer: o.customer || {},
    items: o.items || [],
    courier: o.courier || "-",
    payment_method: o.paymentMethod || "-",
    subtotal: Number(o.subtotal) || 0,
    shipping_fee: Number(o.shippingFee) || 0,
    discount: Number(o.discount) || 0,
    total: Number(o.total) || 0,
    status: o.status || "Menunggu Pembayaran",
    tracking_number: o.trackingNumber || "-"
  };
}

function mapSettingsFromSupabase(row) {
  return {
    storeName: row.store_name || DEFAULT_SETTINGS.storeName,
    storeTagline: row.store_tagline || DEFAULT_SETTINGS.storeTagline,
    sellerName: row.seller_name || DEFAULT_SETTINGS.sellerName,
    sellerPhone: row.seller_phone || DEFAULT_SETTINGS.sellerPhone,
    sellerEmail: row.seller_email || DEFAULT_SETTINGS.sellerEmail,
    address: row.address || DEFAULT_SETTINGS.address,
    freeShippingMin: Number(row.free_shipping_min) || 300000,
    flatShippingFee: Number(row.flat_shipping_fee) || 15000,
    storeLogo: row.store_logo || ""
  };
}

function mapSettingsToSupabase(s) {
  return {
    id: "default",
    store_name: s.storeName,
    store_tagline: s.storeTagline,
    seller_name: s.sellerName,
    seller_phone: s.sellerPhone,
    seller_email: s.sellerEmail,
    address: s.address,
    free_shipping_min: Number(s.freeShippingMin) || 300000,
    flat_shipping_fee: Number(s.flatShippingFee) || 15000,
    store_logo: s.storeLogo || "",
    updated_at: new Date().toISOString()
  };
}

// Inisialisasi Sinkronisasi Real-time & Download Awal dari Supabase
let _isSupabaseSyncing = false;
let _hasSubscribedRealtime = false;

async function initSupabaseSync() {
  const client = getSupabaseClient();
  if (!client || _isSupabaseSyncing) return;
  _isSupabaseSyncing = true;

  try {
    await Promise.all([
      syncProductsFromSupabase(),
      syncOrdersFromSupabase(),
      syncSettingsFromSupabase()
    ]);

    // Berlangganan Realtime Postgres Changes
    if (!_hasSubscribedRealtime) {
      _hasSubscribedRealtime = true;
      client
        .channel("toko_realtime_channel")
        .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
          syncProductsFromSupabase();
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
          syncOrdersFromSupabase();
          if (payload && payload.eventType === "INSERT") {
            const customerName = payload.new?.customer?.name || "Pelanggan";
            const orderTotal = payload.new?.total ? formatRupiah(payload.new.total) : "";
            if (typeof showToast === "function") {
              showToast(`🔔 Pesanan Baru Masuk dari ${customerName} (${orderTotal})!`, "success");
            }
            try {
              // Sound chime jika browser mengizinkan Web Audio
              const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.type = "sine";
              osc.frequency.setValueAtTime(880, audioCtx.currentTime);
              gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
              osc.start();
              osc.stop(audioCtx.currentTime + 0.35);
            } catch (e) {}
          }
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "settings" }, () => {
          syncSettingsFromSupabase();
        })
        .subscribe();
      console.log("⚡ Supabase Realtime channel aktif");
    }
  } catch (err) {
    console.warn("Sinkronisasi awal Supabase terkendala:", err);
  } finally {
    _isSupabaseSyncing = false;
  }
}

async function syncProductsFromSupabase() {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const { data, error } = await client.from("products").select("*").order("created_at", { ascending: true });
    if (!error && Array.isArray(data) && data.length > 0) {
      const mapped = data.map(mapProductFromSupabase);
      localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(mapped));
      dispatchStorageChange();
    }
  } catch (e) {
    console.warn("Gagal sinkron produk Supabase:", e);
  }
}

async function syncOrdersFromSupabase() {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const { data, error } = await client.from("orders").select("*").order("created_at", { ascending: false });
    if (!error && Array.isArray(data) && data.length > 0) {
      const mapped = data.map(mapOrderFromSupabase);
      localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(mapped));
      dispatchStorageChange();
    }
  } catch (e) {
    console.warn("Gagal sinkron pesanan Supabase:", e);
  }
}

async function syncSettingsFromSupabase() {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const { data, error } = await client.from("settings").select("*").eq("id", "default").maybeSingle();
    if (!error && data) {
      const mapped = mapSettingsFromSupabase(data);
      localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(mapped));
      dispatchStorageChange();
    }
  } catch (e) {
    console.warn("Gagal sinkron settings Supabase:", e);
  }
}

// Background Cloud Writers
async function cloudInsertProduct(product) {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, reason: "NO_CLIENT", message: "Supabase belum terhubung" };
  }
  try {
    const payload = mapProductToSupabase(product);
    const { data, error } = await client.from("products").upsert(payload, { onConflict: "id" });
    if (error) {
      console.warn("Cloud insert product gagal:", error);
      return { success: false, reason: "DB_ERROR", error, message: error.message };
    }
    console.log("⚡ Sukses simpan produk ke Supabase:", product.id);
    return { success: true, data };
  } catch (e) {
    console.warn("Cloud insert product exception:", e);
    return { success: false, reason: "EXCEPTION", error: e, message: e.message };
  }
}

async function cloudUpdateProduct(id, fields) {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, reason: "NO_CLIENT", message: "Supabase belum terhubung" };
  }
  try {
    const payload = {};
    if (fields.name !== undefined) payload.name = fields.name;
    if (fields.category !== undefined) payload.category = fields.category;
    if (fields.price !== undefined) payload.price = Number(fields.price);
    if (fields.originalPrice !== undefined) payload.original_price = Number(fields.originalPrice);
    if (fields.stock !== undefined) payload.stock = Number(fields.stock);
    if (fields.rating !== undefined) payload.rating = Number(fields.rating);
    if (fields.soldCount !== undefined) payload.sold_count = Number(fields.soldCount);
    if (fields.image !== undefined) payload.image = fields.image;
    if (fields.description !== undefined) payload.description = fields.description;
    if (fields.badge !== undefined) payload.badge = fields.badge;
    if (fields.reviews !== undefined) payload.reviews = fields.reviews;

    const { data, error } = await client.from("products").update(payload).eq("id", id);
    if (error) {
      console.warn("Cloud update product gagal:", error);
      return { success: false, error, message: error.message };
    }
    console.log("⚡ Sukses update produk di Supabase:", id);
    return { success: true, data };
  } catch (e) {
    console.warn("Cloud update product exception:", e);
    return { success: false, error: e, message: e.message };
  }
}

async function cloudDeleteProduct(id) {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, reason: "NO_CLIENT", message: "Supabase belum terhubung" };
  }
  try {
    const { data, error } = await client.from("products").delete().eq("id", id);
    if (error) {
      console.warn("Cloud delete product gagal:", error);
      return { success: false, error, message: error.message };
    }
    console.log("⚡ Sukses hapus produk dari Supabase:", id);
    return { success: true, data };
  } catch (e) {
    console.warn("Cloud delete product exception:", e);
    return { success: false, error: e, message: e.message };
  }
}

async function cloudInsertOrder(order) {
  const client = getSupabaseClient();
  if (!client) return { success: false };
  try {
    const payload = mapOrderToSupabase(order);
    const { data, error } = await client.from("orders").upsert(payload, { onConflict: "id" });
    if (error) {
      console.warn("Cloud insert order gagal:", error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (e) {
    console.warn("Cloud insert order gagal:", e);
    return { success: false, error: e };
  }
}

async function cloudUpdateOrderStatus(orderId, status, trackingNumber = "-") {
  const client = getSupabaseClient();
  if (!client) return { success: false };
  try {
    const payload = { status };
    if (trackingNumber !== null) payload.tracking_number = trackingNumber;
    const { data, error } = await client.from("orders").update(payload).eq("id", orderId);
    if (error) {
      console.warn("Cloud update order status gagal:", error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (e) {
    console.warn("Cloud update order status gagal:", e);
    return { success: false, error: e };
  }
}

async function cloudSaveSettings(settings) {
  const client = getSupabaseClient();
  if (!client) return { success: false };
  try {
    const payload = mapSettingsToSupabase(settings);
    const { data, error } = await client.from("settings").upsert(payload, { onConflict: "id" });
    if (error) {
      console.warn("Cloud save settings gagal:", error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (e) {
    console.warn("Cloud save settings gagal:", e);
    return { success: false, error: e };
  }
}

/**
 * Fitur Upload Massal: Sinkronkan semua 24 produk, pesanan, dan profil toko lokal ke Supabase
 */
async function uploadAllDataToSupabase() {
  const client = getSupabaseClient();
  if (!client) {
    showToast("Supabase belum terhubung! Silakan isi Project URL & API Key di Pengaturan.", "error");
    return { success: false, message: "Client belum aktif" };
  }

  try {
    showToast("Mengunggah seluruh katalog produk & pengaturan ke Supabase Cloud...", "info");

    // 1. Upload Produk
    const products = getProducts();
    if (!products || products.length === 0) {
      showToast("Tidak ada produk untuk diunggah.", "warning");
      return { success: false, message: "Produk kosong" };
    }

    const payloadProducts = products.map(mapProductToSupabase);
    const { error: pErr } = await client.from("products").upsert(payloadProducts, { onConflict: "id" });
    if (pErr) {
      if (pErr.code === "42P01" || (pErr.message && pErr.message.includes("does not exist"))) {
        throw new Error("Tabel 'products' belum ada di Supabase! Harap salin & jalankan script 'supabase_setup.sql' di SQL Editor Supabase.");
      }
      if (pErr.code === "42501" || (pErr.message && pErr.message.includes("permission denied"))) {
        throw new Error("Izin ditolak (RLS). Harap jalankan script 'supabase_setup.sql' di SQL Editor Supabase.");
      }
      throw pErr;
    }

    // 2. Upload Pengaturan
    const settings = getStoreSettings();
    const payloadSettings = mapSettingsToSupabase(settings);
    const { error: sErr } = await client.from("settings").upsert(payloadSettings, { onConflict: "id" });
    if (sErr) console.warn("Upload settings warning:", sErr);

    // 3. Upload Pesanan (opsional jika ada)
    const orders = getOrders();
    if (orders.length > 0) {
      const payloadOrders = orders.map(mapOrderToSupabase);
      const { error: oErr } = await client.from("orders").upsert(payloadOrders, { onConflict: "id" });
      if (oErr) console.warn("Upload orders warning:", oErr);
    }

    showToast(`🎉 Sukses! ${products.length} produk & pengaturan toko berhasil diunggah ke Supabase Cloud!`, "success");
    return { success: true, count: products.length };
  } catch (err) {
    console.error("Gagal upload ke Supabase:", err);
    showToast("Gagal upload ke Supabase: " + (err.message || err), "error");
    return { success: false, error: err };
  }
}

// ==========================================
// HELPER UTILITIES
// ==========================================

function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(number || 0);
}

function dispatchStorageChange() {
  window.dispatchEvent(new Event("toko-storage-update"));
}

// Floating Toast Notification
function showToast(message, type = "info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `pointer-events-auto transform transition-all duration-300 ease-out translate-y-2 opacity-0 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium text-white ${
    type === "success"
      ? "bg-emerald-600"
      : type === "error"
      ? "bg-rose-600"
      : type === "warning"
      ? "bg-amber-600"
      : "bg-slate-800"
  }`;

  const iconSvg = {
    success: `<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`,
    error: `<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`,
    warning: `<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`,
    info: `<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
  }[type] || "";

  toast.innerHTML = `${iconSvg}<span>${message}</span>`;
  container.appendChild(toast);

  // Animation in
  requestAnimationFrame(() => {
    toast.classList.remove("translate-y-2", "opacity-0");
    toast.classList.add("translate-y-0", "opacity-100");
  });

  // Auto remove after 3.2s
  setTimeout(() => {
    toast.classList.remove("translate-y-0", "opacity-100");
    toast.classList.add("translate-y-2", "opacity-0");
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
