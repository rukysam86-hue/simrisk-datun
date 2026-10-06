/**
 * Google Drive API Service (via Google Apps Script Web App)
 * 
 * Mengirim file dari browser ke Google Apps Script Web App
 * yang bertindak sebagai proxy aman untuk menyimpan file ke Google Drive
 * dengan pengelompokan 1 folder per kegiatan permohonan pendampingan.
 */

const SCRIPT_URL = import.meta.env.VITE_GOOGLE_DRIVE_UPLOAD_URL || 'https://script.google.com/macros/s/AKfycbyS55OCeJ2saPAbimS1IG0pUKfHyKz_vGHF32z_Jb0ar8UVga19X1VocP6ZzHdoDlHD/exec';

/**
 * Mengecek apakah Google Drive Upload API sudah dikonfigurasi
 */
export const isDriveConfigured = () => {
  return !!(SCRIPT_URL && !SCRIPT_URL.includes('your_') && SCRIPT_URL.startsWith('https://script.google.com'));
};

/**
 * Mengonversi File objek browser ke Base64 Data URL
 * @param {File} file 
 * @returns {Promise<string>}
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Mengunggah satu file ke Google Drive ke dalam folder permohonan tertentu
 * @param {File} file - Objek file dari input
 * @param {Object|string} options - Opsi upload atau folderCategory string
 * @param {Function} onProgress - Callback status progres opsional
 * @returns {Promise<{ success: boolean, fileUrl: string, fileId?: string, fileName: string, folderUrl?: string }>}
 */
export const uploadFileToDrive = async (file, options = {}, onProgress = () => {}) => {
  if (!file) {
    throw new Error('Tidak ada file yang dipilih.');
  }

  // Normalisasi opsi
  const opts = typeof options === 'string' ? { folderCategory: options } : (options || {});
  const folderCategory = opts.folderCategory || 'general';
  const permohonanId = opts.permohonanId || 'PERMOHONAN_UMUM';
  const permohonanTitle = opts.permohonanTitle || '';
  const asalSurat = opts.asalSurat || '';
  const tanggalSurat = opts.tanggalSurat || '';
  const parentFolderName = opts.parentFolderName || 'SIM RISK';
  const parentFolderId = opts.parentFolderId || import.meta.env.VITE_GOOGLE_DRIVE_PARENT_FOLDER_ID || '1xpIMIPoRw8jS062W0NpXgi4d6RHLDW49';

  // Tentukan nama subfolder: [Nama Pemohon] - [Tanggal Surat]
  let subfolderName = opts.subfolderName || '';
  if (!subfolderName) {
    if (asalSurat && tanggalSurat) {
      subfolderName = `${asalSurat} - ${tanggalSurat}`;
    } else if (asalSurat) {
      subfolderName = asalSurat;
    } else if (permohonanTitle) {
      subfolderName = `${permohonanId ? permohonanId + ' - ' : ''}${permohonanTitle}`;
    } else {
      subfolderName = permohonanId || 'PERMOHONAN';
    }
  }
  subfolderName = subfolderName.replace(/[/\\?%*:|"<>]/g, '-').trim();

  // Batas ukuran file 20MB untuk kestabilan Google Apps Script
  const MAX_SIZE_MB = 20;
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`Ukuran file "${file.name}" melebihi batas maksimal ${MAX_SIZE_MB}MB.`);
  }

  onProgress({ stage: 'reading', message: `Membaca file "${file.name}"...` });
  const base64DataUrl = await fileToBase64(file);

  // Jika URL script belum dikonfigurasi, gunakan fallback simulasi (demo mode)
  if (!isDriveConfigured()) {
    console.warn('[Google Drive API] VITE_GOOGLE_DRIVE_UPLOAD_URL belum dikonfigurasi. Menggunakan simulasi per-folder permohonan.');
    await new Promise(res => setTimeout(res, 900)); // Simulasi upload
    
    const dummyId = `demo_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    return {
      success: true,
      fileId: dummyId,
      fileUrl: `https://drive.google.com/file/d/1demo-${encodeURIComponent(file.name.replace(/\s+/g, '_'))}/preview`,
      viewUrl: `https://drive.google.com/file/d/1demo-${encodeURIComponent(file.name.replace(/\s+/g, '_'))}/view`,
      folderUrl: `https://drive.google.com/drive/folders/demo-folder-${encodeURIComponent(subfolderName)}`,
      fileName: file.name,
      folderName: subfolderName,
      isDemo: true
    };
  }

  onProgress({ stage: 'uploading', message: `Mengunggah "${file.name}" ke folder [${subfolderName}] di Google Drive (${parentFolderName})...` });

  const payload = {
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
    fileData: base64DataUrl,
    folderCategory: folderCategory,
    permohonanId: permohonanId,
    permohonanTitle: permohonanTitle,
    asalSurat: asalSurat,
    tanggalSurat: tanggalSurat,
    subfolderName: subfolderName,
    parentFolderName: parentFolderName,
    parentFolderId: parentFolderId
  };

  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Server Google Apps Script mengembalikan status: ${response.status}`);
    }

    const result = await response.json();

    if (result.status === 'success') {
      return {
        success: true,
        fileId: result.fileId,
        fileUrl: result.fileUrl || `https://drive.google.com/file/d/${result.fileId}/preview`,
        viewUrl: result.viewUrl,
        folderUrl: result.folderUrl,
        folderName: result.folderName,
        fileName: file.name
      };
    } else {
      throw new Error(result.message || 'Gagal mengunggah file ke Google Drive.');
    }
  } catch (error) {
    console.error('[Google Drive API Error]:', error);
    throw new Error(error.message || 'Terjadi kesalahan saat mengunggah ke Google Drive.');
  }
};

/**
 * Mengunggah banyak file sekaligus ke dalam folder kegiatan permohonan
 * @param {FileList|File[]} files - Daftar file yang dipilih
 * @param {Object} options - { folderCategory, permohonanId, permohonanTitle }
 * @param {Function} onProgress - Callback status progres (current, total, file)
 * @returns {Promise<{ uploadedFiles: Array<{ name: string, url: string, fileId?: string }>, folderUrl?: string }>}
 */
export const uploadMultipleFilesToDrive = async (files, options = {}, onProgress = () => {}) => {
  const fileArray = Array.from(files || []);
  if (fileArray.length === 0) {
    return { uploadedFiles: [], folderUrl: null };
  }

  const results = [];
  let mainFolderUrl = null;

  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i];
    onProgress({
      currentIndex: i + 1,
      totalFiles: fileArray.length,
      currentFileName: file.name,
      message: `Mengunggah file ${i + 1} dari ${fileArray.length}: ${file.name}`
    });

    const res = await uploadFileToDrive(file, options, (subProg) => {
      onProgress({
        currentIndex: i + 1,
        totalFiles: fileArray.length,
        currentFileName: file.name,
        message: `(${i + 1}/${fileArray.length}) ${subProg.message}`
      });
    });

    results.push({
      name: file.name,
      url: res.fileUrl,
      fileId: res.fileId,
      viewUrl: res.viewUrl
    });

    if (res.folderUrl && !mainFolderUrl) {
      mainFolderUrl = res.folderUrl;
    }
  }

  return {
    uploadedFiles: results,
    folderUrl: mainFolderUrl
  };
};
