// js/buyer.js
// Logika untuk Interface Pembeli (Storefront, Detail Modal dengan Rating & Ulasan, Real-time Sync)

let currentCategory = "Semua";
let searchQuery = "";
let sortBy = "default";
let appliedPromo = null; // { code: 'DISKON10', percent: 10, discountAmount: 0 }
let activeHeroProductId = "PROD-001";
let activeDetailProduct = null;
let detailQty = 1;
let selectedReviewStars = 5;

document.addEventListener("DOMContentLoaded", () => {
  renderStoreInfo();
  renderCategories();
  renderProducts();
  initHeroShowcase();
  updateCartBadge();
  setupEventListeners();

  // Dengarkan perubahan data antar tab/window (misal admin ganti nama toko, upload logo, ubah produk)
  window.addEventListener("toko-storage-update", () => {
    renderStoreInfo();
    renderProducts();
    updateCartBadge();
    if (activeDetailProduct) {
      // Re-fetch active product to reflect updated reviews/stock
      const updated = getProductById(activeDetailProduct.id);
      if (updated) openProductDetail(updated.id);
    }
    if (document.getElementById("cart-drawer") && !document.getElementById("cart-drawer").classList.contains("hidden")) {
      renderCartDrawer();
    }
  });

  window.addEventListener("storage", () => {
    renderStoreInfo();
    renderProducts();
    updateCartBadge();
  });
});

// ==========================================
// SINKRONISASI IDENTITAS TOKO & LOGO
// ==========================================

function renderStoreInfo() {
  const settings = getStoreSettings();

  // Update Navbar Store Name & Logo
  const navName = document.getElementById("navbar-store-name");
  const navTagline = document.getElementById("navbar-store-tagline");
  const navLogoBox = document.getElementById("navbar-logo-box");

  if (navName) {
    navName.innerHTML = escapeHtml(settings.storeName || "Toko Berkah");
  }
  if (navTagline) {
    navTagline.innerText = settings.storeTagline || "Marketplace & Official Store";
  }
  if (navLogoBox) {
    if (settings.storeLogo) {
      navLogoBox.innerHTML = `<img src="${settings.storeLogo}" alt="Logo" class="w-full h-full object-contain p-0.5" />`;
    } else {
      navLogoBox.innerHTML = `<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>`;
    }
  }

  // Update Footer Info
  const footerName = document.getElementById("footer-store-name");
  const footerTagline = document.getElementById("footer-store-tagline");
  const footerLogoBox = document.getElementById("footer-logo-box");
  const footerPhone = document.getElementById("footer-phone");
  const footerEmail = document.getElementById("footer-email");
  const footerAddress = document.getElementById("footer-address");

  if (footerName) footerName.innerText = settings.storeName || "Toko Berkah";
  if (footerTagline) footerTagline.innerText = settings.storeTagline || "Platform belanja online terpercaya dengan integrasi portal penjual & pembeli.";
  if (footerPhone) footerPhone.innerText = settings.sellerPhone || "0812-3456-7890";
  if (footerEmail) footerEmail.innerText = settings.sellerEmail || "halo@tokoberkah.com";
  if (footerAddress) footerAddress.innerText = settings.address || "Jl. Pemuda No. 100, Jakarta Pusat";

  if (footerLogoBox) {
    if (settings.storeLogo) {
      footerLogoBox.innerHTML = `<img src="${settings.storeLogo}" alt="Logo" class="w-full h-full object-contain p-0.5" />`;
    } else {
      const initials = (settings.storeName || "TB").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
      footerLogoBox.innerText = initials;
    }
  }

  // Update document title
  document.title = `${settings.storeName || "Toko Berkah"} - Marketplace & Official Store`;
}

// ==========================================
// HERO BANNER SHOWCASE WIDGET
// ==========================================

function initHeroShowcase() {
  switchHeroShowcase("PROD-001");
}

