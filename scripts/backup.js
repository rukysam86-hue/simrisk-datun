import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Format Timestamp (YYYY-MM-DD_HH-mm-ss)
const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

const backupsDir = path.join(rootDir, 'backups');
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

const backupZipName = `simrisk-datun-backup-${timestamp}.zip`;
const backupZipPath = path.join(backupsDir, backupZipName);
const latestZipPath = path.join(backupsDir, 'simrisk-datun-backup-latest.zip');

console.log('========================================================');
console.log('       SIMRISK DATUN - BACKUP SELURUH APLIKASI           ');
console.log('========================================================');
console.log(`[1/5] Mempersiapkan backup pada: ${now.toLocaleString('id-ID')}`);

// 2. Daftar file & folder yang dimasukkan ke backup
const itemsToInclude = [
  'src',
  'public',
  'scripts',
  'screenshots',
  'PANDUAN_PENGGUNAAN_SIMRISK_DATUN.docx',
  '.env',
  '.env.example',
  'package.json',
  'package-lock.json',
  'vite.config.js',
  'index.html',
  'vercel.json',
  '.gitignore',
  '.npmrc',
  '.oxlintrc.json',
  'README.md',
  'agent.md'
].filter((item) => fs.existsSync(path.join(rootDir, item)));

console.log(`[2/5] Memverifikasi item yang akan di-backup (${itemsToInclude.length} item ditemukan)...`);
itemsToInclude.forEach((item) => console.log(`   - ${item}`));

// Buat file panduan restorasi ringkas
const restoreGuideContent = `===============================================================
PANDUAN RESTORASI BACKUP SIMRISK DATUN KEJATI NTT
Waktu Backup: ${now.toISOString()} (${now.toLocaleString('id-ID')})
File Backup : ${backupZipName}
===============================================================

Langkah-langkah Memulihkan (Restore) Aplikasi:

1. Ekstrak (Unzip) seluruh isi file arsip ini ke folder tujuan.
2. Pastikan file .env sudah berada di root folder (sudah ter-backup di dalam zip ini).
3. Buka Terminal / PowerShell di folder tersebut.
4. Jalankan perintah instalasi dependency:
      npm install
5. Jalankan aplikasi di mode lokal / development:
      npm run dev
6. Untuk build ke mode produksi:
      npm run build

Catatan:
- File .env berisi konfigurasi integrasi Google Apps Script Web App & Folder ID.
- Komponen backend cloud menggunakan Google Drive & Supabase (opsional).
===============================================================
`;

const restoreGuidePath = path.join(backupsDir, 'PANDUAN_RESTORASI.txt');
fs.writeFileSync(restoreGuidePath, restoreGuideContent, 'utf-8');

// 3. Eksekusi pembuatan ZIP menggunakan native tar Windows (bsdtar)
console.log(`[3/5] Mengompresi file ke dalam arsip ZIP: ${backupZipName}...`);
try {
  // Masukkan PANDUAN_RESTORASI.txt dan itemsToInclude
  const args = ['-a', '-c', '-f', backupZipPath, ...itemsToInclude, 'backups/PANDUAN_RESTORASI.txt'];
  const quotedArgs = args.map((arg) => (arg.includes(' ') ? `"${arg}"` : arg)).join(' ');
  
  execSync(`tar ${quotedArgs}`, { cwd: rootDir, stdio: 'inherit' });
  
  // Buat copy simrisk-datun-backup-latest.zip
  fs.copyFileSync(backupZipPath, latestZipPath);
  console.log(`[OK] Arsip ZIP berhasil dibuat di:`);
  console.log(`     ${backupZipPath}`);
} catch (err) {
  console.error('[GAGAL] Gagal membuat ZIP dengan tar:', err.message);
  process.exit(1);
}

// 4. Salin ke direktori luar jika memungkinkan (C:\\Users\\JD24\\Documents)
console.log(`[4/5] Menyalin salinan cadangan sekunder ke Documents...`);
const secondaryDir = 'C:\\Users\\JD24\\Documents';
let secondaryPath = null;
try {
  if (fs.existsSync(secondaryDir)) {
    secondaryPath = path.join(secondaryDir, backupZipName);
    fs.copyFileSync(backupZipPath, secondaryPath);
    console.log(`[OK] Salinan sekunder berhasil disimpan di:`);
    console.log(`     ${secondaryPath}`);
  }
} catch (e) {
  console.log(`[INFO] Salinan sekunder dilewati: ${e.message}`);
}

// 5. Tampilkan ringkasan dan ukuran file
const stats = fs.statSync(backupZipPath);
const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

console.log('========================================================');
console.log('            BACKUP SELESAI DENGAN SUKSES!               ');
console.log('========================================================');
console.log(`File Utama    : ${backupZipPath}`);
if (secondaryPath) {
  console.log(`File Cadangan : ${secondaryPath}`);
}
console.log(`Latest Alias  : ${latestZipPath}`);
console.log(`Ukuran Arsip  : ${sizeMB} MB (${stats.size.toLocaleString('id-ID')} bytes)`);
console.log(`Status        : Siap digunakan kapan saja untuk restorasi.`);
console.log('========================================================');
