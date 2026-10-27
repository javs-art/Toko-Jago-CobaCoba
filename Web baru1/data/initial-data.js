// data/initial-data.js
// Data awal untuk katalog produk, ulasan, pesanan toko, dan pengaturan default

const INITIAL_PRODUCTS = [
  {
    id: "PROD-001",
    name: "Headphone Wireless ANC Studio Pro",
    category: "Elektronik",
    price: 899000,
    originalPrice: 1299000,
    stock: 18,
    rating: 4.9,
    soldCount: 142,
    image: "img/prod-001.jpg",
    description: "Headphone nirkabel premium dengan teknologi Active Noise Cancelling (ANC), daya tahan baterai hingga 40 jam, mikrofon jernih, dan driver audio 40mm beresolusi tinggi.",
    badge: "Diskon 30%",
    reviews: [
      {
        id: "REV-001",
        author: "Budi Santoso",
        rating: 5,
        date: "25 Okt 2026",
        comment: "Kualitas suaranya luar biasa, fitur noise cancelling sangat kedap saat dipakai di kantor maupun kafe. Baterai awet berhari-hari!",
        verified: true
      },
      {
        id: "REV-002",
        author: "Siti Rahma",
        rating: 5,
        date: "21 Okt 2026",
        comment: "Bantalan telinganya empuk dan tidak bikin sakit kepala meski dipakai meeting seharian. Recommended!",
        verified: true
      },
      {
        id: "REV-003",
        author: "Reza Fahlevi",
        rating: 4,
        date: "17 Okt 2026",
        comment: "Bass-nya mantap, treble pas. Cuma butuh adaptasi sedikit dengan tombol ANC-nya. Overall mantul.",
        verified: true
      }
    ]
  },
  {
    id: "PROD-002",
    name: "Smartwatch Sport Fitness Tracker V3",
    category: "Elektronik",
    price: 499000,
    originalPrice: 750000,
    stock: 25,
    rating: 4.8,
    soldCount: 98,
    image: "img/prod-002.jpg",
    description: "Jam tangan pintar dengan layar AMOLED tajam, sensor detak jantung 24/7, SpO2, pelacak tidur, tahan air 5ATM, dan 100+ mode olahraga otomatis.",
    badge: "Terlaris",
    reviews: [
      {
        id: "REV-004",
        author: "Dimas Pratama",
        rating: 5,
        date: "23 Okt 2026",
        comment: "Layar AMOLED-nya jernih banget bahkan di bawah terik matahari. Sinkronisasi ke smartphone lancar jaya.",
        verified: true
      },
      {
        id: "REV-005",
        author: "Anisa Putri",
        rating: 4,
        date: "19 Okt 2026",
        comment: "Desain sporty dan elegan di tangan wanita. Strapnya nyaman dan sensor detak jantungnya cukup akurat.",
        verified: true
      }
    ]
  },
  {
    id: "PROD-003",
    name: "Kemeja Flanel Casual Pria Slim-Fit",
    category: "Fashion",
    price: 185000,
    originalPrice: 240000,
    stock: 40,
    rating: 4.7,
    soldCount: 310,
    image: "img/prod-003.jpg",
    description: "Kemeja flanel katun 100% adem, lembut, dan tebal. Desain kotak modern cocok untuk gaya santai, kuliah, hingga hangout akhir pekan.",
    badge: "Populer",
    reviews: [
      {
        id: "REV-006",
        author: "Fajar Nugraha",
        rating: 5,
        date: "24 Okt 2026",
        comment: "Bahan flanelnya halus dan tidak panas saat dipakai siang hari. Ukuran M pas di badan tinggi 170cm.",
        verified: true
      },
      {
        id: "REV-007",
        author: "Doni Setiawan",
        rating: 4,
        date: "15 Okt 2026",
        comment: "Warna persis seperti di foto, jahitan rapi. Pengiriman cepat sampai tujuan.",
        verified: true
      }
    ]
  },
  {
    id: "PROD-004",
    name: "Tas Ransel Laptop Waterproof 20L",
    category: "Aksesoris",
    price: 275000,
    originalPrice: 350000,
    stock: 12,
    rating: 4.8,
    soldCount: 84,
    image: "img/prod-004.jpg",
    description: "Ransel ergonomis anti air dengan kompartemen laptop hingga 15.6 inci, slot botol minum, port USB charging eksternal, dan saku rahasia anti-maling.",
    badge: "Hemat",
    reviews: [
      {
        id: "REV-008",
        author: "Hendri Kurniawan",
        rating: 5,
        date: "22 Okt 2026",
        comment: "Bahan beneran waterproof diuji saat hujan gerimis. Laptop dan buku tetap aman kering.",
        verified: true
      },
      {
        id: "REV-009",
        author: "Maya Lestari",
        rating: 5,
        date: "14 Okt 2026",
        comment: "Banyak kompartemen tersembunyi. Pas banget buat kerja kantor dan traveling singkat.",
        verified: true
      }
    ]
  },
  {
    id: "PROD-005",
    name: "Sneakers Pria Urban Runner White",
    category: "Fashion",
    price: 389000,
    originalPrice: 520000,
    stock: 8,
    rating: 4.9,
    soldCount: 220,
    image: "img/prod-005.jpg",
    description: "Sepatu sneakers kasual dengan sol phylon empuk berbahan memory foam. Ringan, fleksibel, dan sangat nyaman dipakai seharian tanpa bikin pegal.",
    badge: "Diskon 25%",
    reviews: [
      {
        id: "REV-010",
        author: "Bambang Wijaya",
        rating: 5,
        date: "26 Okt 2026",
        comment: "Keren parah! Solnya empuk seperti menginjak awan. Modelnya minimalis dan cocok dipadukan outfit apa saja.",
        verified: true
      },
      {
        id: "REV-011",
        author: "Aditya Pratama",
        rating: 5,
        date: "20 Okt 2026",
        comment: "Kualitas jahitan dan lem sangat kuat. Harga terjangkau untuk kualitas sebaik ini.",
        verified: true
      }
    ]
  },
  {
    id: "PROD-006",
    name: "Biji Kopi Arabika Gayo Specialty 250g",
    category: "Kuliner",
    price: 95000,
    originalPrice: 110000,
    stock: 35,
    rating: 5.0,
    soldCount: 450,
    image: "img/prod-006.jpg",
    description: "Biji kopi sangrai kualitas specialty dari lereng pegunungan Gayo Aceh. Memiliki aroma floral, rasa karamel manis, dan tingkat keasaman yang seimbang.",
    badge: "Best Choice",
    reviews: [
      {
        id: "REV-012",
        author: "Ahmad Zaki",
        rating: 5,
        date: "25 Okt 2026",
        comment: "Fresh roast! Begitu bungkus dibuka langsung wangi semerbak. Diseduh V60 rasanya juara dunia.",
        verified: true
      },
      {
        id: "REV-013",
        author: "Lia Mariana",
        rating: 5,
        date: "23 Okt 2026",
        comment: "Kopi langganan setiap bulan, notes cokelat dan karamelnya berasa banget di lidah.",
        verified: true
      }
    ]
  },
  {
    id: "PROD-007",
    name: "TWS Earbuds Bluetooth 5.3 Bass Boost",
    category: "Elektronik",
    price: 219000,
    originalPrice: 320000,
    stock: 3,
    rating: 4.6,
    soldCount: 65,
    image: "img/prod-007.jpg",
    description: "Earphone nirkabel Bluetooth 5.3 dengan latensi super rendah (45ms), bass menggelegar, touch control responsif, dan mikrofon ENC ganda untuk telepon jernih.",
    badge: "Stok Menipis",
    reviews: [
      {
        id: "REV-014",
        author: "Kevin Sanjaya",
        rating: 5,
        date: "22 Okt 2026",
        comment: "Delay suara hampir nol saat main game FPS. Ukuran case mungil gampang masuk saku.",
        verified: true
      },
      {
        id: "REV-015",
        author: "Rina Kusuma",
        rating: 4,
        date: "16 Okt 2026",
        comment: "Suara bass nendang dan mikrofon cukup jelas saat zoom call. Pengiriman kilat 1 hari sampai.",
        verified: true
      }
    ]
  },
  {
    id: "PROD-008",
    name: "Tumbler Stainless Steel Panas & Dingin 500ml",
    category: "Aksesoris",
    price: 135000,
    originalPrice: 180000,
    stock: 22,
    rating: 4.8,
    soldCount: 175,
    image: "img/prod-008.jpg",
    description: "Botol minum isolasi vakum ganda berbahan Stainless Steel SUS 304. Menjaga suhu air panas hingga 12 jam dan air dingin hingga 24 jam. Bebas BPA dan anti bocor.",
    badge: "Eco-Friendly",
    reviews: [
      {
        id: "REV-016",
        author: "Dewi Sartika",
        rating: 5,
        date: "24 Okt 2026",
        comment: "Air es diisi jam 8 pagi, jam 8 malam es batunya masih ada! Keren banget dan tidak bocor saat miring di tas.",
        verified: true
      },
      {
        id: "REV-017",
        author: "Gunawan",
        rating: 4,
        date: "18 Okt 2026",
        comment: "Finishing matte rapi dan elegan. Nyaman digenggam dan tidak licin.",
        verified: true
      }
    ]
  },
  // 16 PRODUK BARU TAMBAHAN (PROD-009 s/d PROD-024)
  {
    id: "PROD-009",
    name: "Keyboard Mechanical RGB Gaming 87-Keys",
    category: "Elektronik",
    price: 449000,
    originalPrice: 650000,
    stock: 15,
    rating: 4.9,
    soldCount: 189,
    image: "img/prod-009.jpg",
    description: "Keyboard mechanical tenkeyless dengan switch blue clicky atau brown tactile yang responsif, 18 mode efek lampu RGB dinamis, dan keycaps double-shot PBT awet tahan lama.",
    badge: "Diskon 31%",
    reviews: [
      {
        id: "REV-018",
        author: "Rico Pratama",
        rating: 5,
        date: "26 Okt 2026",
        comment: "Sensasi ngetik tactile-nya mantap banget! RGB terang dan mode lighting-nya keren banyak pilihan.",
        verified: true
      },
      {
        id: "REV-019",
        author: "Dian Wahyudi",
        rating: 5,
        date: "21 Okt 2026",
        comment: "Build quality kokoh dengan plat aluminium solid. Kabel braided tebal dan bisa dilepas.",
        verified: true
      }
    ]
  },
  {
    id: "PROD-010",
    name: "Mouse Wireless Ergonomic Silent Click",
    category: "Elektronik",
    price: 159000,
    originalPrice: 220000,
    stock: 30,
    rating: 4.7,
    soldCount: 260,
    image: "img/prod-010.jpg",
    description: "Mouse nirkabel dengan bentuk kontur ergonomis yang pas di telapak tangan, tombol silent tanpa suara bising, DPI hingga 2400, dan baterai hemat hingga 6 bulan pemakaian.",
    badge: "Pilihan Kantor",
    reviews: [
      {
        id: "REV-020",
        author: "Hendra Wijaya",
        rating: 5,
        date: "25 Okt 2026",
        comment: "Klik benar-benar senyap, cocok banget buat kerja malam di rumah atau di perpustakaan.",
        verified: true
      },
      {
        id: "REV-021",
        author: "Kartika Sari",
        rating: 4,
        date: "20 Okt 2026",
        comment: "Ergonomis, pergelangan tangan tidak cepat capek setelah berjam-jam olah data Excel.",
        verified: true
      }
    ]
  },
  {
    id: "PROD-011",
    name: "Jaket Hoodie Oversize Fleece Premium",
    category: "Fashion",
    price: 245000,
    originalPrice: 320000,
    stock: 20,
    rating: 4.8,
    soldCount: 195,
    image: "img/prod-011.jpg",
    description: "Hoodie pria & wanita bergaya korean streetwear dengan bahan cotton fleece gramasi 330 gsm tebal, lembut di kulit, hangat, dan tidak mudah berbulu.",
    badge: "Trending",
    reviews: [
      {
        id: "REV-022",
        author: "Nadya Eka",
        rating: 5,
        date: "24 Okt 2026",
        comment: "Bahan fleecenya lembut banget di dalam, potongan oversize-nya pas dan kekinian. Mau beli warna lain!",
        verified: true
      },
      {
        id: "REV-023",
        author: "Gilang Ramadhan",
        rating: 5,
        date: "19 Okt 2026",
        comment: "Hoodie ter-cozy yang pernah saya beli di toko online. Kantong kanguru lebar dan nyaman.",
        verified: true
      }
    ]
  },
  {
    id: "PROD-012",
    name: "Celana Chino Slim Fit Stretch Pria",
    category: "Fashion",
    price: 195000,
    originalPrice: 260000,
    stock: 28,
    rating: 4.7,
    soldCount: 140,
    image: "img/prod-012.jpg",
    description: "Celana panjang chino dengan bahan katun twill stretch elastis yang fleksibel saat bergerak. Potongan slim fit modern pas untuk acara semi-formal maupun kasual.",
    badge: "Diskon 25%",
    reviews: [
      {
        id: "REV-024",
        author: "Iqbal Maulana",
        rating: 5,
        date: "23 Okt 2026",
        comment: "Bahan stretch-nya bikin leluasa bergerak saat duduk dan naik motor. Pas di pinggang dan panjangnya tepat.",
        verified: true
      },
      {
        id: "REV-025",
        author: "Bayu Anggoro",
        rating: 4,
        date: "17 Okt 2026",
        comment: "Jahitan kuat bar-tack di saku, warna khaki-nya netral dan gampang dipadukan kemeja.",
        verified: true
      }
    ]
  },
  {
    id: "PROD-013",
    name: "Kacamata Hitam Polarized UV400 Retro",
    category: "Aksesoris",
    price: 125000,
    originalPrice: 190000,
    stock: 45,
    rating: 4.8,
    soldCount: 320,
    image: "img/prod-013.jpg",
    description: "Kacamata hitam berdesain retro klasik dengan lensa polarized anti-silau dan perlindungan 100% UV400. Frame kokoh ringan tahan karat dengan engsel fleksibel.",
    badge: "Terlaris",
    reviews: [
      {
        id: "REV-026",
        author: "Tommy Kurniawan",
        rating: 5,
        date: "26 Okt 2026",
        comment: "Lensa polarized-nya beneran berfungsi, silau aspal dan kaca mobil langsung hilang saat berkendara.",
        verified: true
      },
      {
        id: "REV-027",
        author: "Jessica Tan",
        rating: 5,
        date: "22 Okt 2026",
        comment: "Modelnya vintage dan unisex, bonus kotak kacamata hardcase dan lap microfiber berkualitas.",
        verified: true
      }
    ]
  },
  {
    id: "PROD-014",
    name: "Jam Tangan Analog Pria Kulit Asli Classic",
    category: "Aksesoris",
    price: 360000,
    originalPrice: 480000,
    stock: 14,
    rating: 4.9,
    soldCount: 110,
    image: "img/prod-014.jpg",
    description: "Jam tangan analog pria dengan strap kulit sapi asli (genuine leather), kaca mineral tahan gores, mesin quartz presisi Jepang, dan ketahanan air 30 meter.",
    badge: "Eksklusif",
    reviews: [
      {
        id: "REV-028",
        author: "Danang Prasetyo",
        rating: 5,
        date: "25 Okt 2026",
        comment: "Tampak sangat mewah dan formal. Kulit strap wangi asli dan makin sering dipakai makin lentur.",
        verified: true
      },
      {
        id: "REV-029",
        author: "Suryo Utomo",
        rating: 5,
        date: "18 Okt 2026",
        comment: "Cocok buat kado ulang tahun atau dipakai ke undangan. Akurasi detiknya mantap.",
        verified: true
      }
    ]
  },
  {
    id: "PROD-015",
    name: "Teh Hijau Organik Premium Matcha Powder 100g",
    category: "Kuliner",
    price: 88000,
    originalPrice: 120000,
    stock: 50,
    rating: 4.9,
    soldCount: 280,
    image: "img/prod-015.jpg",
    description: "Bubuk teh hijau matcha murni kelas seremonial organik. Tanpa gula tambahan, kaya antioksidan polifenol, beraroma umami segar alami untuk latte atau baking.",
    badge: "Superfood",
    reviews: [
      {
        id: "REV-030",
        author: "Clara Vania",
        rating: 5,
        date: "26 Okt 2026",
        comment: "Warna hijaunya cerah alami tanda kualitas tinggi! Dibuat matcha latte dengan susu oat rasanya nikmat banget.",
        verified: true
      },
      {
        id: "REV-031",
        author: "Indah Permata",
        rating: 5,
        date: "21 Okt 2026",
        comment: "Aroma segarnya khas matcha Jepang asli, tidak pahit getir sama sekali. Sangat higienis.",
        verified: true
      }
    ]
  },
  {
    id: "PROD-016",
    name: "Madu Hutan Asli Murni Nusantara 500g",
    category: "Kuliner",
    price: 115000,
    originalPrice: 150000,
    stock: 32,
    rating: 5.0,
    soldCount: 340,
    image: "img/prod-016.jpg",
    description: "Madu mentah (raw honey) 100% murni hasil panen lebah hutan liar Sumbawa. Tanpa pemanis buatan, tanpa pemanasan, menjaga kandungan enzim alami dan daya tahan tubuh.",
    badge: "100% Murni",
    reviews: [
      {
        id: "REV-032",
        author: "dr. Wahyu Hidayat",
        rating: 5,
        date: "24 Okt 2026",
        comment: "Kekentalan dan rasa manisnya alami, ada aroma nektar bunga hutan yang khas. Khasiatnya terasa untuk imun keluarga.",
        verified: true
      },
      {
        id: "REV-033",
        author: "Tuti Handayani",
        rating: 5,
        date: "19 Okt 2026",
        comment: "Sudah tes uji beku di freezer, tidak mengkristal jadi gula. Madu asli recomended!",
        verified: true
      }
    ]
  },
  {
    id: "PROD-017",
    name: "Powerbank Fast Charging 20000mAh PD 65W",
    category: "Elektronik",
    price: 389000,
    originalPrice: 550000,
    stock: 16,
    rating: 4.8,
    soldCount: 175,
    image: "img/prod-017.jpg",
    description: "Pengisi daya portabel kapasitas besar 20.000 mAh dengan protokol Power Delivery 65W & Quick Charge 4.0. Mampu mengisi daya smartphone, tablet, bahkan laptop dengan cepat dan aman.",
    badge: "Diskon 29%",
    reviews: [
      {
        id: "REV-034",
        author: "Rian Firmansyah",
        rating: 5,
        date: "25 Okt 2026",
        comment: "Bisa buat ngecas MacBook dan iPhone sekaligus dengan cepat. Layar indikator baterai LED digitalnya sangat membantu.",
        verified: true
      },
      {
        id: "REV-035",
        author: "Alif Akbar",
        rating: 4,
        date: "20 Okt 2026",
        comment: "Bahan solid tidak gampang panas saat pengisian daya cepat. Flight friendly aman dibawa ke kabin pesawat.",
        verified: true
      }
    ]
  },
  {
    id: "PROD-018",
    name: "Speaker Bluetooth Portable IPX7 Waterproof",
    category: "Elektronik",
    price: 325000,
    originalPrice: 450000,
    stock: 19,
    rating: 4.9,
    soldCount: 205,
    image: "img/prod-018.jpg",
    description: "Speaker nirkabel bertenaga 16W dengan suara 360 derajat dan passive bass radiator. Sertifikasi tahan air IPX7 aman untuk outdoor, kolam renang, dan kamar mandi.",
    badge: "Anti Air IPX7",
    reviews: [
      {
        id: "REV-036",
        author: "Yoga Pratama",
        rating: 5,
        date: "24 Okt 2026",
        comment: "Bass-nya bergetar dan vokalnya jernih banget. Dibawa kamping kehujanan tetap nyala tanpa masalah.",
        verified: true
      },
      {
        id: "REV-037",
        author: "Melisa",
        rating: 5,
        date: "17 Okt 2026",
        comment: "Baterainya awet dipakai seharian dari pagi sampai malam. Koneksi Bluetooth stabil tidak putus-putus.",
        verified: true
      }
    ]
  },
  {
    id: "PROD-019",
    name: "Sepatu Casual Slip-On Pria Loafers",
    category: "Fashion",
    price: 310000,
    originalPrice: 420000,
    stock: 11,
    rating: 4.7,
    soldCount: 94,
    image: "img/prod-019.jpg",
    description: "Sepatu loafers pria berbahan suede micro sintetis tahan lama dengan insole empuk antibacterial. Praktis tanpa tali, cocok untuk gaya smart-casual kantor maupun santai.",
    badge: "Nyaman & Praktis",
    reviews: [
      {
        id: "REV-038",
        author: "Arya Seno",
        rating: 5,
        date: "23 Okt 2026",
        comment: "Praktis langsung selop, tidak lecet di tumit meski dipakai tanpa kaos kaki. Modelnya rapi dan mewah.",
        verified: true
      },
      {
        id: "REV-039",
        author: "Panji Wicaksono",
        rating: 4,
        date: "16 Okt 2026",
        comment: "Sol karet tidak licin di lantai keramik basah. Ukuran 42 pas sesuai chart ukuran standar lokal.",
        verified: true
      }
    ]
  },
  {
    id: "PROD-020",
    name: "Kaos Polos Katun Combed 30s Soft Touch",
    category: "Fashion",
    price: 75000,
    originalPrice: 100000,
    stock: 60,
    rating: 4.8,
    soldCount: 520,
    image: "img/prod-020.jpg",
    description: "T-shirt basic polos pria & wanita berbahan 100% Ring Spun Cotton Combed 30s. Tekstur sangat lembut, menyerap keringat dengan baik, tidak nerawang, dan jahitan rantai rapi standar distro.",
    badge: "Best Seller",
    reviews: [
      {
        id: "REV-040",
        author: "Dodi Setiawan",
        rating: 5,
        date: "26 Okt 2026",
        comment: "Bahan beneran katun 30s asli adem, dicuci berkali-kali tidak melar dan warna tidak luntur.",
        verified: true
      },
      {
        id: "REV-041",
        author: "Ratih Anggraini",
        rating: 5,
        date: "22 Okt 2026",
        comment: "Sudah order 5 warna sekaligus, semuanya memuaskan. Kualitas distro harga grosir!",
        verified: true
      }
    ]
  },
  {
    id: "PROD-021",
    name: "Dompet Kulit Bifold Minimalis Anti-RFID",
    category: "Aksesoris",
    price: 165000,
    originalPrice: 230000,
    stock: 24,
    rating: 4.9,
    soldCount: 160,
    image: "img/prod-021.jpg",
    description: "Dompet pria lipat dua ramping berbahan kulit crazy horse premium dengan lapisan pelindung anti-RFID untuk mencegah pencurian data kartu nirkabel. Muat 8 kartu dan uang kertas.",
    badge: "Keamanan RFID",
    reviews: [
      {
        id: "REV-042",
        author: "Bagus Priambodo",
        rating: 5,
        date: "25 Okt 2026",
        comment: "Desain slim tidak bikin kantong celana menggembung. Fitur proteksi RFID bikin lebih tenang simpan kartu tap.",
        verified: true
      },
      {
        id: "REV-043",
        author: "Ferry Irawan",
        rating: 5,
        date: "19 Okt 2026",
        comment: "Aroma kulit aslinya mantap, tekstur matte-nya estetik dan jahitan pinggir sangat rapi.",
        verified: true
      }
    ]
  },
  {
    id: "PROD-022",
    name: "Topi Baseball Cap Classic Bordir Katun",
    category: "Aksesoris",
    price: 85000,
    originalPrice: 120000,
    stock: 38,
    rating: 4.7,
    soldCount: 210,
    image: "img/prod-022.jpg",
    description: "Topi baseball bergaya polo cap vintage dari katun twill tebal dengan strap logam pengatur ukuran di belakang. Nyaman dipakai melindungi wajah dari terik matahari.",
    badge: "Diskon 29%",
    reviews: [
      {
        id: "REV-044",
        author: "Aldi Gunawan",
        rating: 5,
        date: "24 Okt 2026",
        comment: "Bentuk crown kepalanya pas, visor kokoh tidak melengkung aneh. Bahan katun adem.",
        verified: true
      },
      {
        id: "REV-045",
        author: "Novi Triana",
        rating: 4,
        date: "18 Okt 2026",
        comment: "Bagus banget buat gaya kasual sporty harian. Strap belakang dari besi kuningan terlihat vintage.",
        verified: true
      }
    ]
  },
  {
    id: "PROD-023",
    name: "Dark Chocolate Bar 85% Artisan Single Origin",
    category: "Kuliner",
    price: 65000,
    originalPrice: 85000,
    stock: 42,
    rating: 4.9,
    soldCount: 290,
    image: "img/prod-023.jpg",
    description: "Cokelat hitam murni 85% kakao dari perkebunan organik Bali. Cita rasa cokelat intens dengan aroma buah kering dan rendah gula, cocok untuk diet keto dan pecinta cokelat sejati.",
    badge: "Artisan Organik",
    reviews: [
      {
        id: "REV-046",
        author: "dr. Cindy Novita",
        rating: 5,
        date: "26 Okt 2026",
        comment: "Dark chocolate dengan cita rasa terbaik lokal! Tidak pahit pahit kimia, ada aftertaste buah segar alami.",
        verified: true
      },
      {
        id: "REV-047",
        author: "Eko Prasetyo",
        rating: 5,
        date: "20 Okt 2026",
        comment: "Cocok banget buat cemilan sehat saat diet. Packing pengiriman pakai ice gel jadi cokelat tidak meleleh.",
        verified: true
      }
    ]
  },
  {
    id: "PROD-024",
    name: "Kopi Robusta Dampit Malang Dark Roast 250g",
    category: "Kuliner",
    price: 78000,
    originalPrice: 95000,
    stock: 36,
    rating: 4.8,
    soldCount: 380,
    image: "img/prod-024.jpg",
    description: "Kopi robusta legendaris dari perkebunan lereng Gunung Semeru Dampit Malang. Profil sangrai dark roast dengan body tebal, aroma cokelat pekat, dan crema melimpah untuk kopi susu atau espresso.",
    badge: "Kretek & Bold",
    reviews: [
      {
        id: "REV-048",
        author: "Hadi Purnomo",
        rating: 5,
        date: "25 Okt 2026",
        comment: "Buat pecinta kopi mantap dan bold ini wajib coba! Dibuat es kopi susu gula aren rasanya gurih nendang.",
        verified: true
      },
      {
        id: "REV-049",
        author: "M. Faisal",
        rating: 5,
        date: "21 Okt 2026",
        comment: "Crema-nya tebal banget waktu diekstrak pakai mesin espresso rumahan. Mantap jiwa!",
        verified: true
      }
    ]
  }
];