function switchHeroShowcase(productId) {
  const product = getProductById(productId);
  if (!product) return;

  activeHeroProductId = productId;

  const imgEl = document.getElementById("hero-showcase-img");
  const badgeEl = document.getElementById("hero-showcase-badge");
  const catEl = document.getElementById("hero-showcase-category");
  const ratingEl = document.getElementById("hero-showcase-rating");
  const titleEl = document.getElementById("hero-showcase-title");
  const priceEl = document.getElementById("hero-showcase-price");
  const origEl = document.getElementById("hero-showcase-original");

  if (imgEl) imgEl.src = product.image;
  if (badgeEl) badgeEl.innerText = product.badge || "Pilihan Terbaik";
  if (catEl) catEl.innerText = product.category;
  if (ratingEl) ratingEl.innerText = `${product.rating ? Number(product.rating).toFixed(1) : "5.0"} (${product.soldCount || 0} terjual)`;
  if (titleEl) titleEl.innerText = product.name;
  if (priceEl) priceEl.innerText = formatRupiah(product.price);
  if (origEl) {
    if (product.originalPrice && product.originalPrice > product.price) {
      origEl.innerText = formatRupiah(product.originalPrice);
      origEl.classList.remove("hidden");
    } else {
      origEl.classList.add("hidden");
    }
  }
}

function openHeroShowcaseDetail() {
  if (activeHeroProductId) {
    openProductDetail(activeHeroProductId);
  }
}

function applyHeroVoucher() {
  const promoInput = document.getElementById("promo-input");
  if (promoInput) promoInput.value = "DISKON10";
  openCartDrawer();
  applyPromoCode();
}

// ==========================================
// RENDER KATALOG & KATEGORI (24+ PRODUK)
// ==========================================

function getAvailableCategories() {
  const products = getProducts();
  const cats = new Set(products.map(p => p.category).filter(Boolean));
  return ["Semua", ...Array.from(cats)];
}

function renderCategories() {
  const container = document.getElementById("category-list");
  if (!container) return;

  const categories = getAvailableCategories();
  container.innerHTML = categories.map(cat => `
    <button onclick="setCategory('${cat}')" 
      class="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shadow-sm ${
        currentCategory === cat
          ? "bg-blue-600 text-white shadow-blue-200"
          : "bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
      }">
      ${cat}
    </button>
  `).join("");
}

function setCategory(cat) {
  currentCategory = cat;
  renderCategories();
  renderProducts();
}

