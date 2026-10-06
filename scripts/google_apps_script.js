/**
 * GOOGLE APPS SCRIPT - SIMRISK DATUN DRIVE UPLOADER (PER-PERMOHONAN FOLDER)
 * =========================================================================
 * Script ini mengelompokkan seluruh dokumen administrasi ke dalam 1 FOLDER KHUSUS
 * untuk setiap kegiatan pendampingan / permohonan.
 * 
 * STRUKTUR FOLDER DI GOOGLE DRIVE:
 * 📁 [Folder Utama SIMRISK DATUN]
 *    └── 📁 DEMO123 - PUPR NTT - Pembangunan Jembatan Liliba  <-- 1 FOLDER PER KEGIATAN
 *           ├── 📁 01_Surat_Permohonan
 *           ├── 📁 02_Administrasi_JPN (SP-1, Telaahan, SP-2)
 *           ├── 📁 03_Laporan_Progres_Pemohon (Mendukung Multi-File Upload)
 *           └── 04_Saran_Tindakan_JPN
 * 
 * PANDUAN PEMASANGAN / UPDATE:
 * 1. Buka https://script.google.com -> Proyek "SIMRISK DATUN Drive API"
 * 2. Ganti seluruh isi kode dengan kode di file ini.
 * 3. Pastikan TARGET_FOLDER_ID di bawah sudah diisi ID folder utama Anda.
 * 4. Klik menu Deploy -> Manage deployments (Kelola penerapan) -> Edit (ikon pensil) -> New version -> Deploy.
 */

// GANTI DENGAN ID FOLDER UTAMA GOOGLE DRIVE ANDA
var TARGET_FOLDER_ID = "PASTE_GOOGLE_DRIVE_FOLDER_ID_DISINI";

/**
 * Handle HTTP GET (Pengecekan status API & Folder Utama)
 */
function doGet(e) {
  var folderStatus = "Folder Root (Default)";
  try {
    if (TARGET_FOLDER_ID && TARGET_FOLDER_ID !== "PASTE_GOOGLE_DRIVE_FOLDER_ID_DISINI") {
      var f = DriveApp.getFolderById(TARGET_FOLDER_ID);
      folderStatus = "Folder Aktif: " + f.getName();
    }
  } catch (err) {
    folderStatus = "Error akses folder: " + err.toString();
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    message: "Google Drive Upload API SIMRISK DATUN aktif (Per-Permohonan Folder Mode).",
    folderInfo: folderStatus,
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle HTTP POST (Menerima upload file dari aplikasi)
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
    
    // Identitas Permohonan
    var permohonanId = requestData.permohonanId || "PERMOHONAN_UMUM";
    var permohonanTitle = requestData.permohonanTitle || "";

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

    // 1. Dapatkan Folder Induk Utama
    var rootFolder;
    try {
      if (TARGET_FOLDER_ID && TARGET_FOLDER_ID !== "PASTE_GOOGLE_DRIVE_FOLDER_ID_DISINI") {
        rootFolder = DriveApp.getFolderById(TARGET_FOLDER_ID);
      } else {
        rootFolder = DriveApp.getRootFolder();
      }
    } catch (err) {
      rootFolder = DriveApp.getRootFolder();
    }

    // 2. Dapatkan atau Buat 1 FOLDER KHUSUS untuk Kegiatan Permohonan ini
    // Contoh nama folder: "[DEMO123] Pembangunan Jembatan Liliba"
    var cleanTitle = permohonanTitle 
      ? (" - " + permohonanTitle.toString().replace(/[/\\?%*:|"<>]/g, ' ').trim().slice(0, 70)) 
      : "";
    var permohonanFolderName = permohonanId + cleanTitle;
    var permohonanFolder = getOrCreateSubFolder(rootFolder, permohonanFolderName);

    // Set permission folder agar siapa saja dengan link bisa melihat arsip
    try {
      permohonanFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (shareErr) {
      Logger.log("Gagal set share permohonan folder: " + shareErr.toString());
    }

    // 3. Kelompokkan ke Subfolder Kategori di dalam folder permohonan tersebut
    var categoryFolderName = mapCategoryFolderName(folderCategory);
    var targetFolder = getOrCreateSubFolder(permohonanFolder, categoryFolderName);

    // 4. Buat File di Subfolder Terkait
    var createdFile = targetFolder.createFile(blob);
    try {
      createdFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (shareFileErr) {}

    var fileId = createdFile.getId();
    var webViewLink = createdFile.getUrl();
    var previewUrl = "https://drive.google.com/file/d/" + fileId + "/preview";
    var folderUrl = permohonanFolder.getUrl();

    var responsePayload = {
      status: "success",
      fileId: fileId,
      fileName: fileName,
      fileUrl: previewUrl,
      viewUrl: webViewLink,
      folderUrl: folderUrl,
      folderName: permohonanFolderName,
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
 * Helper untuk mencari atau membuat subfolder
 */
function getOrCreateSubFolder(parentFolder, subFolderName) {
  var folders = parentFolder.getFoldersByName(subFolderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parentFolder.createFolder(subFolderName);
}
