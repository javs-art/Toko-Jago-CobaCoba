-- ============================================================
-- SQL SCHEMA & SETUP UNTUK TOKO BERKAH DI SUPABASE
-- Jalankan seluruh script ini di:
-- Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ============================================================

-- 1. TABEL PRODUK (products)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL,
    original_price NUMERIC DEFAULT 0,
    stock INTEGER DEFAULT 0,
    rating NUMERIC DEFAULT 5.0,
    sold_count INTEGER DEFAULT 0,
    image TEXT DEFAULT '',
    description TEXT DEFAULT '',
    badge TEXT DEFAULT '',
    reviews JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL PESANAN (orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer JSONB NOT NULL DEFAULT '{}'::jsonb,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    courier TEXT DEFAULT '-',
    payment_method TEXT DEFAULT '-',
    subtotal NUMERIC DEFAULT 0,
    shipping_fee NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    total NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Menunggu Pembayaran',
    tracking_number TEXT DEFAULT '-',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL PENGATURAN TOKO (settings)
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    store_name TEXT DEFAULT 'Toko Berkah Official',
    store_tagline TEXT DEFAULT 'Pusat Belanja Terlengkap, Termurah & Terpercaya',
    seller_name TEXT DEFAULT 'Admin Toko Berkah',
    seller_phone TEXT DEFAULT '0812-3456-7890',
    seller_email TEXT DEFAULT 'admin@tokoberkah.com',
    address TEXT DEFAULT 'Jl. Pemuda No. 100, Jakarta Pusat',
    free_shipping_min NUMERIC DEFAULT 300000,
    flat_shipping_fee NUMERIC DEFAULT 15000,
    store_logo TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- KEBIJAKAN KEAMANAN (ROW LEVEL SECURITY - RLS)
-- Mengizinkan akses baca dan tulis dari aplikasi web publik
-- ============================================================

-- Berikan hak akses tabel ke anon & authenticated
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Policy untuk products (izinkan SELECT, INSERT, UPDATE, DELETE & UPSERT)
DROP POLICY IF EXISTS "Public All Products" ON public.products;
DROP POLICY IF EXISTS "Public Read Products" ON public.products;
DROP POLICY IF EXISTS "Public Insert Products" ON public.products;
DROP POLICY IF EXISTS "Public Update Products" ON public.products;
DROP POLICY IF EXISTS "Public Delete Products" ON public.products;
CREATE POLICY "Public All Products" ON public.products FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public All Orders" ON public.orders;
DROP POLICY IF EXISTS "Public Read Orders" ON public.orders;
DROP POLICY IF EXISTS "Public Insert Orders" ON public.orders;
DROP POLICY IF EXISTS "Public Update Orders" ON public.orders;
DROP POLICY IF EXISTS "Public Delete Orders" ON public.orders;
CREATE POLICY "Public All Orders" ON public.orders FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public All Settings" ON public.settings;
DROP POLICY IF EXISTS "Public Read Settings" ON public.settings;
DROP POLICY IF EXISTS "Public Insert Settings" ON public.settings;
DROP POLICY IF EXISTS "Public Update Settings" ON public.settings;
CREATE POLICY "Public All Settings" ON public.settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- AKTIFKAN REALTIME (Sinkronisasi Langsung Antar Tab & Perangkat)
-- ============================================================
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- ============================================================
-- INITIAL DATA (24 PRODUK & PENGATURAN DEFAULT)
-- Mengisi produk jika tabel belum ada isinya (ON CONFLICT DO NOTHING)
-- ============================================================

INSERT INTO public.products (id, name, category, price, original_price, stock, rating, sold_count, image, description, badge, reviews) VALUES
('PROD-001', 'Headphone Wireless ANC Studio Pro', 'Elektronik', 899000, 1299000, 18, 4.9, 142, 'img/prod-001.jpg', 'Headphone nirkabel premium dengan teknologi Active Noise Cancelling (ANC), daya tahan baterai hingga 40 jam, mikrofon jernih, dan driver audio 40mm beresolusi tinggi.', 'Diskon 30%', '[{"id": "REV-001", "author": "Budi Santoso", "rating": 5, "date": "25 Okt 2026", "comment": "Kualitas suaranya luar biasa, fitur noise cancelling sangat kedap saat dipakai di kantor maupun kafe. Baterai awet berhari-hari!", "verified": true}, {"id": "REV-002", "author": "Siti Rahma", "rating": 5, "date": "21 Okt 2026", "comment": "Bantalan telinganya empuk dan tidak bikin sakit kepala meski dipakai meeting seharian. Recommended!", "verified": true}, {"id": "REV-003", "author": "Reza Fahlevi", "rating": 4, "date": "17 Okt 2026", "comment": "Bass-nya mantap, treble pas. Cuma butuh adaptasi sedikit dengan tombol ANC-nya. Overall mantul.", "verified": true}]'::jsonb),
('PROD-002', 'Smartwatch Sport Fitness Tracker V3', 'Elektronik', 499000, 750000, 25, 4.8, 98, 'img/prod-002.jpg', 'Jam tangan pintar dengan layar AMOLED tajam, sensor detak jantung 24/7, SpO2, pelacak tidur, tahan air 5ATM, dan 100+ mode olahraga otomatis.', 'Terlaris', '[{"id": "REV-004", "author": "Dimas Pratama", "rating": 5, "date": "23 Okt 2026", "comment": "Layar AMOLED-nya jernih banget bahkan di bawah terik matahari. Sinkronisasi ke smartphone lancar jaya.", "verified": true}, {"id": "REV-005", "author": "Anisa Putri", "rating": 4, "date": "19 Okt 2026", "comment": "Desain sporty dan elegan di tangan wanita. Strapnya nyaman dan sensor detak jantungnya cukup akurat.", "verified": true}]'::jsonb),
('PROD-003', 'Kemeja Flanel Casual Pria Slim-Fit', 'Fashion', 185000, 240000, 40, 4.7, 310, 'img/prod-003.jpg', 'Kemeja flanel katun 100% adem, lembut, dan tebal. Desain kotak modern cocok untuk gaya santai, kuliah, hingga hangout akhir pekan.', 'Populer', '[{"id": "REV-006", "author": "Fajar Nugraha", "rating": 5, "date": "24 Okt 2026", "comment": "Bahan flanelnya halus dan tidak panas saat dipakai siang hari. Ukuran M pas di badan tinggi 170cm.", "verified": true}, {"id": "REV-007", "author": "Doni Setiawan", "rating": 4, "date": "15 Okt 2026", "comment": "Warna persis seperti di foto, jahitan rapi. Pengiriman cepat sampai tujuan.", "verified": true}]'::jsonb),
('PROD-004', 'Tas Ransel Laptop Waterproof 20L', 'Aksesoris', 275000, 350000, 12, 4.8, 84, 'img/prod-004.jpg', 'Ransel ergonomis anti air dengan kompartemen laptop hingga 15.6 inci, slot botol minum, port USB charging eksternal, dan saku rahasia anti-maling.', 'Hemat', '[{"id": "REV-008", "author": "Hendri Kurniawan", "rating": 5, "date": "22 Okt 2026", "comment": "Bahan beneran waterproof diuji saat hujan gerimis. Laptop dan buku tetap aman kering.", "verified": true}, {"id": "REV-009", "author": "Maya Lestari", "rating": 5, "date": "14 Okt 2026", "comment": "Banyak kompartemen tersembunyi. Pas banget buat kerja kantor dan traveling singkat.", "verified": true}]'::jsonb),
('PROD-005', 'Sneakers Pria Urban Runner White', 'Fashion', 389000, 520000, 8, 4.9, 220, 'img/prod-005.jpg', 'Sepatu sneakers kasual dengan sol phylon empuk berbahan memory foam. Ringan, fleksibel, dan sangat nyaman dipakai seharian tanpa bikin pegal.', 'Diskon 25%', '[{"id": "REV-010", "author": "Bambang Wijaya", "rating": 5, "date": "26 Okt 2026", "comment": "Keren parah! Solnya empuk seperti menginjak awan. Modelnya minimalis dan cocok dipadukan outfit apa saja.", "verified": true}, {"id": "REV-011", "author": "Aditya Pratama", "rating": 5, "date": "20 Okt 2026", "comment": "Kualitas jahitan dan lem sangat kuat. Harga terjangkau untuk kualitas sebaik ini.", "verified": true}]'::jsonb),
('PROD-006', 'Biji Kopi Arabika Gayo Specialty 250g', 'Kuliner', 95000, 110000, 35, 5.0, 450, 'img/prod-006.jpg', 'Biji kopi sangrai kualitas specialty dari lereng pegunungan Gayo Aceh. Memiliki aroma floral, rasa karamel manis, dan tingkat keasaman yang seimbang.', 'Best Choice', '[{"id": "REV-012", "author": "Ahmad Zaki", "rating": 5, "date": "25 Okt 2026", "comment": "Fresh roast! Begitu bungkus dibuka langsung wangi semerbak. Diseduh V60 rasanya juara dunia.", "verified": true}, {"id": "REV-013", "author": "Lia Mariana", "rating": 5, "date": "23 Okt 2026", "comment": "Kopi langganan setiap bulan, notes cokelat dan karamelnya berasa banget di lidah.", "verified": true}]'::jsonb),
('PROD-007', 'TWS Earbuds Bluetooth 5.3 Bass Boost', 'Elektronik', 219000, 320000, 3, 4.6, 65, 'img/prod-007.jpg', 'Earphone nirkabel Bluetooth 5.3 dengan latensi super rendah (45ms), bass menggelegar, touch control responsif, dan mikrofon ENC ganda untuk telepon jernih.', 'Stok Menipis', '[{"id": "REV-014", "author": "Kevin Sanjaya", "rating": 5, "date": "22 Okt 2026", "comment": "Delay suara hampir nol saat main game FPS. Ukuran case mungil gampang masuk saku.", "verified": true}, {"id": "REV-015", "author": "Rina Kusuma", "rating": 4, "date": "16 Okt 2026", "comment": "Suara bass nendang dan mikrofon cukup jelas saat zoom call. Pengiriman kilat 1 hari sampai.", "verified": true}]'::jsonb),
('PROD-008', 'Tumbler Stainless Steel Panas & Dingin 500ml', 'Aksesoris', 135000, 180000, 22, 4.8, 175, 'img/prod-008.jpg', 'Botol minum isolasi vakum ganda berbahan Stainless Steel SUS 304. Menjaga suhu air panas hingga 12 jam dan air dingin hingga 24 jam. Bebas BPA dan anti bocor.', 'Eco-Friendly', '[{"id": "REV-016", "author": "Dewi Sartika", "rating": 5, "date": "24 Okt 2026", "comment": "Air es diisi jam 8 pagi, jam 8 malam es batunya masih ada! Keren banget dan tidak bocor saat miring di tas.", "verified": true}, {"id": "REV-017", "author": "Gunawan", "rating": 4, "date": "18 Okt 2026", "comment": "Finishing matte rapi dan elegan. Nyaman digenggam dan tidak licin.", "verified": true}]'::jsonb),
('PROD-009', 'Keyboard Mechanical RGB Gaming 87-Keys', 'Elektronik', 449000, 650000, 15, 4.9, 189, 'img/prod-009.jpg', 'Keyboard mechanical tenkeyless dengan switch blue clicky atau brown tactile yang responsif, 18 mode efek lampu RGB dinamis, dan keycaps double-shot PBT awet tahan lama.', 'Diskon 31%', '[{"id": "REV-018", "author": "Rico Pratama", "rating": 5, "date": "26 Okt 2026", "comment": "Sensasi ngetik tactile-nya mantap banget! RGB terang dan mode lighting-nya keren banyak pilihan.", "verified": true}, {"id": "REV-019", "author": "Dian Wahyudi", "rating": 5, "date": "21 Okt 2026", "comment": "Build quality kokoh dengan plat aluminium solid. Kabel braided tebal dan bisa dilepas.", "verified": true}]'::jsonb),
('PROD-010', 'Mouse Wireless Ergonomic Silent Click', 'Elektronik', 159000, 220000, 30, 4.7, 260, 'img/prod-010.jpg', 'Mouse nirkabel dengan bentuk kontur ergonomis yang pas di telapak tangan, tombol silent tanpa suara bising, DPI hingga 2400, dan baterai hemat hingga 6 bulan pemakaian.', 'Pilihan Kantor', '[{"id": "REV-020", "author": "Hendra Wijaya", "rating": 5, "date": "25 Okt 2026", "comment": "Klik benar-benar senyap, cocok banget buat kerja malam di rumah atau di perpustakaan.", "verified": true}, {"id": "REV-021", "author": "Kartika Sari", "rating": 4, "date": "20 Okt 2026", "comment": "Ergonomis, pergelangan tangan tidak cepat capek setelah berjam-jam olah data Excel.", "verified": true}]'::jsonb),
('PROD-011', 'Jaket Hoodie Oversize Fleece Premium', 'Fashion', 245000, 320000, 20, 4.8, 195, 'img/prod-011.jpg', 'Hoodie pria & wanita bergaya korean streetwear dengan bahan cotton fleece gramasi 330 gsm tebal, lembut di kulit, hangat, dan tidak mudah berbulu.', 'Trending', '[{"id": "REV-022", "author": "Nadya Eka", "rating": 5, "date": "24 Okt 2026", "comment": "Bahan fleecenya lembut banget di dalam, potongan oversize-nya pas dan kekinian. Mau beli warna lain!", "verified": true}, {"id": "REV-023", "author": "Gilang Ramadhan", "rating": 5, "date": "19 Okt 2026", "comment": "Hoodie ter-cozy yang pernah saya beli di toko online. Kantong kanguru lebar dan nyaman.", "verified": true}]'::jsonb),
('PROD-012', 'Celana Chino Slim Fit Stretch Pria', 'Fashion', 195000, 260000, 28, 4.7, 140, 'img/prod-012.jpg', 'Celana panjang chino dengan bahan katun twill stretch elastis yang fleksibel saat bergerak. Potongan slim fit modern pas untuk acara semi-formal maupun kasual.', 'Diskon 25%', '[{"id": "REV-024", "author": "Iqbal Maulana", "rating": 5, "date": "23 Okt 2026", "comment": "Bahan stretch-nya bikin leluasa bergerak saat duduk dan naik motor. Pas di pinggang dan panjangnya tepat.", "verified": true}, {"id": "REV-025", "author": "Bayu Anggoro", "rating": 4, "date": "17 Okt 2026", "comment": "Jahitan kuat bar-tack di saku, warna khaki-nya netral dan gampang dipadukan kemeja.", "verified": true}]'::jsonb),
('PROD-013', 'Kacamata Hitam Polarized UV400 Retro', 'Aksesoris', 125000, 190000, 45, 4.8, 320, 'img/prod-013.jpg', 'Kacamata hitam berdesain retro klasik dengan lensa polarized anti-silau dan perlindungan 100% UV400. Frame kokoh ringan tahan karat dengan engsel fleksibel.', 'Terlaris', '[{"id": "REV-026", "author": "Tommy Kurniawan", "rating": 5, "date": "26 Okt 2026", "comment": "Lensa polarized-nya beneran berfungsi, silau aspal dan kaca mobil langsung hilang saat berkendara.", "verified": true}, {"id": "REV-027", "author": "Jessica Tan", "rating": 5, "date": "22 Okt 2026", "comment": "Modelnya vintage dan unisex, bonus kotak kacamata hardcase dan lap microfiber berkualitas.", "verified": true}]'::jsonb),
('PROD-014', 'Jam Tangan Analog Pria Kulit Asli Classic', 'Aksesoris', 360000, 480000, 14, 4.9, 110, 'img/prod-014.jpg', 'Jam tangan analog pria dengan strap kulit sapi asli (genuine leather), kaca mineral tahan gores, mesin quartz presisi Jepang, dan ketahanan air 30 meter.', 'Eksklusif', '[{"id": "REV-028", "author": "Danang Prasetyo", "rating": 5, "date": "25 Okt 2026", "comment": "Tampak sangat mewah dan formal. Kulit strap wangi asli dan makin sering dipakai makin lentur.", "verified": true}, {"id": "REV-029", "author": "Suryo Utomo", "rating": 5, "date": "18 Okt 2026", "comment": "Cocok buat kado ulang tahun atau dipakai ke undangan. Akurasi detiknya mantap.", "verified": true}]'::jsonb),
('PROD-015', 'Teh Hijau Organik Premium Matcha Powder 100g', 'Kuliner', 88000, 120000, 50, 4.9, 280, 'img/prod-015.jpg', 'Bubuk teh hijau matcha murni kelas seremonial organik. Tanpa gula tambahan, kaya antioksidan polifenol, beraroma umami segar alami untuk latte atau baking.', 'Superfood', '[{"id": "REV-030", "author": "Clara Vania", "rating": 5, "date": "26 Okt 2026", "comment": "Warna hijaunya cerah alami tanda kualitas tinggi! Dibuat matcha latte dengan susu oat rasanya nikmat banget.", "verified": true}, {"id": "REV-031", "author": "Indah Permata", "rating": 5, "date": "21 Okt 2026", "comment": "Aroma segarnya khas matcha Jepang asli, tidak pahit getir sama sekali. Sangat higienis.", "verified": true}]'::jsonb),
('PROD-016', 'Madu Hutan Asli Murni Nusantara 500g', 'Kuliner', 115000, 150000, 32, 5.0, 340, 'img/prod-016.jpg', 'Madu mentah (raw honey) 100% murni hasil panen lebah hutan liar Sumbawa. Tanpa pemanis buatan, tanpa pemanasan, menjaga kandungan enzim alami dan daya tahan tubuh.', '100% Murni', '[{"id": "REV-032", "author": "dr. Wahyu Hidayat", "rating": 5, "date": "24 Okt 2026", "comment": "Kekentalan dan rasa manisnya alami, ada aroma nektar bunga hutan yang khas. Khasiatnya terasa untuk imun keluarga.", "verified": true}, {"id": "REV-033", "author": "Tuti Handayani", "rating": 5, "date": "19 Okt 2026", "comment": "Sudah tes uji beku di freezer, tidak mengkristal jadi gula. Madu asli recomended!", "verified": true}]'::jsonb),
('PROD-017', 'Powerbank Fast Charging 20000mAh PD 65W', 'Elektronik', 389000, 550000, 16, 4.8, 175, 'img/prod-017.jpg', 'Pengisi daya portabel kapasitas besar 20.000 mAh dengan protokol Power Delivery 65W & Quick Charge 4.0. Mampu mengisi daya smartphone, tablet, bahkan laptop dengan cepat dan aman.', 'Diskon 29%', '[{"id": "REV-034", "author": "Rian Firmansyah", "rating": 5, "date": "25 Okt 2026", "comment": "Bisa buat ngecas MacBook dan iPhone sekaligus dengan cepat. Layar indikator baterai LED digitalnya sangat membantu.", "verified": true}, {"id": "REV-035", "author": "Alif Akbar", "rating": 4, "date": "20 Okt 2026", "comment": "Bahan solid tidak gampang panas saat pengisian daya cepat. Flight friendly aman dibawa ke kabin pesawat.", "verified": true}]'::jsonb),
('PROD-018', 'Speaker Bluetooth Portable IPX7 Waterproof', 'Elektronik', 325000, 450000, 19, 4.9, 205, 'img/prod-018.jpg', 'Speaker nirkabel bertenaga 16W dengan suara 360 derajat dan passive bass radiator. Sertifikasi tahan air IPX7 aman untuk outdoor, kolam renang, dan kamar mandi.', 'Anti Air IPX7', '[{"id": "REV-036", "author": "Yoga Pratama", "rating": 5, "date": "24 Okt 2026", "comment": "Bass-nya bergetar dan vokalnya jernih banget. Dibawa kamping kehujanan tetap nyala tanpa masalah.", "verified": true}, {"id": "REV-037", "author": "Melisa", "rating": 5, "date": "17 Okt 2026", "comment": "Baterainya awet dipakai seharian dari pagi sampai malam. Koneksi Bluetooth stabil tidak putus-putus.", "verified": true}]'::jsonb),
('PROD-019', 'Sepatu Casual Slip-On Pria Loafers', 'Fashion', 310000, 420000, 11, 4.7, 94, 'img/prod-019.jpg', 'Sepatu loafers pria berbahan suede micro sintetis tahan lama dengan insole empuk antibacterial. Praktis tanpa tali, cocok untuk gaya smart-casual kantor maupun santai.', 'Nyaman & Praktis', '[{"id": "REV-038", "author": "Arya Seno", "rating": 5, "date": "23 Okt 2026", "comment": "Praktis langsung selop, tidak lecet di tumit meski dipakai tanpa kaos kaki. Modelnya rapi dan mewah.", "verified": true}, {"id": "REV-039", "author": "Panji Wicaksono", "rating": 4, "date": "16 Okt 2026", "comment": "Sol karet tidak licin di lantai keramik basah. Ukuran 42 pas sesuai chart ukuran standar lokal.", "verified": true}]'::jsonb),
('PROD-020', 'Kaos Polos Katun Combed 30s Soft Touch', 'Fashion', 75000, 100000, 60, 4.8, 520, 'img/prod-020.jpg', 'T-shirt basic polos pria & wanita berbahan 100% Ring Spun Cotton Combed 30s. Tekstur sangat lembut, menyerap keringat dengan baik, tidak nerawang, dan jahitan rantai rapi standar distro.', 'Best Seller', '[{"id": "REV-040", "author": "Dodi Setiawan", "rating": 5, "date": "26 Okt 2026", "comment": "Bahan beneran katun 30s asli adem, dicuci berkali-kali tidak melar dan warna tidak luntur.", "verified": true}, {"id": "REV-041", "author": "Ratih Anggraini", "rating": 5, "date": "22 Okt 2026", "comment": "Sudah order 5 warna sekaligus, semuanya memuaskan. Kualitas distro harga grosir!", "verified": true}]'::jsonb),
('PROD-021', 'Dompet Kulit Bifold Minimalis Anti-RFID', 'Aksesoris', 165000, 230000, 24, 4.9, 160, 'img/prod-021.jpg', 'Dompet pria lipat dua ramping berbahan kulit crazy horse premium dengan lapisan pelindung anti-RFID untuk mencegah pencurian data kartu nirkabel. Muat 8 kartu dan uang kertas.', 'Keamanan RFID', '[{"id": "REV-042", "author": "Bagus Priambodo", "rating": 5, "date": "25 Okt 2026", "comment": "Desain slim tidak bikin kantong celana menggembung. Fitur proteksi RFID bikin lebih tenang simpan kartu tap.", "verified": true}, {"id": "REV-043", "author": "Ferry Irawan", "rating": 5, "date": "19 Okt 2026", "comment": "Aroma kulit aslinya mantap, tekstur matte-nya estetik dan jahitan pinggir sangat rapi.", "verified": true}]'::jsonb),
('PROD-022', 'Topi Baseball Cap Classic Bordir Katun', 'Aksesoris', 85000, 120000, 38, 4.7, 210, 'img/prod-022.jpg', 'Topi baseball bergaya polo cap vintage dari katun twill tebal dengan strap logam pengatur ukuran di belakang. Nyaman dipakai melindungi wajah dari terik matahari.', 'Diskon 29%', '[{"id": "REV-044", "author": "Aldi Gunawan", "rating": 5, "date": "24 Okt 2026", "comment": "Bentuk crown kepalanya pas, visor kokoh tidak melengkung aneh. Bahan katun adem.", "verified": true}, {"id": "REV-045", "author": "Novi Triana", "rating": 4, "date": "18 Okt 2026", "comment": "Bagus banget buat gaya kasual sporty harian. Strap belakang dari besi kuningan terlihat vintage.", "verified": true}]'::jsonb),
('PROD-023', 'Dark Chocolate Bar 85% Artisan Single Origin', 'Kuliner', 65000, 85000, 42, 4.9, 290, 'img/prod-023.jpg', 'Cokelat hitam murni 85% kakao dari perkebunan organik Bali. Cita rasa cokelat intens dengan aroma buah kering dan rendah gula, cocok untuk diet keto dan pecinta cokelat sejati.', 'Artisan Organik', '[{"id": "REV-046", "author": "dr. Cindy Novita", "rating": 5, "date": "26 Okt 2026", "comment": "Dark chocolate dengan cita rasa terbaik lokal! Tidak pahit pahit kimia, ada aftertaste buah segar alami.", "verified": true}, {"id": "REV-047", "author": "Eko Prasetyo", "rating": 5, "date": "20 Okt 2026", "comment": "Cocok banget buat cemilan sehat saat diet. Packing pengiriman pakai ice gel jadi cokelat tidak meleleh.", "verified": true}]'::jsonb),
('PROD-024', 'Kopi Robusta Dampit Malang Dark Roast 250g', 'Kuliner', 78000, 95000, 36, 4.8, 380, 'img/prod-024.jpg', 'Kopi robusta legendaris dari perkebunan lereng Gunung Semeru Dampit Malang. Profil sangrai dark roast dengan body tebal, aroma cokelat pekat, dan crema melimpah untuk kopi susu atau espresso.', 'Kretek & Bold', '[{"id": "REV-048", "author": "Hadi Purnomo", "rating": 5, "date": "25 Okt 2026", "comment": "Buat pecinta kopi mantap dan bold ini wajib coba! Dibuat es kopi susu gula aren rasanya gurih nendang.", "verified": true}, {"id": "REV-049", "author": "M. Faisal", "rating": 5, "date": "21 Okt 2026", "comment": "Crema-nya tebal banget waktu diekstrak pakai mesin espresso rumahan. Mantap jiwa!", "verified": true}]'::jsonb)
ON CONFLICT (id) DO NOTHING;


INSERT INTO public.settings (id, store_name, store_tagline, seller_name, seller_phone, seller_email, address, free_shipping_min, flat_shipping_fee, store_logo)
VALUES ('default', 'Toko Berkah Official', 'Pusat Belanja Terlengkap, Termurah & Terpercaya', 'Admin Toko Berkah', '0812-3456-7890', 'admin@tokoberkah.com', 'Jl. Pemuda No. 100, Jakarta Pusat', 300000, 15000, '')
ON CONFLICT (id) DO NOTHING;