function renderProducts() {
  const grid = document.getElementById("product-grid");
  const emptyState = document.getElementById("empty-products");
  if (!grid) return;

  let products = getProducts();

  // Filter Kategori
  if (currentCategory !== "Semua") {
    products = products.filter(p => p.category === currentCategory);
  }

  // Filter Pencarian
  if (searchQuery.trim() !== "") {
    const q = searchQuery.toLowerCase();
    products = products.filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  }

  // Pengurutan (Sorting)
  if (sortBy === "price-low") {
    products.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-high") {
    products.sort((a, b) => b.price - a.price);
  } else if (sortBy === "sold") {
    products.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
  } else if (sortBy === "rating") {
    products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  if (products.length === 0) {
    grid.innerHTML = "";
    if (emptyState) emptyState.classList.remove("hidden");
    return;
  }

  if (emptyState) emptyState.classList.add("hidden");

  grid.innerHTML = products.map(product => {
    const isOutOfStock = product.stock <= 0;
    const discountPercent = product.originalPrice > product.price 
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
      : 0;
    const reviewCount = product.reviews ? product.reviews.length : 0;

    return `
      <div class="product-card bg-white rounded-2xl overflow-hidden border border-slate-200/80 flex flex-col justify-between group shadow-sm hover:shadow-md transition-all duration-300">
        <!-- Thumbnail Foto -->
        <div class="relative overflow-hidden bg-slate-100 aspect-square cursor-pointer" onclick="openProductDetail('${product.id}')">
          <img src="${product.image}" alt="${product.name}" 
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onerror="this.src='img/prod-001.jpg'" />
          
          <!-- Badges -->
          <div class="absolute top-3 left-3 flex flex-col gap-1 items-start">
            ${discountPercent > 0 ? `
              <span class="bg-rose-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                -${discountPercent}%
              </span>
            ` : ""}
            ${product.badge ? `
              <span class="bg-amber-500 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
                ${product.badge}
              </span>
            ` : ""}
          </div>

          ${isOutOfStock ? `
            <div class="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
              <span class="bg-rose-600 text-white font-bold text-xs px-3 py-1.5 rounded-full uppercase tracking-wider">
                Stok Habis
              </span>
            </div>
          ` : ""}
        </div>

        <!-- Detail Konten -->
        <div class="p-4 sm:p-5 flex flex-col flex-1 justify-between">
          <div>
            <div class="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span class="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-md text-[11px]">
                ${product.category || "Umum"}
              </span>
              <div class="flex items-center gap-1 text-amber-500 font-bold text-xs">
                <span>★</span>
                <span>${product.rating ? Number(product.rating).toFixed(1) : "5.0"}</span>
                <span class="text-slate-400 font-normal">(${reviewCount > 0 ? reviewCount : product.soldCount || 0})</span>
              </div>
            </div>

            <h3 onclick="openProductDetail('${product.id}')" 
              class="font-bold text-slate-800 text-sm sm:text-base line-clamp-2 hover:text-blue-600 cursor-pointer mt-1">
              ${product.name}
            </h3>

            <p class="text-xs text-slate-500 line-clamp-2 mt-1 mb-3">
              ${product.description || "Tidak ada deskripsi"}
            </p>
          </div>

          <div>
            <div class="flex items-baseline gap-2 mb-3">
              <span class="text-base sm:text-lg font-black text-blue-600">
                ${formatRupiah(product.price)}
              </span>
              ${product.originalPrice && product.originalPrice > product.price ? `
                <span class="text-xs text-slate-400 line-through">
                  ${formatRupiah(product.originalPrice)}
                </span>
              ` : ""}
            </div>

            <div class="flex items-center justify-between text-xs text-slate-500 mb-3">
              <span>Stok: <strong class="${product.stock <= 5 ? "text-rose-600 font-bold" : "text-slate-700"}">${product.stock} pcs</strong></span>
              ${product.stock <= 5 && product.stock > 0 ? `<span class="text-rose-500 font-semibold text-[11px]">Stok menipis!</span>` : ""}
            </div>

            <div class="grid grid-cols-2 gap-2 pt-1">
              <button onclick="openProductDetail('${product.id}')" 
                class="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                Detail
              </button>
              <button onclick="handleAddToCartClick('${product.id}')" 
                ${isOutOfStock ? "disabled" : ""}
                class="w-full py-2 px-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  isOutOfStock 
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow"
                }">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                <span>+ Keranjang</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function handleAddToCartClick(id) {
  addToCart(id, 1);
  updateCartBadge();
}

// ==========================================
// MODAL DETAIL PRODUK (ENLARGED & REVIEWS)
// ==========================================

function openProductDetail(id) {
  const product = getProductById(id);
  if (!product) return;

  activeDetailProduct = product;
  detailQty = 1;

  // Basic Information
  document.getElementById("modal-detail-id").innerText = product.id;
  document.getElementById("modal-detail-img").src = product.image;
  document.getElementById("modal-detail-cat").innerText = product.category;
  document.getElementById("modal-detail-title").innerText = product.name;
  document.getElementById("modal-detail-price").innerText = formatRupiah(product.price);
  
  // Badges container
  const badgeBox = document.getElementById("modal-detail-badge-box");
  const discountPercent = product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;
  
  if (badgeBox) {
    badgeBox.innerHTML = `
      ${discountPercent > 0 ? `<span class="bg-rose-500 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-md">-${discountPercent}%</span>` : ""}
      ${product.badge ? `<span class="bg-amber-500 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-md">${product.badge}</span>` : ""}
    `;
  }

  // Price & Savings
  const originalPriceEl = document.getElementById("modal-detail-original-price");
  const savingsEl = document.getElementById("modal-detail-savings");
  if (product.originalPrice && product.originalPrice > product.price) {
    originalPriceEl.innerText = formatRupiah(product.originalPrice);
    originalPriceEl.classList.remove("hidden");
    const savingsAmount = product.originalPrice - product.price;
    savingsEl.innerText = `Hemat ${formatRupiah(savingsAmount)} (${discountPercent}% OFF)`;
    savingsEl.classList.remove("hidden");
  } else {
    originalPriceEl.classList.add("hidden");
    savingsEl.classList.add("hidden");
  }

  const ratingScore = product.rating ? Number(product.rating).toFixed(1) : "5.0";
  document.getElementById("modal-detail-rating").innerText = ratingScore;
  document.getElementById("modal-detail-sold").innerText = `${product.soldCount || 0} terjual`;
  document.getElementById("modal-detail-desc").innerText = product.description || "Deskripsi produk belum diatur oleh penjual.";
  document.getElementById("modal-detail-stock").innerText = `${product.stock} pcs`;
  document.getElementById("modal-detail-qty").innerText = detailQty;

  // Buttons availability check
  const btnBuy = document.getElementById("modal-btn-buy");
  const btnCart = document.getElementById("modal-btn-cart");
  if (product.stock <= 0) {
    btnBuy.disabled = true;
    btnCart.disabled = true;
    btnBuy.innerText = "Stok Habis";
    btnBuy.classList.add("opacity-50", "cursor-not-allowed");
    btnCart.classList.add("opacity-50", "cursor-not-allowed");
  } else {
    btnBuy.disabled = false;
    btnCart.disabled = false;
    btnBuy.innerText = "Beli Sekarang";
    btnBuy.classList.remove("opacity-50", "cursor-not-allowed");
    btnCart.classList.remove("opacity-50", "cursor-not-allowed");
  }

  // Render Ratings and Reviews
  renderProductReviewsInModal(product);

  // Reset form
  const reviewFormBox = document.getElementById("review-form-box");
  if (reviewFormBox) reviewFormBox.classList.add("hidden");
  selectedReviewStars = 5;
  updateReviewStarDisplay();

  document.getElementById("product-detail-modal").classList.remove("hidden");
}

function closeProductDetail() {
  document.getElementById("product-detail-modal").classList.add("hidden");
  activeDetailProduct = null;
}

function changeDetailQty(amount) {
  if (!activeDetailProduct) return;
  const newQty = detailQty + amount;
  if (newQty >= 1 && newQty <= activeDetailProduct.stock) {
    detailQty = newQty;
    document.getElementById("modal-detail-qty").innerText = detailQty;
  } else if (newQty > activeDetailProduct.stock) {
    showToast(`Stok maksimal produk ini hanya ${activeDetailProduct.stock} pcs`, "warning");
  }
}

function addDetailToCart() {
  if (!activeDetailProduct) return;
  addToCart(activeDetailProduct.id, detailQty);
  updateCartBadge();
  closeProductDetail();
}

function buyNowFromDetail() {
  if (!activeDetailProduct) return;
  addToCart(activeDetailProduct.id, detailQty);
  updateCartBadge();
  closeProductDetail();
  openCartDrawer();
}

// ==========================================
// RENDER RATING & ULASAN PEMBELI
// ==========================================

function renderProductReviewsInModal(product) {
  const reviews = product.reviews || [];
  const totalReviews = reviews.length;

  document.getElementById("modal-detail-reviews-count").innerText = totalReviews;
  document.getElementById("reviews-badge-count").innerText = `${totalReviews} Ulasan`;

  // Summary box
  const score = product.rating ? Number(product.rating).toFixed(1) : "5.0";
  document.getElementById("modal-summary-score").innerText = score;
  document.getElementById("modal-summary-total").innerText = `Berdasarkan ${totalReviews} ulasan pembeli`;

  // Render golden stars
  const roundedStars = Math.round(Number(score));
  document.getElementById("modal-summary-stars").innerHTML = "★".repeat(roundedStars) + "☆".repeat(Math.max(0, 5 - roundedStars));

  // Calculate Breakdown for 5 to 1 stars
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    const star = Math.min(5, Math.max(1, Math.round(Number(r.rating || 5))));
    counts[star] = (counts[star] || 0) + 1;
  });

  const ratingBarsEl = document.getElementById("modal-rating-bars");
  if (ratingBarsEl) {
    ratingBarsEl.innerHTML = [5, 4, 3, 2, 1].map(star => {
      const count = counts[star] || 0;
      const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : (star === 5 ? 100 : 0);
      return `
        <div class="flex items-center gap-2 text-xs">
          <span class="w-12 text-slate-600 font-semibold flex items-center gap-1">${star} ★</span>
          <div class="flex-1 bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div class="bg-amber-400 h-2.5 rounded-full transition-all duration-500" style="width: ${pct}%"></div>
          </div>
          <span class="w-12 text-right text-slate-500 font-medium">${count} (${pct}%)</span>
        </div>
      `;
    }).join("");
  }

  // Render Reviews List
  const listEl = document.getElementById("modal-reviews-list");
  if (listEl) {
    if (reviews.length === 0) {
      listEl.innerHTML = `
        <div class="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200">
          <p class="text-xs text-slate-500">Belum ada ulasan untuk produk ini.</p>
          <button onclick="toggleReviewForm()" class="mt-2 text-xs font-bold text-blue-600 hover:underline">
            Jadilah yang pertama menulis ulasan!
          </button>
        </div>
      `;
    } else {
      listEl.innerHTML = reviews.map(rev => {
        const initials = (rev.author || "Pembeli").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
        const starNum = Number(rev.rating) || 5;
        const starStr = "★".repeat(starNum) + "☆".repeat(Math.max(0, 5 - starNum));

        return `
          <div class="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-2">
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                  ${initials}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h5 class="text-xs font-bold text-slate-900">${escapeHtml(rev.author)}</h5>
                    ${rev.verified ? `
                      <span class="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                        <svg class="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                        <span>Pembeli Terverifikasi</span>
                      </span>
                    ` : ""}
                  </div>
                  <div class="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                    <span class="text-amber-400 font-bold tracking-tight">${starStr}</span>
                    <span>•</span>
                    <span>${rev.date || "Baru saja"}</span>
                  </div>
                </div>
              </div>
            </div>
            <p class="text-xs text-slate-700 leading-relaxed pl-12">
              ${escapeHtml(rev.comment)}
            </p>
          </div>
        `;
      }).join("");
    }
  }
}

function toggleReviewForm() {
  const formBox = document.getElementById("review-form-box");
  if (!formBox) return;
  formBox.classList.toggle("hidden");
  if (!formBox.classList.contains("hidden")) {
    document.getElementById("review-input-name").focus();
  }
}

function selectReviewRating(star) {
  selectedReviewStars = Number(star);
  updateReviewStarDisplay();
}

function updateReviewStarDisplay() {
  const picker = document.getElementById("review-star-picker");
  const textEl = document.getElementById("review-selected-text");
  if (!picker) return;

  const buttons = picker.querySelectorAll("button");
  buttons.forEach((btn, idx) => {
    if (idx < selectedReviewStars) {
      btn.innerText = "★";
      btn.className = "text-2xl text-amber-400 hover:scale-125 transition-transform";
    } else {
      btn.innerText = "☆";
      btn.className = "text-2xl text-slate-300 hover:scale-125 transition-transform";
    }
  });

  const descriptions = {
    5: "5 Bintang (Sangat Puas / Sempurna)",
    4: "4 Bintang (Puas & Bagus)",
    3: "3 Bintang (Cukup Baik)",
    2: "2 Bintang (Kurang Memuaskan)",
    1: "1 Bintang (Kecewa)"
  };

  if (textEl) {
    textEl.innerText = descriptions[selectedReviewStars] || `${selectedReviewStars} Bintang`;
  }
}

function handleNewReviewSubmit(e) {
  e.preventDefault();
  if (!activeDetailProduct) return;

  const author = document.getElementById("review-input-name").value.trim();
  const comment = document.getElementById("review-input-comment").value.trim();

  if (!author || !comment) {
    showToast("Nama dan komentar ulasan wajib diisi!", "warning");
    return;
  }

  // Simpan ulasan ke database produk
  addProductReview(activeDetailProduct.id, {
    author,
    rating: selectedReviewStars,
    comment
  });

  showToast("Terima kasih! Ulasan Anda berhasil ditambahkan.", "success");

  // Re-fetch dan update view
  const updated = getProductById(activeDetailProduct.id);
  activeDetailProduct = updated;
  renderProductReviewsInModal(updated);
  renderProducts();

  // Reset & sembunyikan form
  document.getElementById("review-input-comment").value = "";
  toggleReviewForm();
}

// ==========================================
// KERANJANG BELANJA (CART DRAWER)
// ==========================================

function updateCartBadge() {
  const count = getCartCount();
  const badges = document.querySelectorAll(".cart-count-badge");
  badges.forEach(b => {
    b.innerText = count;
    if (count > 0) {
      b.classList.remove("hidden");
    } else {
      b.classList.add("hidden");
    }
  });
}

function openCartDrawer() {
  renderCartDrawer();
  const drawer = document.getElementById("cart-drawer");
  const panel = document.getElementById("cart-drawer-panel");
  drawer.classList.remove("hidden");
  setTimeout(() => {
    panel.classList.remove("translate-x-full");
  }, 10);
}

function closeCartDrawer() {
  const panel = document.getElementById("cart-drawer-panel");
  panel.classList.add("translate-x-full");
  setTimeout(() => {
    document.getElementById("cart-drawer").classList.add("hidden");
  }, 300);
}

function renderCartDrawer() {
  const cart = getCart();
  const itemsContainer = document.getElementById("cart-items-container");
  const emptyCartState = document.getElementById("cart-empty-state");
  const footerEl = document.getElementById("cart-footer");

  if (cart.length === 0) {
    itemsContainer.innerHTML = "";
    emptyCartState.classList.remove("hidden");
    footerEl.classList.add("hidden");
    return;
  }

  emptyCartState.classList.add("hidden");
  footerEl.classList.remove("hidden");

  itemsContainer.innerHTML = cart.map(item => `
    <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
      <img src="${item.image}" alt="${item.name}" 
        class="w-14 h-14 rounded-xl object-cover border border-slate-200 flex-shrink-0"
        onerror="this.src='img/prod-001.jpg'" />
      
      <div class="flex-1 min-w-0">
        <h4 class="font-bold text-slate-800 text-xs truncate">${item.name}</h4>
        <span class="text-blue-600 font-extrabold text-xs block mt-0.5">${formatRupiah(item.price)}</span>
        
        <div class="flex items-center gap-2 mt-2">
          <div class="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
            <button onclick="updateCartQty('${item.id}', ${item.quantity - 1})" class="px-2 py-0.5 text-xs font-bold text-slate-600 hover:bg-slate-100">-</button>
            <span class="px-2 text-xs font-semibold text-slate-800">${item.quantity}</span>
            <button onclick="updateCartQty('${item.id}', ${item.quantity + 1})" class="px-2 py-0.5 text-xs font-bold text-slate-600 hover:bg-slate-100">+</button>
          </div>
          <span class="text-[11px] text-slate-400">Total: ${formatRupiah(item.price * item.quantity)}</span>
        </div>
      </div>

      <button onclick="removeFromCart('${item.id}')" class="p-1.5 text-slate-400 hover:text-rose-600 transition-colors" title="Hapus">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
      </button>
    </div>
  `).join("");

  updateCartTotals();
}

function updateCartTotals() {
  const subtotal = getCartTotal();
  let discountAmount = 0;

  if (appliedPromo) {
    discountAmount = Math.round((subtotal * appliedPromo.percent) / 100);
    appliedPromo.discountAmount = discountAmount;
    document.getElementById("cart-discount-row").classList.remove("hidden");
    document.getElementById("cart-discount").innerText = `-${formatRupiah(discountAmount)} (${appliedPromo.percent}%)`;
  } else {
    document.getElementById("cart-discount-row").classList.add("hidden");
  }

  const grandTotal = Math.max(0, subtotal - discountAmount);

  document.getElementById("cart-subtotal").innerText = formatRupiah(subtotal);
  document.getElementById("cart-total").innerText = formatRupiah(grandTotal);
}

function applyPromoCode() {
  const input = document.getElementById("promo-input");
  const code = input.value.trim().toUpperCase();

  if (code === "DISKON10") {
    appliedPromo = { code: "DISKON10", percent: 10, discountAmount: 0 };
    showToast("Voucher DISKON10 berhasil dipasang! Diskon 10% diterapkan.", "success");
    updateCartTotals();
  } else if (code === "") {
    showToast("Masukkan kode kupon terlebih dahulu!", "warning");
  } else {
    showToast(`Kode "${code}" tidak valid atau telah kedaluwarsa!`, "error");
  }
}

// ==========================================
// MODAL CHECKOUT & BUAT PESANAN
// ==========================================

function openCheckoutModal() {
  const cart = getCart();
  if (cart.length === 0) {
    showToast("Keranjang Anda masih kosong!", "warning");
    return;
  }

  closeCartDrawer();
  updateCheckoutSummary();
  document.getElementById("checkout-modal").classList.remove("hidden");
}

function closeCheckoutModal() {
  document.getElementById("checkout-modal").classList.add("hidden");
}

function getSelectedCourierShippingFee() {
  const courierSelect = document.getElementById("checkout-courier");
  const val = courierSelect ? courierSelect.value : "JNE";
  const fees = {
    "JNE": 15000,
    "SICEPAT": 18000,
    "JNT": 16000,
    "GOSEND": 25000
  };
  return fees[val] || 15000;
}

function updateCheckoutSummary() {
  const cart = getCart();
  const subtotal = getCartTotal();
  const shippingFee = getSelectedCourierShippingFee();
  let discountAmount = appliedPromo ? appliedPromo.discountAmount : 0;

  const itemsContainer = document.getElementById("checkout-items-summary");
  if (itemsContainer) {
    itemsContainer.innerHTML = cart.map(item => `
      <div class="flex justify-between items-center py-1 text-slate-700 text-xs">
        <span class="truncate max-w-[240px]">${item.name} <span class="text-slate-400">x${item.quantity}</span></span>
        <span class="font-semibold">${formatRupiah(item.price * item.quantity)}</span>
      </div>
    `).join("");
  }

  document.getElementById("checkout-subtotal").innerText = formatRupiah(subtotal);
  document.getElementById("checkout-shipping").innerText = formatRupiah(shippingFee);

  const discountRow = document.getElementById("checkout-discount-row");
  if (discountAmount > 0) {
    discountRow.classList.remove("hidden");
    document.getElementById("checkout-discount").innerText = `-${formatRupiah(discountAmount)}`;
  } else {
    discountRow.classList.add("hidden");
  }

  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);
  document.getElementById("checkout-grand-total").innerText = formatRupiah(grandTotal);
}

function handleCheckoutSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("checkout-name").value.trim();
  const phone = document.getElementById("checkout-phone").value.trim();
  const city = document.getElementById("checkout-city").value.trim();
  const courier = document.getElementById("checkout-courier").value;
  const address = document.getElementById("checkout-address").value.trim();
  const paymentMethod = document.getElementById("checkout-payment").value;

  if (!name || !phone || !city || !address) {
    showToast("Lengkapi semua kolom formulir pengiriman!", "warning");
    return;
  }

  const cart = getCart();
  if (cart.length === 0) {
    showToast("Keranjang kosong!", "error");
    return;
  }

  const subtotal = getCartTotal();
  const shippingFee = getSelectedCourierShippingFee();
  let discountAmount = 0;
  if (appliedPromo) {
    discountAmount = Math.round((subtotal * appliedPromo.percent) / 100);
  }
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const newOrder = addOrder({
    customer: {
      name,
      phone,
      city,
      address
    },
    courier,
    paymentMethod,
    items: [...cart],
    subtotal,
    shippingFee,
    discount: discountAmount,
    total: grandTotal
  });

  // Kosongkan keranjang
  clearCart();
  appliedPromo = null;
  updateCartBadge();
  closeCheckoutModal();

  // Tampilkan invoice receipt modal
  openOrderSuccessModal(newOrder);
}

// ==========================================
// MODAL NOTIFIKASI PESANAN BERHASIL (RECEIPT)
// ==========================================

function openOrderSuccessModal(order) {
  document.getElementById("success-order-id").innerText = order.id;
  document.getElementById("success-customer-name").innerText = order.customer.name;
  document.getElementById("success-payment-method").innerText = order.paymentMethod;
  document.getElementById("success-total-amount").innerText = formatRupiah(order.total);
  document.getElementById("success-items-count").innerText = `${order.items.length} macam produk`;
  
  // Instruksi pembayaran simulasi
  const payInstruction = document.getElementById("success-payment-instruction");
  if (order.paymentMethod.includes("QRIS")) {
    payInstruction.innerHTML = `
      <div class="p-4 bg-blue-50 rounded-xl text-center border border-blue-100">
        <p class="text-xs text-blue-700 font-medium mb-2">Scan QRIS ini dengan GoPay / OVO / Dana / BCA Mobile:</p>
        <div class="inline-block p-2 bg-white rounded-lg shadow-sm">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=TOKO-BERKAH-${order.id}" class="w-32 h-32 mx-auto" alt="QRIS Demo" />
        </div>
        <p class="text-[11px] text-slate-500 mt-2">Kode Referensi: <strong>${order.id}</strong></p>
      </div>
    `;
  } else if (order.paymentMethod.includes("Transfer")) {
    payInstruction.innerHTML = `
      <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
        <p class="text-slate-600 mb-1">Silakan transfer tepat sejumlah: <strong class="text-blue-600">${formatRupiah(order.total)}</strong></p>
        <p class="text-slate-800 font-semibold">Bank BCA: <strong>8829-1029-3810</strong></p>
        <p class="text-slate-500">Atas Nama: PT Toko Berkah Indonesia</p>
      </div>
    `;
  } else {
    payInstruction.innerHTML = `
      <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800">
        Siapkan uang pas sejumlah <strong>${formatRupiah(order.total)}</strong> saat kurir tiba di alamat Anda.
      </div>
    `;
  }

  document.getElementById("order-success-modal").classList.remove("hidden");
}

function closeOrderSuccessModal() {
  document.getElementById("order-success-modal").classList.add("hidden");
}

// Helper XSS Escape
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ==========================================
// EVENT LISTENERS UMUM
// ==========================================

function setupEventListeners() {
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderProducts();
    });
  }

  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      sortBy = e.target.value;
      renderProducts();
    });
  }

  const courierSelect = document.getElementById("checkout-courier");
  if (courierSelect) {
    courierSelect.addEventListener("change", () => {
      updateCheckoutSummary();
    });
  }

  const checkoutForm = document.getElementById("checkout-form");
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", handleCheckoutSubmit);
  }
}