const INITIAL_ORDERS = [
  {
    id: "ORD-9281",
    createdAt: "2026-10-25 14:32",
    courier: "JNE Express",
    customer: {
      name: "Budi Santoso",
      phone: "081234567890",
      address: "Jl. Sudirman No. 45, Jakarta Selatan",
      city: "Jakarta Selatan"
    },
    items: [
      {
        id: "PROD-001",
        name: "Headphone Wireless ANC Studio Pro",
        price: 899000,
        quantity: 1,
        image: "img/prod-001.jpg"
      }
    ],
    subtotal: 899000,
    shippingFee: 15000,
    discount: 50000,
    total: 864000,
    paymentMethod: "QRIS Instan",
    status: "Dikirim",
    trackingNumber: "JNE-88291039910"
  },
  {
    id: "ORD-9280",
    createdAt: "2026-10-25 10:15",
    courier: "SiCepat REG",
    customer: {
      name: "Siti Rahma",
      phone: "085799887766",
      address: "Jl. Diponegoro No. 12, Bandung",
      city: "Bandung"
    },
    items: [
      {
        id: "PROD-006",
        name: "Biji Kopi Arabika Gayo Specialty 250g",
        price: 95000,
        quantity: 2,
        image: "img/prod-006.jpg"
      },
      {
        id: "PROD-008",
        name: "Tumbler Stainless Steel Panas & Dingin 500ml",
        price: 135000,
        quantity: 1,
        image: "img/prod-008.jpg"
      }
    ],
    subtotal: 325000,
    shippingFee: 10000,
    discount: 0,
    total: 335000,
    paymentMethod: "Transfer Bank BCA",
    status: "Diproses",
    trackingNumber: "-"
  },
  {
    id: "ORD-9279",
    createdAt: "2026-10-24 19:40",
    courier: "SiCepat REG",
    customer: {
      name: "Dimas Pratama",
      phone: "081344556677",
      address: "Perum Graha Indah Blok C2, Surabaya",
      city: "Surabaya"
    },
    items: [
      {
        id: "PROD-005",
        name: "Sneakers Pria Urban Runner White",
        price: 389000,
        quantity: 1,
        image: "img/prod-005.jpg"
      }
    ],
    subtotal: 389000,
    shippingFee: 20000,
    discount: 25000,
    total: 384000,
    paymentMethod: "COD (Bayar di Tempat)",
    status: "Selesai",
    trackingNumber: "SICEPAT-7719280"
  }
];

const DEFAULT_SETTINGS = {
  storeName: "Toko Berkah Official",
  storeTagline: "Pusat Belanja Terlengkap, Termurah & Terpercaya",
  sellerName: "Admin Toko Berkah",
  sellerPhone: "0812-3456-7890",
  sellerEmail: "admin@tokoberkah.com",
  address: "Jl. Pemuda No. 100, Jakarta Pusat",
  freeShippingMin: 300000,
  flatShippingFee: 15000,
  storeLogo: "" // Jika kosong menggunakan icon default SVG
};
