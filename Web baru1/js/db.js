// js/db.js
// State & LocalStorage Manager untuk Toko Online (Sync Pembeli & Penjual)

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
    // Jika data lama memiliki produk lebih sedikit daripada INITIAL_PRODUCTS (misal sebelumnya hanya 8 produk),
    // kita sinkronkan agar produk baru 16 item ikut tersedia tanpa menghapus data produk custom pengguna
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

function addProduct(product) {
  const products = getProducts();
  const newProduct = {
    ...product,
    id: product.id || "PROD-" + Date.now().toString().slice(-4),
    soldCount: Number(product.soldCount) || 0,
    rating: Number(product.rating) || 5.0,
    stock: Number(product.stock) || 0,
    price: Number(product.price) || 0,
    originalPrice: Number(product.originalPrice) || Number(product.price) || 0,
    reviews: product.reviews || []
  };
  products.unshift(newProduct);
  saveProducts(products);
  return newProduct;
}

function updateProduct(id, updatedFields) {
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
    return products[index];
  }
  return null;
}

function deleteProduct(id) {
  let products = getProducts();
  products = products.filter(p => p.id !== id);
  saveProducts(products);
}

// Kurangi stok produk setelah checkout
function reduceProductStock(items) {
  const products = getProducts();
  items.forEach(item => {
    const prod = products.find(p => p.id === item.id);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
      prod.soldCount = (prod.soldCount || 0) + item.quantity;
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
    return order;
  }
  return null;
}

// ==========================================
// OPERASI KERANJANG BELANJA (CART)
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
