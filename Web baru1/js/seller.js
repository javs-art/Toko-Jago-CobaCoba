// js/seller.js
// Logika untuk Interface Penjual (Seller Dashboard / Admin Toko)

let currentTab = "overview";
let editingProductId = null;
let orderStatusFilter = "all";
let productSearchQuery = "";
let uploadedLogoDataUrl = null;

document.addEventListener("DOMContentLoaded", () => {
  initSellerApp();
  setupSellerEvents();

  // Dengarkan perubahan data dari tab lain (misal pembeli baru checkout atau edit setting)
  window.addEventListener("toko-storage-update", () => {
    refreshAllSellerViews();
  });

  window.addEventListener("storage", () => {
    refreshAllSellerViews();
  });
});

function initSellerApp() {
  switchTab("overview");
  refreshAllSellerViews();
}

function refreshAllSellerViews() {
  renderStoreProfile();
  renderOverviewStats();
  renderProductsTable();
  renderOrdersTable();
}

// ==========================================
// RENDER PROFIL TOKO & LOGO
// ==========================================

function renderStoreProfile() {
  const settings = getStoreSettings();

  // Sidebar Store Name & Tagline
  const sidebarName = document.getElementById("sidebar-store-name");
  const sidebarTagline = document.getElementById("sidebar-store-tagline");
  const sidebarLogoBox = document.getElementById("sidebar-store-logo-box");
  const topStoreName = document.getElementById("top-store-name");
  const topLogoBox = document.getElementById("top-store-logo-box");

  if (sidebarName) sidebarName.innerText = settings.storeName || "Toko Berkah Official";
  if (sidebarTagline) sidebarTagline.innerText = settings.storeTagline || "Official Store";
  if (topStoreName) topStoreName.innerText = settings.sellerName || "Admin Toko";

  // Initials generator
  const initials = (settings.storeName || "TB")
    .split(" ")
    .map(w => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Logo di sidebar
  if (sidebarLogoBox) {
    if (settings.storeLogo) {
      sidebarLogoBox.innerHTML = `<img src="${settings.storeLogo}" alt="Logo" class="w-full h-full object-cover" />`;
    } else {
      sidebarLogoBox.innerHTML = `<span id="sidebar-store-initials" class="font-extrabold text-slate-900">${initials}</span>`;
    }
  }

  // Logo di top bar
  if (topLogoBox) {
    if (settings.storeLogo) {
      topLogoBox.innerHTML = `<img src="${settings.storeLogo}" alt="Logo" class="w-full h-full object-cover" />`;
    } else {
      topLogoBox.innerHTML = `<span id="top-store-initials">${initials}</span>`;
    }
  }

  // Isi data input di Tab Pengaturan jika sedang dibuka
  populateSettingsForm(settings);
}

function populateSettingsForm(settings) {
  const inputName = document.getElementById("setting-store-name");
  const inputTagline = document.getElementById("setting-store-tagline");
  const inputOwner = document.getElementById("setting-seller-name");
  const inputPhone = document.getElementById("setting-seller-phone");
  const inputEmail = document.getElementById("setting-seller-email");
  const inputAddress = document.getElementById("setting-store-address");
  const inputShipping = document.getElementById("setting-shipping-fee");
  const logoPreview = document.getElementById("setting-logo-preview");
  const logoPlaceholder = document.getElementById("setting-logo-placeholder");

  if (inputName) inputName.value = settings.storeName || "";
  if (inputTagline) inputTagline.value = settings.storeTagline || "";
  if (inputOwner) inputOwner.value = settings.sellerName || "";
  if (inputPhone) inputPhone.value = settings.sellerPhone || "";
  if (inputEmail) inputEmail.value = settings.sellerEmail || "";
  if (inputAddress) inputAddress.value = settings.address || "";
  if (inputShipping) inputShipping.value = settings.flatShippingFee || 15000;

  const currentLogo = uploadedLogoDataUrl !== null ? uploadedLogoDataUrl : settings.storeLogo;

  if (currentLogo && logoPreview && logoPlaceholder) {
    logoPreview.src = currentLogo;
    logoPreview.classList.remove("hidden");
    logoPlaceholder.classList.add("hidden");
  } else if (logoPreview && logoPlaceholder) {
    logoPreview.src = "";
    logoPreview.classList.add("hidden");
    logoPlaceholder.classList.remove("hidden");
  }
}

// ==========================================
// SISTEM TAB NAVIGASI
// ==========================================

function switchTab(tabName) {
  currentTab = tabName;

  const tabs = ["overview", "products", "orders", "settings"];
  tabs.forEach(t => {
    const el = document.getElementById(`tab-content-${t}`);
    const navBtn = document.getElementById(`nav-btn-${t}`);
    
    if (el) {
      if (t === tabName) {
        el.classList.remove("hidden");
      } else {
        el.classList.add("hidden");
      }
    }

    if (navBtn) {
      if (t === tabName) {
        navBtn.classList.add("bg-blue-600", "text-white");
        navBtn.classList.remove("text-slate-400", "hover:bg-slate-800");
      } else {
        navBtn.classList.remove("bg-blue-600", "text-white");
        navBtn.classList.add("text-slate-400", "hover:bg-slate-800");
      }
    }
  });

  // Re-render specific tab
  if (tabName === "overview") renderOverviewStats();
  if (tabName === "products") renderProductsTable();
  if (tabName === "orders") renderOrdersTable();
  if (tabName === "settings") renderStoreProfile();
}

// ==========================================
// TAB 1: OVERVIEW & STATISTIK TOKO
// ==========================================

function renderOverviewStats() {
  const products = getProducts();
  const orders = getOrders();

  // Hitung Omset (Total Pendapatan dari pesanan yang tidak dibatalkan)
  const validOrders = orders.filter(o => o.status !== "Dibatalkan");
  const totalRevenue = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  
  // Total Pesanan
  const totalOrdersCount = orders.length;

  // Total Produk Aktif
  const activeProductsCount = products.length;

  // Produk Menipis (Stok <= 5)
  const lowStockCount = products.filter(p => p.stock <= 5).length;

  const revEl = document.getElementById("stat-revenue");
  const ordEl = document.getElementById("stat-orders-count");
  const prdEl = document.getElementById("stat-products-count");
  const lowEl = document.getElementById("stat-low-stock");

  if (revEl) revEl.innerText = formatRupiah(totalRevenue);
  if (ordEl) ordEl.innerText = totalOrdersCount;
  if (prdEl) prdEl.innerText = activeProductsCount;
  if (lowEl) lowEl.innerText = lowStockCount;

  // Render 5 pesanan terbaru di overview
  const recentOrdersEl = document.getElementById("overview-recent-orders");
  if (recentOrdersEl) {
    const recent = orders.slice(0, 5);
    if (recent.length === 0) {
      recentOrdersEl.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-slate-400 text-xs">Belum ada pesanan masuk</td></tr>`;
    } else {
      recentOrdersEl.innerHTML = recent.map(order => `
        <tr class="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
          <td class="py-3 px-4 text-xs font-bold text-blue-600">${order.id}</td>
          <td class="py-3 px-4 text-xs font-medium text-slate-800">${order.customer.name}</td>
          <td class="py-3 px-4 text-xs text-slate-500">${order.items.length} item</td>
          <td class="py-3 px-4 text-xs font-bold text-slate-900">${formatRupiah(order.total)}</td>
          <td class="py-3 px-4 text-xs">${getStatusBadge(order.status)}</td>
        </tr>
      `).join("");
    }
  }

  // Render Top 4 Produk Terlaris
  const topProductsEl = document.getElementById("overview-top-products");
  if (topProductsEl) {
    const sorted = [...products].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0)).slice(0, 4);
    topProductsEl.innerHTML = sorted.map(p => `
      <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
        <img src="${p.image}" class="w-12 h-12 rounded-lg object-cover flex-shrink-0" onerror="this.src='img/prod-001.jpg'" />
        <div class="flex-1 min-w-0">
          <h4 class="text-xs font-bold text-slate-800 truncate">${p.name}</h4>
          <p class="text-[11px] text-slate-500">${p.category} • Stok: ${p.stock}</p>
        </div>
        <div class="text-right flex-shrink-0">
          <span class="text-xs font-bold text-blue-600">${p.soldCount || 0}</span>
          <span class="block text-[10px] text-slate-400">terjual</span>
        </div>
      </div>
    `).join("");
  }
}

