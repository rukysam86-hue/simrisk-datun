/**
 * GOOGLE APPS SCRIPT - SIMRISK DATUN DRIVE UPLOADER (PER-PERMOHONAN FOLDER)
 * =========================================================================
 * Script ini mengelompokkan seluruh dokumen administrasi ke dalam 1 FOLDER KHUSUS
 * untuk setiap kegiatan pendampingan / permohonan.
 * 
 * STRUKTUR FOLDER DI GOOGLE DRIVE:
 * 📁 SIM RISK (Folder Induk Utama yang sudah ada di Drive Anda)
 *    └── 📁 [Nama Pemohon] - [Tanggal Surat]  <-- 1 SUBFOLDER PER KEGIATAN
 *           ├── 📁 01_Surat_Permohonan        <-- Scan Surat Permohonan resmi
 *           ├── 📁 02_Administrasi_JPN        <-- SP-1, Telaahan Hukum S-5, SP-2
 *           ├── 📁 03_Laporan_Progres_Pemohon <-- Multi-file (Kurva S, Foto, BA)
 *           └── 📁 04_Saran_Tindakan_JPN      <-- Lembar saran & mitigasi JPN
 * 
 * PANDUAN UPDATE DI GOOGLE APPS SCRIPT:
 * 1. Buka https://script.google.com -> Proyek "SIMRISK DATUN API"
 * 2. Ganti seluruh isi kode di Apps Script dengan kode di file ini.
 * 3. Klik tombol Simpan (ikon disket).
 * 4. Klik tombol "Deploy" (Terapkan) -> "Manage deployments" (Kelola penerapan).
 * 5. Klik ikon Pensil (Edit) -> Pilih Versi: "New version" (Versi baru).
 * 6. Klik "Deploy" (Terapkan).
 */

// OPSIONAL: Jika ingin mengunci ke ID folder tertentu, isi di sini.
// Jika dikosongkan (""), script akan OTOMATIS mendeteksi folder "SIM RISK" atau "SIMRISK_DATUN_DOKUMEN" di Google Drive Anda!
var TARGET_FOLDER_ID = "";

/**
 * Handle HTTP GET (Pengecekan status API & Folder Induk)
 */
