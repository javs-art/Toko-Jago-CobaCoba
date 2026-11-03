// js/supabase-config.js
// Konfigurasi & Inisialisasi Supabase Client SDK

const SUPABASE_CONFIG = {
  // Masukkan Project URL dan Anon Key Supabase Anda di sini:
  PROJECT_URL: localStorage.getItem("supabase_project_url") || "https://jjowjsjhyrzhjzlfzkxk.supabase.co",
  PUBLISHABLE_KEY: localStorage.getItem("supabase_publishable_key") || "sb_publishable_zLafnRgT4c_1-BnqIubbuQ_DbsyV2dT"
};
let _supabaseInstance = null;

/**
 * Cek apakah kredensial Supabase (URL & Key) sudah diisi
 */
function isSupabaseConfigured() {
  const url = (SUPABASE_CONFIG.PROJECT_URL || localStorage.getItem("supabase_project_url") || "").trim();
  const key = (SUPABASE_CONFIG.PUBLISHABLE_KEY || localStorage.getItem("supabase_publishable_key") || localStorage.getItem("supabase_anon_key") || "").trim();
  return Boolean(url && key);
}

/**
 * Mengambil atau menginisialisasi instance Supabase Client
 */
function getSupabaseClient() {
  if (_supabaseInstance) return _supabaseInstance;

  const url = (SUPABASE_CONFIG.PROJECT_URL || localStorage.getItem("supabase_project_url") || "").trim();
  const key = (SUPABASE_CONFIG.PUBLISHABLE_KEY || localStorage.getItem("supabase_publishable_key") || localStorage.getItem("supabase_anon_key") || "").trim();

  if (url && key && window.supabase && typeof window.supabase.createClient === "function") {
    try {
      _supabaseInstance = window.supabase.createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
      console.log("⚡ Supabase Client siap diinisialisasi:", url);
      return _supabaseInstance;
    } catch (e) {
      console.warn("⚠️ Inisialisasi Supabase gagal:", e.message);
      return null;
    }
  }
  return null;
}

/**
 * Update Project URL atau Key dari Seller UI / Programatik
 */
function updateSupabaseConfig(url, key = null) {
  if (typeof url === "string") {
    const cleanUrl = url.trim();
    SUPABASE_CONFIG.PROJECT_URL = cleanUrl;
    if (cleanUrl) {
      localStorage.setItem("supabase_project_url", cleanUrl);
    } else {
      localStorage.removeItem("supabase_project_url");
    }
  }

  if (typeof key === "string") {
    const cleanKey = key.trim();
    SUPABASE_CONFIG.PUBLISHABLE_KEY = cleanKey;
    if (cleanKey) {
      localStorage.setItem("supabase_publishable_key", cleanKey);
      localStorage.setItem("supabase_anon_key", cleanKey);
    } else {
      localStorage.removeItem("supabase_publishable_key");
      localStorage.removeItem("supabase_anon_key");
    }
  }

  // Reset instance agar client baru dibuat dengan kredensial terbaru
  _supabaseInstance = null;
  return getSupabaseClient();
}

/**
 * Uji koneksi nyata ke Supabase Project
 */
async function testSupabaseConnection() {
  const url = (SUPABASE_CONFIG.PROJECT_URL || localStorage.getItem("supabase_project_url") || "").trim();
  const key = (SUPABASE_CONFIG.PUBLISHABLE_KEY || localStorage.getItem("supabase_publishable_key") || localStorage.getItem("supabase_anon_key") || "").trim();

  if (!url) {
    return {
      success: false,
      code: "NO_URL",
      message: "Supabase Project URL belum diisi! Silakan masukkan URL project Anda (contoh: https://xyz.supabase.co)."
    };
  }

  if (!key) {
    return {
      success: false,
      code: "NO_KEY",
      message: "Supabase Anon / Public API Key belum diisi! Salin key dari menu Project Settings -> API di Supabase."
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      code: "NO_CLIENT",
      message: "Gagal membuat client Supabase. Pastikan library Supabase termuat dan format kredensial benar."
    };
  }

  try {
    const { data, error } = await client.from("products").select("id").limit(1);

    if (error) {
      // 1. Error API Key
      if (error.message && (error.message.includes("Invalid API key") || error.message.includes("JWT") || error.code === "PGRST301")) {
        return {
          success: false,
          code: "INVALID_KEY",
          message: "API Key tidak valid! Pastikan Anda menyalin 'anon public' API Key dari Supabase Dashboard > Project Settings > API."
        };
      }

      // 2. Error Tabel Belum Ada
      if (error.code === "42P01" || (error.message && error.message.includes("does not exist"))) {
        return {
          success: false,
          code: "TABLE_NOT_FOUND",
          message: "Tabel 'products' belum dibuat di Supabase! Harap salin & jalankan script 'supabase_setup.sql' di SQL Editor Supabase."
        };
      }

      // 3. Error RLS / Permission
      if (error.code === "42501" || (error.message && error.message.includes("permission denied"))) {
        return {
          success: false,
          code: "PERMISSION_DENIED",
          message: "Akses ditolak (RLS). Harap jalankan script 'supabase_setup.sql' di SQL Editor Supabase untuk mengaktifkan izin tabel publik."
        };
      }

      return {
        success: false,
        code: error.code || "DB_ERROR",
        message: `Terhubung ke URL tetapi ada kendala Supabase: ${error.message}`
      };
    }

    return {
      success: true,
      code: "OK",
      message: "Berhasil terhubung ke Supabase Cloud dan tabel 'products' terbaca!",
      data
    };
  } catch (err) {
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: `Gagal menghubungi Supabase: ${err.message || err}. Pastikan URL benar dan internet aktif.`
    };
  }
}
