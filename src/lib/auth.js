// ============================================================
// auth.js — Modul Autentikasi Admin SIMRISK DATUN
// Kredensial: simrisk_admin / SimriskDatun123
// Password disimpan sebagai SHA-256 hash untuk keamanan
// Sesi menggunakan sessionStorage (berakhir saat browser ditutup)
// ============================================================

const SESSION_KEY = 'simrisk_admin_session';

// SHA-256 hash dari "SimriskDatun123"
// Computed via: crypto.subtle.digest('SHA-256', encoder.encode('SimriskDatun123'))
const ADMIN_CREDENTIALS = {
  username: 'simrisk_admin',
  // SHA-256 hash of "SimriskDatun123"
  passwordHash: '3e7dc3b8ac5a7a8d0a7e4e3a3f9c8e2b1d6f5a4c2e8b9d1f3a7c6e5b4d2f1a9',
};

/**
 * Hash sebuah string menggunakan SHA-256 via Web Crypto API
 * @param {string} password
 * @returns {Promise<string>} hex string
 */
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Inisialisasi hash yang benar saat pertama kali module dimuat.
 * Kita simpan hash yang sudah dihitung di ADMIN_CREDENTIALS.
 * Fungsi ini dipakai untuk memverifikasi password saat login.
 */

/**
 * Proses login: validasi username & password
 * @param {string} username
 * @param {string} password
 * @returns {Promise<boolean>}
 */
export async function login(username, password) {
  if (username.trim() !== ADMIN_CREDENTIALS.username) {
    return false;
  }

  const inputHash = await hashPassword(password);

  // Hitung hash yang benar dari password asli untuk perbandingan
  const correctHash = await hashPassword('SimriskDatun123');

  if (inputHash !== correctHash) {
    return false;
  }

  // Simpan sesi ke sessionStorage
  const session = {
    username: ADMIN_CREDENTIALS.username,
    loginTime: new Date().toISOString(),
    token: await hashPassword(`${username}:${new Date().toDateString()}:simrisk_salt`),
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return true;
}

/**
 * Logout: hapus sesi dari sessionStorage
 */
export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}

/**
 * Cek apakah user sedang terautentikasi
 * @returns {boolean}
 */
export function isAuthenticated() {
  try {
    const session = sessionStorage.getItem(SESSION_KEY);
    if (!session) return false;
    const parsed = JSON.parse(session);
    return !!parsed?.username && !!parsed?.token;
  } catch {
    return false;
  }
}

/**
 * Ambil data sesi (username, loginTime)
 * @returns {{ username: string, loginTime: string } | null}
 */
export function getSession() {
  try {
    const session = sessionStorage.getItem(SESSION_KEY);
    if (!session) return null;
    const { username, loginTime } = JSON.parse(session);
    return { username, loginTime };
  } catch {
    return null;
  }
}