function getStatusBadge(status) {
  const map = {
    "Menunggu Pembayaran": `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">Menunggu Pembayaran</span>`,
    "Diproses": `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">Diproses</span>`,
    "Dikirim": `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800">Dikirim</span>`,
    "Selesai": `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">Selesai</span>`,
    "Dibatalkan": `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800">Dibatalkan</span>`
  };
  return map[status] || `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-800">${status}</span>`;
}

// ==========================================
// TAB 2: KELOLA PRODUK (CRUD)
// ==========================================

function renderProductsTable() {
  const tableBody = document.getElementById("seller-products-table");
  if (!tableBody) return;

  let products = getProducts();

  if (productSearchQuery.trim() !== "") {
    const q = productSearchQuery.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }

  if (products.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-slate-400 text-xs">Belum ada data produk yang cocok.</td></tr>`;
    return;
  }

  tableBody.innerHTML = products.map(product => `
    <tr class="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
      <!-- Foto & Nama -->
      <td class="py-3 px-4">
        <div class="flex items-center gap-3">
          <img src="${product.image}" alt="${product.name}" 
            class="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
            onerror="this.src='img/prod-001.jpg'" />
          <div class="min-w-0">
            <h4 class="font-bold text-slate-800 text-xs sm:text-sm line-clamp-1">${product.name}</h4>
            <span class="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">${product.category}</span>
          </div>
        </div>
      </td>

      <!-- Harga -->
      <td class="py-3 px-4">
        <span class="font-bold text-slate-900 text-xs sm:text-sm">${formatRupiah(product.price)}</span>
        ${product.originalPrice && product.originalPrice > product.price ? `
          <span class="block text-[11px] text-slate-400 line-through">${formatRupiah(product.originalPrice)}</span>
        ` : ""}
      </td>

      <!-- Stok -->
      <td class="py-3 px-4">
        <span class="font-semibold text-xs ${product.stock <= 5 ? "text-rose-600 bg-rose-50 px-2 py-0.5 rounded" : "text-slate-700"}">
          ${product.stock} pcs
        </span>
      </td>

      <!-- Terjual & Rating -->
      <td class="py-3 px-4 text-xs text-slate-600">
        <div>${product.soldCount || 0} terjual</div>
        <div class="text-amber-500 font-semibold">★ ${product.rating ? Number(product.rating).toFixed(1) : "5.0"}</div>
      </td>

      <!-- ID -->
      <td class="py-3 px-4 text-xs font-mono text-slate-400">
        ${product.id}
      </td>

      <!-- Aksi -->
      <td class="py-3 px-4 text-right">
        <div class="flex items-center justify-end gap-2">
          <button onclick="openEditProductModal('${product.id}')" 
            class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Produk">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <button onclick="confirmDeleteProduct('${product.id}')" 
            class="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Hapus Produk">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join("");
}

// Modal Tambah / Edit Produk
function openAddProductModal() {
  editingProductId = null;
  document.getElementById("product-modal-title").innerText = "Tambah Produk Baru";
  document.getElementById("form-product-name").value = "";
  document.getElementById("form-product-category").value = "Elektronik";
  document.getElementById("form-product-price").value = "";
  document.getElementById("form-product-original-price").value = "";
  document.getElementById("form-product-stock").value = "10";
  document.getElementById("form-product-badge").value = "";
  document.getElementById("form-product-image").value = "img/prod-009.jpg";
  document.getElementById("form-product-desc").value = "";

  document.getElementById("product-modal").classList.remove("hidden");
}

function openEditProductModal(id) {
  const product = getProductById(id);
  if (!product) return;

  editingProductId = id;
  document.getElementById("product-modal-title").innerText = `Edit Produk (${product.id})`;
  document.getElementById("form-product-name").value = product.name;
  document.getElementById("form-product-category").value = product.category;
  document.getElementById("form-product-price").value = product.price;
  document.getElementById("form-product-original-price").value = product.originalPrice || "";
  document.getElementById("form-product-stock").value = product.stock;
  document.getElementById("form-product-badge").value = product.badge || "";
  document.getElementById("form-product-image").value = product.image;
  document.getElementById("form-product-desc").value = product.description || "";

  document.getElementById("product-modal").classList.remove("hidden");
}

function closeProductModal() {
  document.getElementById("product-modal").classList.add("hidden");
}

function handleProductFormSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("form-product-name").value.trim();
  const category = document.getElementById("form-product-category").value.trim();
  const price = Number(document.getElementById("form-product-price").value);
  const originalPrice = Number(document.getElementById("form-product-original-price").value) || price;
  const stock = Number(document.getElementById("form-product-stock").value);
  const badge = document.getElementById("form-product-badge").value.trim();
  const image = document.getElementById("form-product-image").value.trim();
  const description = document.getElementById("form-product-desc").value.trim();

  if (!name || isNaN(price)) {
    showToast("Nama dan harga produk wajib diisi!", "warning");
    return;
  }

  if (editingProductId) {
    updateProduct(editingProductId, {
      name,
      category,
      price,
      originalPrice,
      stock,
      badge,
      image,
      description
    });
    showToast(`Produk "${name}" berhasil diperbarui`, "success");
  } else {
    addProduct({
      name,
      category,
      price,
      originalPrice,
      stock,
      badge,
      image,
      description,
      rating: 5.0,
      soldCount: 0,
      reviews: []
    });
    showToast(`Produk baru "${name}" berhasil ditambahkan!`, "success");
  }

  closeProductModal();
  refreshAllSellerViews();
}

function confirmDeleteProduct(id) {
  const product = getProductById(id);
  if (!product) return;

  if (confirm(`Apakah Anda yakin ingin menghapus produk "${product.name}"?`)) {
    deleteProduct(id);
    showToast("Produk berhasil dihapus", "info");
    refreshAllSellerViews();
  }
}

function pickPresetImage(url) {
  document.getElementById("form-product-image").value = url;
}

// ==========================================
// TAB 3: KELOLA PESANAN (ORDERS)
// ==========================================

function filterOrderStatus(status) {
  orderStatusFilter = status;

  const buttons = document.querySelectorAll(".order-filter-btn");
  buttons.forEach(btn => {
    if (btn.dataset.status === status) {
      btn.classList.add("bg-blue-600", "text-white");
      btn.classList.remove("bg-white", "text-slate-600");
    } else {
      btn.classList.remove("bg-blue-600", "text-white");
      btn.classList.add("bg-white", "text-slate-600");
    }
  });

  renderOrdersTable();
}

function renderOrdersTable() {
  const container = document.getElementById("seller-orders-list");
  if (!container) return;

  let orders = getOrders();

  if (orderStatusFilter !== "all") {
    orders = orders.filter(o => o.status === orderStatusFilter);
  }

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 bg-white rounded-2xl border border-slate-200">
        <p class="text-xs text-slate-400">Tidak ada pesanan dengan status ini.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = orders.map(order => `
    <div class="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
      
      <!-- Baris Atas: Info Pesanan & Status -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <span class="font-extrabold text-blue-600 text-sm font-mono">${order.id}</span>
          <span class="text-xs text-slate-400">•</span>
          <span class="text-xs text-slate-500">${order.createdAt}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-500">Status Saat Ini:</span>
          ${getStatusBadge(order.status)}
        </div>
      </div>

      <!-- Baris Tengah: Info Pembeli & Detail Item -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <!-- Info Pembeli & Pengiriman -->
        <div class="text-xs space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
          <div class="font-bold text-slate-800 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            <span>${order.customer.name} (${order.customer.phone})</span>
          </div>
          <div class="text-slate-600">Alamat: ${order.customer.address}, ${order.customer.city}</div>
          <div class="text-slate-500 flex items-center gap-2">
            <span>Kurir: <strong>${order.courier || "JNE Express"}</strong></span>
            <span>•</span>
            <span>No. Resi: <strong>${order.trackingNumber || "-"}</strong></span>
          </div>
          <div class="text-slate-600">
            Metode Bayar: <span class="font-semibold text-slate-800">${order.paymentMethod}</span>
          </div>
        </div>

        <!-- Daftar Item yang Dipesan -->
        <div class="text-xs space-y-2">
          <div class="font-semibold text-slate-700">Daftar Produk (${order.items.length}):</div>
          <div class="space-y-1.5 max-h-24 overflow-y-auto pr-1">
            ${order.items.map(item => `
              <div class="flex items-center justify-between py-1 border-b border-slate-50">
                <div class="flex items-center gap-2">
                  <img src="${item.image}" class="w-7 h-7 rounded object-cover flex-shrink-0" onerror="this.src='img/prod-001.jpg'" />
                  <span class="text-slate-800 font-medium truncate max-w-[180px]">${item.name}</span>
                  <span class="text-slate-400 font-normal">x${item.quantity}</span>
                </div>
                <span class="font-semibold text-slate-700">${formatRupiah(item.price * item.quantity)}</span>
              </div>
            `).join("")}
          </div>
          <div class="flex justify-between font-bold text-slate-900 pt-1 text-sm">
            <span>Total Transaksi:</span>
            <span class="text-blue-600">${formatRupiah(order.total)}</span>
          </div>
        </div>

      </div>

      <!-- Baris Bawah: Kontrol Ubah Status Pesanan -->
      <div class="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 p-3 rounded-xl">
        <div class="flex items-center gap-2 text-xs">
          <label class="font-semibold text-slate-700">Ubah Status:</label>
          <select onchange="changeOrderStatus('${order.id}', this.value)" class="bg-white border border-slate-300 text-xs font-semibold rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-500">
            <option value="Menunggu Pembayaran" ${order.status === "Menunggu Pembayaran" ? "selected" : ""}>Menunggu Pembayaran</option>
            <option value="Diproses" ${order.status === "Diproses" ? "selected" : ""}>Diproses (Packing)</option>
            <option value="Dikirim" ${order.status === "Dikirim" ? "selected" : ""}>Dikirim (Dalam Perjalanan)</option>
            <option value="Selesai" ${order.status === "Selesai" ? "selected" : ""}>Selesai (Diterima)</option>
            <option value="Dibatalkan" ${order.status === "Dibatalkan" ? "selected" : ""}>Dibatalkan</option>
          </select>
        </div>

        <button onclick="promptTrackingNumber('${order.id}', '${order.trackingNumber || ""}')" class="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
          <span>Input / Ubah Resi</span>
        </button>
      </div>

    </div>
  `).join("");
}

function changeOrderStatus(orderId, newStatus) {
  updateOrderStatus(orderId, newStatus);
  showToast(`Status pesanan #${orderId} diubah menjadi "${newStatus}"`, "success");
  refreshAllSellerViews();
}

function promptTrackingNumber(orderId, currentResi) {
  const newResi = prompt("Masukkan nomor resi pengiriman kurir:", currentResi === "-" ? "" : currentResi);
  if (newResi !== null) {
    const trimmed = newResi.trim();
    updateOrderStatus(orderId, "Dikirim", trimmed || "-");
    showToast(`Nomor resi untuk #${orderId} berhasil disimpan!`, "success");
    refreshAllSellerViews();
  }
}

// ==========================================
// TAB 4: PENGATURAN & SINKRONISASI (NAMA TOKO & LOGO)
// ==========================================

function handleSettingsFormSubmit(e) {
  e.preventDefault();

  const storeName = document.getElementById("setting-store-name").value.trim();
  const storeTagline = document.getElementById("setting-store-tagline").value.trim();
  const sellerName = document.getElementById("setting-seller-name").value.trim();
  const sellerPhone = document.getElementById("setting-seller-phone").value.trim();
  const sellerEmail = document.getElementById("setting-seller-email").value.trim();
  const address = document.getElementById("setting-store-address").value.trim();
  const flatShippingFee = Number(document.getElementById("setting-shipping-fee").value) || 15000;

  if (!storeName) {
    showToast("Nama toko tidak boleh kosong!", "warning");
    return;
  }

  const currentSettings = getStoreSettings();
  const newSettings = {
    ...currentSettings,
    storeName,
    storeTagline,
    sellerName: sellerName || "Admin Toko",
    sellerPhone,
    sellerEmail,
    address,
    flatShippingFee
  };

  // Jika ada logo baru yang diunggah
  if (uploadedLogoDataUrl !== null) {
    newSettings.storeLogo = uploadedLogoDataUrl;
  }

  saveStoreSettings(newSettings);
  showToast("Pengaturan toko dan logo berhasil disimpan!", "success");
  renderStoreProfile();
}

function handleLogoFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showToast("Mohon pilih file gambar yang valid (PNG, JPG, WebP, dsb)!", "error");
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    showToast("Ukuran logo disarankan maksimal 2 MB!", "warning");
  }

  const reader = new FileReader();
  reader.onload = function(event) {
    uploadedLogoDataUrl = event.target.result;
    
    // Tampilkan preview instan
    const logoPreview = document.getElementById("setting-logo-preview");
    const logoPlaceholder = document.getElementById("setting-logo-placeholder");
    if (logoPreview && logoPlaceholder) {
      logoPreview.src = uploadedLogoDataUrl;
      logoPreview.classList.remove("hidden");
      logoPlaceholder.classList.add("hidden");
    }

    showToast("Logo berhasil dipilih. Klik 'Simpan Pengaturan Toko' untuk menerapkan.", "info");
  };
  reader.readAsDataURL(file);
}

