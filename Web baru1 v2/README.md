# 🛍️ Toko Berkah - Website E-Commerce (2 Interface: Pembeli & Penjual)

Selamat datang! Folder ini berisi proyek website toko online siap pakai dengan **2 Interface terintegrasi**:
1. **Interface Pembeli (Storefront / Toko Online)** di file [`index.html`](file:///Users/mac/Documents/Web%20baru1/index.html)
2. **Interface Penjual (Seller Dashboard / Admin Toko)** di file [`seller.html`](file:///Users/mac/Documents/Web%20baru1/seller.html)

Keduanya telah terhubung secara otomatis menggunakan sistem **Local Database & Real-time State Synchronization** (`localStorage`). Artinya: jika Anda memesan barang atau mengubah ulasan di halaman Pembeli, atau mengubah nama toko dan produk di halaman Penjual, perubahan langsung tersinkronisasi secara otomatis antar tab!

---

## ✨ Fitur Baru yang Telah Diperbarui

1. **Banner Hero Full-Width**:
   - Banner hero kini berukuran **penuh (Full-Width)** melintasi layar dengan latar belakang gradien mewah gelap (`slate-950` ke `indigo-950`).
   - Dilengkapi kartu **Featured Showcase Interaktif** di sisi kanan untuk melihat produk unggulan secara bergantian, tombol klaim voucher `DISKON10`, dan strip 4 pilar garansi produk.

2. **Navbar Ramping & Kompak**:
   - Tinggi navbar dibuat lebih ramping dan elegan (`h-14` / 56px) menggantikan tampilan sebelumnya yang terlalu tebal.
   - Dilengkapi **efek hover expand** pada kotak pencarian yang melebar halus saat didekati kursor atau difokuskan.
   - Menampilkan nama toko dan logo resmi toko secara dinamis dari pengaturan penjual.

3. **24+ Produk Lengkap dengan Gambar Lokal**:
   - Katalog produk diperbanyak menjadi **24 produk** lintas kategori: *Elektronik*, *Fashion*, *Aksesoris*, dan *Kuliner*.
   - Seluruh foto produk telah diunduh dan tersimpan di folder lokal [`img/`](file:///Users/mac/Documents/Web%20baru1/img/) (`prod-001.jpg` s/d `prod-024.jpg`) sehingga tidak bergantung pada koneksi gambar eksternal.

4. **Modal Detail Produk Lebih Luas + Rating & Ulasan Pembeli**:
   - Ukuran modal detail produk diperbesar menjadi format leluasa (`max-w-5xl`).
   - **Sistem Rating Pembeli**: menampilkan nilai rating rata-rata (misal 4.9 ★), bar distribusi bintang (5★, 4★, 3★, 2★, 1★), dan jumlah ulasan.
   - **Daftar Ulasan Pembeli**: ulasan nyata dengan nama pelanggan, tanggal, lencana *Pembeli Terverifikasi*, dan bintang ulasan.
   - **Formulir Tulis Ulasan**: pembeli dapat langsung memilih jumlah bintang dan menulis ulasan baru yang langsung tersimpan di sistem.

5. **Pengaturan Profil Toko & Upload Logo di Seller Portal**:
   - Di tab **Pengaturan & Reset** di [`seller.html`](file:///Users/mac/Documents/Web%20baru1/seller.html), penjual kini dapat:
     - Mengubah **Nama Toko** dan **Slogan/Tagline**.
     - Mengunggah **Logo Resmi Toko** langsung dari komputer (didukung preview instan).
     - Mengubah kontak WhatsApp, email, dan alamat toko.
     - **Pusat Reset Fleksibel**: opsi Reset Profil Toko Saja atau Reset Seluruh Data Toko ke data demo bawaan.

---

## 📁 Struktur Direktori File

```text
Web baru1/
├── index.html              # 🛒 Interface Pembeli (Hero Full-width, Navbar Ramping, Detail Modal Luas + Ulasan)
├── seller.html             # 📊 Interface Penjual (Dashboard Omset, Kelola 24+ Produk, Pesanan, Ganti Nama & Logo)
├── img/                    # 🖼️ Folder Foto Produk Lokal (prod-001.jpg s/d prod-024.jpg)
├── css/
│   └── style.css           # Styling kustom, animasi hover, scrollbar, dan font
├── js/
│   ├── supabase-config.js  # Konfigurasi Supabase Client SDK (Publishable Key & Project URL)
│   ├── db.js               # Hybrid Database Manager (Supabase Cloud + LocalStorage Cache & Offline Fallback)
│   ├── buyer.js            # Logika storefront pembeli (rating breakdown, ulasan, keranjang, checkout)
│   └── seller.js           # Logika seller portal (dashboard, produk, pesanan, & integrasi Supabase)
├── data/
│   └── initial-data.js     # 24 katalog produk, ulasan bawaan, pesanan sampel, & profil default
├── supabase_setup.sql      # Script SQL lengkap (Tabel, RLS Security, Realtime, & 24 Produk Seed)
└── README.md               # Dokumentasi lengkap proyek
```

---

## ⚡ Integrasi Cloud Database (Supabase)

Website ini mendukung sistem **Hybrid Database** yang otomatis beralih antara Cloud Supabase dan LocalStorage:

1. **Jalankan Skrip Database di Supabase**:
   - Buka project Anda di [Supabase Dashboard](https://supabase.com/dashboard).
   - Masuk ke menu **SQL Editor** &rarr; **New Query**.
   - Salin isi file [`supabase_setup.sql`](file:///Users/mac/Documents/Web%20baru1/supabase_setup.sql) lalu klik tombol **Run**.
   - Skrip ini akan membuat tabel `products`, `orders`, `settings`, mengaktifkan keamanan RLS, Realtime broadcast, dan menginput 24 katalog produk awal secara otomatis.

2. **Sambungkan Website ke Supabase**:
   - Buka [`seller.html`](file:///Users/mac/Documents/Web%20baru1/seller.html) di browser Anda, lalu masuk ke tab **Pengaturan**.
   - Pada kartu **Integrasi Cloud Database (Supabase)**:
     - Masukkan **Supabase Project URL** Anda (contoh: `https://xyzabcdefg.supabase.co`).
     - Masukkan **Supabase Anon / Public API Key** Anda (didapatkan dari Supabase Dashboard &rarr; *Project Settings* &rarr; *API* &rarr; *Project API Keys* &rarr; `anon` `public`).
   - Klik **Simpan & Sambungkan**, lalu klik **Uji Koneksi Cloud** untuk memastikan status indikator menjadi hijau (**🟢 Terhubung ke Supabase Cloud**).
   - Klik tombol **Upload Semua Produk ke Supabase** untuk menyinkronkan seluruh 24 katalog produk ke database cloud.
   - Sekarang, setiap kali Anda **menambah produk baru**, **mengubah harga/stok**, atau **menghapus produk** dari web, perubahan akan otomatis ter-upload dan tersimpan di database Supabase secara real-time!

> **Penting Mengenai Keamanan Kunci API:**
> Website sisi browser (frontend) hanya memerlukan **Publishable Key** (`sb_publishable_...`). Kunci **Secret Key** (`sb_secret_...`) **TIDAK PERNAH** dimasukkan ke dalam kode JavaScript atau HTML publik demi mencegah pihak lain membajak atau menghapus database Anda.

---

## 🚀 Cara Menjalankan Website

Website ini **sudah siap 100% dan langsung bisa dijalankan**:

### Cara 1: Buka Langsung di Browser
1. Buka aplikasi **Finder** di Mac Anda.
2. Masuk ke folder: `Documents` > `Web baru1`.
3. Klik 2x file [`index.html`](file:///Users/mac/Documents/Web%20baru1/index.html) untuk belanja sebagai **Pembeli**.
4. Klik 2x file [`seller.html`](file:///Users/mac/Documents/Web%20baru1/seller.html) untuk masuk ke **Portal Penjual**.

### Cara 2: Menjalankan via Local Server (Rekomendasi)
Buka Terminal Mac Anda dan jalankan perintah:
```bash
cd "/Users/mac/Documents/Web baru1"
python3 -m http.server 3000
```
Lalu buka di browser:
- **Toko Pembeli**: [http://localhost:3000](http://localhost:3000)
- **Portal Penjual**: [http://localhost:3000/seller.html](http://localhost:3000/seller.html)
