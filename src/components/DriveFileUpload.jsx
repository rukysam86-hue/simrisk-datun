import { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, ExternalLink, X, Link as LinkIcon, RefreshCw, AlertCircle, Plus, Folder } from 'lucide-react';
import { uploadFileToDrive, uploadMultipleFilesToDrive, isDriveConfigured } from '../lib/driveService';

export default function DriveFileUpload({
  value,
  onChange,
  multiple = false,
  permohonanId = '',
  permohonanTitle = '',
  subfolderName = '',
  asalSurat = '',
  tanggalSurat = '',
  parentFolderName = 'SIM RISK',
  label = 'Dokumen (Google Drive)',
  folderCategory = 'general',
  accept = '.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg',
  required = false,
  helpText = 'Format yang didukung: PDF, Word (.docx), Excel, atau Gambar (Maks 20MB)'
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualLinkInput, setManualLinkInput] = useState('');
  const [manualTitleInput, setManualTitleInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [folderDriveUrl, setFolderDriveUrl] = useState('');
  const fileInputRef = useRef(null);

  const driveReady = isDriveConfigured();

  // Normalisasi list file untuk mode multiple
  const fileList = multiple
    ? (Array.isArray(value) ? value : (value ? [{ name: 'Dokumen Terlampir', url: value }] : []))
    : [];

  // Handle single file upload
  const handleSingleFile = async (file) => {
    if (!file) return;
    setErrorMsg('');
    setIsUploading(true);
    setUploadStatus(`Menyiapkan "${file.name}"...`);

    try {
      const res = await uploadFileToDrive(file, {
        folderCategory,
        permohonanId,
        permohonanTitle,
        subfolderName,
        asalSurat,
        tanggalSurat,
        parentFolderName
      }, (prog) => {
        setUploadStatus(prog.message);
      });

      setUploadedFileName(file.name);
      if (res.folderUrl) setFolderDriveUrl(res.folderUrl);

      if (onChange) {
        onChange(res.fileUrl, {
          folderUrl: res.folderUrl,
          fileId: res.fileId,
          fileName: file.name
        });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mengunggah file.');
    } finally {
      setIsUploading(false);
      setUploadStatus('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle multiple files upload
  const handleMultipleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setErrorMsg('');
    setIsUploading(true);

    try {
      const res = await uploadMultipleFilesToDrive(files, {
        folderCategory,
        permohonanId,
        permohonanTitle,
        subfolderName,
        asalSurat,
        tanggalSurat,
        parentFolderName
      }, (prog) => {
        setUploadStatus(prog.message);
      });

      if (res.folderUrl) setFolderDriveUrl(res.folderUrl);

      const updatedList = [...fileList, ...res.uploadedFiles];
      if (onChange) {
        onChange(updatedList, { folderUrl: res.folderUrl });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mengunggah sebagian atau seluruh file.');
    } finally {
      setIsUploading(false);
      setUploadStatus('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFilesSelected = (files) => {
    if (multiple) {
      handleMultipleFiles(files);
    } else if (files && files[0]) {
      handleSingleFile(files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleClearSingle = () => {
    setUploadedFileName('');
    setErrorMsg('');
    if (onChange) onChange('');
  };

  const handleRemoveMultipleItem = (index) => {
    const updated = fileList.filter((_, idx) => idx !== index);
    if (onChange) onChange(updated);
  };

  const handleAddManualLink = (e) => {
    e.preventDefault();
    if (!manualLinkInput.trim()) return;

    if (multiple) {
      const item = {
        name: manualTitleInput.trim() || `Tautan Dokumen ${fileList.length + 1}`,
        url: manualLinkInput.trim()
      };
      const updated = [...fileList, item];
      if (onChange) onChange(updated);
      setManualLinkInput('');
      setManualTitleInput('');
    } else {
      if (onChange) onChange(manualLinkInput.trim());
      setIsManualMode(false);
    }
  };

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      {/* Header Label & Kontrol */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <label className="form-label" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
            <UploadCloud size={16} color="var(--color-primary-shadow)" />
            {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
          </label>
          {(subfolderName || permohonanId) && (
            <span style={{ fontSize: '0.72rem', background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }} title="Folder Target di Google Drive">
              📁 {subfolderName || `#${permohonanId}`}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {folderDriveUrl && (
            <a
              href={folderDriveUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.78rem',
                color: 'var(--color-primary-shadow)',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                textDecoration: 'none',
                background: '#f0fdf4',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #bbf7d0'
              }}
              title="Buka Folder Arsip Permohonan Ini di Google Drive"
            >
              <Folder size={12} /> Buka Folder Kegiatan
            </a>
          )}
          <button
            type="button"
            onClick={() => setIsManualMode(!isManualMode)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-secondary-shadow)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <LinkIcon size={12} />
            {isManualMode ? 'Mode Upload File' : 'Input Link Manual'}
          </button>
        </div>
      </div>

      {/* Mode Manual Link Input */}
      {isManualMode ? (
        <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: '0.5rem' }}>
          {multiple ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Judul / Nama Dokumen (Contoh: Kurva S Realisasi)"
                value={manualTitleInput}
                onChange={(e) => setManualTitleInput(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://drive.google.com/..."
                  value={manualLinkInput}
                  onChange={(e) => setManualLinkInput(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="button" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={handleAddManualLink}>
                  + Tambah
                </button>
              </div>
            </div>
          ) : (
            <div>
              <input
                type="url"
                className="form-input"
                placeholder="https://drive.google.com/..."
                value={value || ''}
                required={required && !value}
                onChange={(e) => {
                  if (onChange) onChange(e.target.value);
                }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.35rem', marginBottom: 0 }}>
                Tempelkan link share Google Drive dokumen di sini.
              </p>
            </div>
          )}
        </div>
      ) : null}

      {/* TAMPILAN MODE MULTIPLE FILE */}
      {multiple ? (
        <div>
          {/* Daftar File yang Sudah Diunggah */}
          {fileList.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {fileList.map((fileItem, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.9rem',
                    backgroundColor: '#f0fdf4',
                    border: '1.5px solid #86efac',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 2px 0 #bbf7d0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
                    <CheckCircle2 size={18} color="#16a34a" style={{ flexShrink: 0 }} />
                    <div style={{ overflow: 'hidden' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#166534', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {fileItem.name || `Dokumen Pendukung #${idx + 1}`}
                      </span>
                      <a
                        href={fileItem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--color-secondary-shadow)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          textDecoration: 'underline',
                          fontWeight: 600
                        }}
                      >
                        Pratinjau di Google Drive <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveMultipleItem(idx)}
                    style={{
                      background: '#fee2e2',
                      border: '1px solid #fca5a5',
                      color: '#dc2626',
                      cursor: 'pointer',
                      padding: '0.3rem',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                    title="Hapus file ini"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Dropzone untuk menambah file (multi) */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
              backgroundColor: dragActive ? '#f0fdf4' : 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
              padding: fileList.length > 0 ? '1rem' : '1.5rem 1rem',
              textAlign: 'center',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
          >
            {isUploading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    border: '3px solid #e5e5e5',
                    borderTop: '3px solid var(--color-primary)',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }}
                />
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text-main)' }}>
                  {uploadStatus || 'Sedang mengunggah file ke Google Drive...'}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary-shadow)', fontWeight: 700, fontSize: '0.9rem' }}>
                  <Plus size={18} />
                  {fileList.length > 0 ? 'Tambah Berkas Pendukung Lainnya' : 'Pilih Berkas Pelaporan (Bisa Lebih Dari 1 File)'}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                  {helpText} — Seluruh berkas akan otomatis masuk ke folder kegiatan pendampingan ini.
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* TAMPILAN MODE SINGLE FILE */
        <div>
          {value ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1.15rem',
                backgroundColor: '#f0fdf4',
                border: '2px solid #86efac',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 2px 0 #bbf7d0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                <CheckCircle2 size={24} color="#16a34a" style={{ flexShrink: 0 }} />
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#166534', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {uploadedFileName || 'Dokumen Tersimpan di Google Drive'}
                  </div>
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--color-secondary-shadow)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      textDecoration: 'underline',
                      fontWeight: 600,
                      marginTop: '0.15rem'
                    }}
                  >
                    Buka / Pratinjau di Google Drive <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="btn btn-outline"
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.8rem',
                    textTransform: 'none',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <RefreshCw size={12} /> Ganti File
                </button>
                <button
                  type="button"
                  onClick={handleClearSingle}
                  style={{
                    background: '#fee2e2',
                    border: '1px solid #fca5a5',
                    color: '#dc2626',
                    cursor: 'pointer',
                    padding: '0.35rem',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Hapus tautan file"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                backgroundColor: dragActive ? '#f0fdf4' : 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem 1rem',
                textAlign: 'center',
                cursor: isUploading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              {isUploading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      border: '3px solid #e5e5e5',
                      borderTop: '3px solid var(--color-primary)',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }}
                  />
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-main)' }}>
                    {uploadStatus || 'Sedang mengunggah ke Google Drive...'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Berkas akan otomatis disimpan ke folder kegiatan pendampingan
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      border: '2px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 0 var(--color-border)',
                      marginBottom: '0.2rem'
                    }}
                  >
                    <UploadCloud size={24} color="var(--color-primary-shadow)" />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-main)' }}>
                    Klik untuk pilih file atau seret file ke sini
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    {helpText}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFilesSelected(e.target.files);
          }
        }}
      />

      {/* Pesan Error */}
      {errorMsg && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--color-danger)',
            fontSize: '0.8rem',
            marginTop: '0.5rem',
            padding: '0.5rem',
            background: '#fef2f2',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid #fee2e2'
          }}
        >
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Notifikasi info mode demo */}
      {!driveReady && !isManualMode && (
        <div
          style={{
            fontSize: '0.72rem',
            color: '#b45309',
            backgroundColor: '#fffbeb',
            border: '1px solid #fef3c7',
            padding: '0.35rem 0.6rem',
            borderRadius: 'var(--radius-sm)',
            marginTop: '0.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <span>ℹ️ <b>Mode Uji Coba:</b> URL Google Apps Script belum diset di <code>.env</code>. File dan folder disimulasikan secara lokal.</span>
        </div>
      )}
    </div>
  );
}