function handleRemoveLogoClick() {
  uploadedLogoDataUrl = "";
  const logoPreview = document.getElementById("setting-logo-preview");
  const logoPlaceholder = document.getElementById("setting-logo-placeholder");
  if (logoPreview && logoPlaceholder) {
    logoPreview.src = "";
    logoPreview.classList.add("hidden");
    logoPlaceholder.classList.remove("hidden");
  }
  showToast("Logo toko di-reset. Jangan lupa klik 'Simpan Pengaturan Toko'.", "info");
}

function handleResetSettingsOnlyClick() {
  if (confirm("Kembalikan nama toko, slogan, dan logo ke profil bawaan?")) {
    uploadedLogoDataUrl = null;
    resetSettingsOnly();
    renderStoreProfile();
  }
}

function handleResetAllDataClick() {
  if (confirm("PERINGATAN: Apakah Anda yakin ingin mereset SELURUH data toko kembali ke data demo bawaan (24 Produk, Pesanan, Keranjang, dan Pengaturan Toko)?")) {
    uploadedLogoDataUrl = null;
    resetAllData();
    refreshAllSellerViews();
  }
}

function setupSellerEvents() {
  const productForm = document.getElementById("product-form");
  if (productForm) {
    productForm.addEventListener("submit", handleProductFormSubmit);
  }

  const searchInput = document.getElementById("seller-search-products");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      productSearchQuery = e.target.value;
      renderProductsTable();
    });
  }

  const settingsForm = document.getElementById("store-settings-form");
  if (settingsForm) {
    settingsForm.addEventListener("submit", handleSettingsFormSubmit);
  }

  const logoFileInput = document.getElementById("setting-logo-file-input");
  if (logoFileInput) {
    logoFileInput.addEventListener("change", handleLogoFileChange);
  }
}