function doGet(e) {
  var rootFolder = getAppRootFolder();
  var folderStatus = rootFolder ? ("Folder Induk Aktif: " + rootFolder.getName() + " (ID: " + rootFolder.getId() + ")") : "Folder Belum Ditemukan";

  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    message: "Google Drive Upload API SIMRISK DATUN aktif.",
    parentFolder: rootFolder ? rootFolder.getName() : "None",
    folderInfo: folderStatus,
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle HTTP POST (Menerima upload berkas dari aplikasi SIMRISK)
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Tidak ada data yang dikirim.");
    }

    var requestData = JSON.parse(e.postData.contents);
    var rawFileData = requestData.fileData; // format: data:application/pdf;base64,JVBERi0...
    var fileName = requestData.fileName || ("Dokumen_" + Utilities.formatDate(new Date(), "GMT+8", "yyyyMMdd_HHmmss"));
    var mimeType = requestData.mimeType || "application/octet-stream";
    var folderCategory = requestData.folderCategory || "umum";
    
    // Identitas Permohonan & Penamaan Subfolder: [Nama Pemohon] - [Tanggal Surat]
    var subfolderName = requestData.subfolderName || "";
    var asalSurat = requestData.asalSurat || "";
    var tanggalSurat = requestData.tanggalSurat || "";
    var permohonanId = requestData.permohonanId || "";
    var permohonanTitle = requestData.permohonanTitle || "";
    var customParentName = requestData.parentFolderName || "SIM RISK";

    if (!rawFileData) {
      throw new Error("Data file kosong.");
    }

    // Ambil string Base64 murni jika ada header data URL
    var base64Content = rawFileData;
    if (rawFileData.indexOf("base64,") !== -1) {
      base64Content = rawFileData.split("base64,")[1];
    }

    var decodedBytes = Utilities.base64Decode(base64Content);
    var blob = Utilities.newBlob(decodedBytes, mimeType, fileName);

    // 1. Dapatkan Folder Induk Utama (Memprioritaskan folder "SIM RISK" yang sudah dibuat di Drive)
    var rootFolder = getAppRootFolder(customParentName);

    // 2. Tentukan Nama Subfolder Sesuai Permintaan: [Nama Pemohon] - [Tanggal Surat]
    var targetSubfolderName = "";
    if (subfolderName && subfolderName.trim()) {
      targetSubfolderName = subfolderName.trim();
    } else if (asalSurat && tanggalSurat) {
      targetSubfolderName = asalSurat.trim() + " - " + tanggalSurat.trim();
    } else if (asalSurat) {
      targetSubfolderName = asalSurat.trim();
    } else if (permohonanTitle) {
      targetSubfolderName = (permohonanId ? (permohonanId + " - ") : "") + permohonanTitle.trim();
    } else if (permohonanId) {
      targetSubfolderName = permohonanId;
    } else {
      targetSubfolderName = "Permohonan_" + Utilities.formatDate(new Date(), "GMT+8", "yyyyMMdd");
    }

    // Bersihkan karakter yang dilarang pada sistem nama file / folder
    targetSubfolderName = targetSubfolderName.replace(/[/\\?%*:|"<>]/g, '-').trim();

    // 3. Buat atau Temukan Subfolder Kegiatan di dalam Folder Induk "SIM RISK" (BUKAN DI ROOT DRIVE)
    var permohonanFolder = getOrCreateSubFolder(rootFolder, targetSubfolderName);

    // Set permission folder agar siapa saja dengan link bisa melihat arsip kegiatan
    try {
      permohonanFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (shareErr) {
      Logger.log("Gagal set share permohonan folder: " + shareErr.toString());
    }

    // 4. Kelompokkan ke Subfolder Kategori di dalam folder kegiatan tersebut
    var categoryFolderName = mapCategoryFolderName(folderCategory);
    var targetFolder = getOrCreateSubFolder(permohonanFolder, categoryFolderName);

    // 5. Buat File di Subfolder Terkait
    var createdFile = targetFolder.createFile(blob);
    try {
      createdFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (shareFileErr) {}

    var fileId = createdFile.getId();
    var webViewLink = createdFile.getUrl();
    var previewUrl = "https://drive.google.com/file/d/" + fileId + "/preview";
    var folderUrl = permohonanFolder.getUrl();
    var parentFolderUrl = rootFolder.getUrl();

    var responsePayload = {
      status: "success",
      fileId: fileId,
      fileName: fileName,
      fileUrl: previewUrl,
      viewUrl: webViewLink,
      folderUrl: folderUrl,
      parentFolderUrl: parentFolderUrl,
      folderName: targetSubfolderName,
      parentFolderName: rootFolder.getName(),
      category: categoryFolderName
    };

    return ContentService.createTextOutput(JSON.stringify(responsePayload))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("Error doPost: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Mendapatkan Folder Induk Utama di Google Drive
 * 1. Menggunakan TARGET_FOLDER_ID jika diset spesifik
 * 2. Mencari folder "SIM RISK" atau "SIMRISK_DATUN_DOKUMEN" yang sudah dibuat oleh user di Drive
 * 3. Jika belum ada, otomatis membuat folder baru bernama "SIM RISK"
 */
function getAppRootFolder(customParentName) {
  // 1. Cek TARGET_FOLDER_ID eksplisit jika diisi
  if (TARGET_FOLDER_ID && TARGET_FOLDER_ID !== "PASTE_GOOGLE_DRIVE_FOLDER_ID_DISINI" && TARGET_FOLDER_ID.trim() !== "") {
    try {
      var folderById = DriveApp.getFolderById(TARGET_FOLDER_ID.trim());
      if (folderById && !folderById.isTrashed()) {
        return folderById;
      }
    } catch (err) {
      Logger.log("TARGET_FOLDER_ID tidak valid: " + err.toString());
    }
  }

  // 2. Daftar nama folder induk kandidat yang dicari di Google Drive pengguna
  var searchList = [];
  if (customParentName && customParentName.trim()) {
    searchList.push(customParentName.trim());
  }
  searchList.push("SIM RISK");
  searchList.push("SIMRISK_DATUN_DOKUMEN");
  searchList.push("SIMRISK DATUN");
  searchList.push("SIMRISK");

  for (var i = 0; i < searchList.length; i++) {
    var folders = DriveApp.getFoldersByName(searchList[i]);
    while (folders.hasNext()) {
      var f = folders.next();
      if (!f.isTrashed()) {
        Logger.log("Folder induk ditemukan: " + f.getName() + " (ID: " + f.getId() + ")");
        return f;
      }
    }
  }

  // 3. Jika belum ditemukan, buat folder baru "SIM RISK" di Root Google Drive
  Logger.log("Folder induk belum ditemukan, membuat folder baru: SIM RISK");
  var newRoot = DriveApp.createFolder("SIM RISK");
  try {
    newRoot.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {}
  return newRoot;
}

/**
 * Pemetaan nama subfolder administrasi di dalam folder permohonan
 */
function mapCategoryFolderName(category) {
  switch (category) {
    case "surat_masuk": return "01_Surat_Permohonan";
    case "sp1":         return "02_Administrasi_JPN";
    case "telaahan":    return "02_Administrasi_JPN";
    case "sp2":         return "02_Administrasi_JPN";
    case "laporan":     return "03_Laporan_Progres_Pemohon";
    case "saran":       return "04_Saran_Tindakan_JPN";
    default:            return "05_Lampiran_Lainnya";
  }
}

/**
 * Helper untuk mencari atau membuat subfolder di dalam folder induk
 */
function getOrCreateSubFolder(parentFolder, subFolderName) {
  var folders = parentFolder.getFoldersByName(subFolderName);
  while (folders.hasNext()) {
    var f = folders.next();
    if (!f.isTrashed()) {
      return f;
    }
  }
  return parentFolder.createFolder(subFolderName);
}
