import { useState, useRef } from 'react';
import { Save, Mail, Calendar, FileText, Building, UploadCloud, CheckCircle2, X, AlertCircle, Folder, Link as LinkIcon, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { addPermohonan, generateId } from '../data/store';
import { uploadFileToDrive } from '../lib/driveService';

function PermohonanForm() {
  const navigate = useNavigate();
  const [permohonanId] = useState(() => generateId());
  const [formData, setFormData] = useState({
    asalSurat: '',
    nomorSurat: '',
    tanggalSurat: '',
    perihal: '',
    isiSurat: '',
    linkSurat: '',
    kategoriPermohonan: 'Pendampingan Hukum Proyek Infrastruktur'
  });

  // State berkas yang dipilih (diunggah hanya saat form disubmit)
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isManualLinkMode, setIsManualLinkMode] = useState(false);
  const fileInputRef = useRef(null);

  // Status submission & progress upload
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgressText, setSubmitProgressText] = useState('');

  // Perhitungan nama subfolder tujuan: [Nama Pemohon] - [Tanggal Surat]
  const targetSubfolderName = (formData.asalSurat && formData.tanggalSurat)
    ? `${formData.asalSurat.trim()} - ${formData.tanggalSurat.trim()}`
    : (formData.asalSurat ? `${formData.asalSurat.trim()} - [Tanggal Surat]` : '[Nama Pemohon] - [Tanggal Surat]');

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 20 * 1024 * 1024) {
        alert(`Ukuran berkas "${file.name}" melebihi batas maksimal 20MB.`);
        return;
      }
      setSelectedFile(file);
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 20 * 1024 * 1024) {
        alert(`Ukuran berkas "${file.name}" melebihi batas maksimal 20MB.`);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validasi Kelengkapan Data Formulir
    if (!formData.asalSurat.trim()) {
      alert('Mohon isi Asal Surat (Instansi / Pemohon).');
      return;
    }
    if (!formData.nomorSurat.trim()) {
      alert('Mohon isi Nomor Surat.');
      return;
    }
    if (!formData.tanggalSurat) {
      alert('Mohon tentukan Tanggal Surat.');
      return;
    }
    if (!formData.perihal.trim()) {
      alert('Mohon isi Perihal Surat.');
      return;
    }
    if (!formData.isiSurat.trim()) {
      alert('Mohon isi Ringkasan Isi Surat.');
      return;
    }
    if (!selectedFile && !formData.linkSurat.trim()) {
      alert('Mohon pilih dan lampirkan berkas scan surat permohonan resmi (.pdf, .docx, dsb.) sebelum menyimpan.');
      return;
    }

    setIsSubmitting(true);

    let finalPdfUrl = formData.linkSurat.trim();
    let finalDriveFolderUrl = '';
    const cleanSubfolderName = `${formData.asalSurat.trim()} - ${formData.tanggalSurat.trim()}`.replace(/[/\\?%*:|"<>]/g, '-').trim();

    try {
      // 2. Unggah Surat ke Google Drive (HANYA saat data lengkap disubmit)
      if (selectedFile) {
        setSubmitProgressText(`Mengunggah "${selectedFile.name}" ke Google Drive folder: SIM RISK / ${cleanSubfolderName}...`);

        const uploadRes = await uploadFileToDrive(selectedFile, {
          folderCategory: 'surat_masuk',
          permohonanId: permohonanId,
          permohonanTitle: formData.perihal.trim(),
          asalSurat: formData.asalSurat.trim(),
          tanggalSurat: formData.tanggalSurat.trim(),
          subfolderName: cleanSubfolderName,
          parentFolderName: 'SIM RISK'
        }, (prog) => {
          setSubmitProgressText(prog.message);
        });

        finalPdfUrl = uploadRes.fileUrl;
        finalDriveFolderUrl = uploadRes.folderUrl;
      }

      setSubmitProgressText('Menyimpan data permohonan ke sistem...');

      // 3. Simpan data permohonan ke Database / Storage
      const newPermohonan = {
        id: permohonanId,
        currentStep: 1, // Start at step 1
        driveFolderUrl: finalDriveFolderUrl,
        suratData: {
          asalSurat: formData.asalSurat.trim(),
          namaPemohon: formData.asalSurat.trim(),
          nomorSurat: formData.nomorSurat.trim(),
          tanggalSurat: formData.tanggalSurat.trim(),
          perihal: formData.perihal.trim(),
          isiSurat: formData.isiSurat.trim(),
          pdfUrl: finalPdfUrl,
          linkSurat: finalPdfUrl,
          pin: permohonanId,
          kategoriPermohonan: formData.kategoriPermohonan,
          driveFolderUrl: finalDriveFolderUrl
        },
        sp1Data: { timJpn: [] },
        telaahData: {},
        sp2Data: { timJpn: [] },
        monitoring: null
      };

      await addPermohonan(newPermohonan);

      alert(
        `✅ Permohonan & Berkas Berhasil Disimpan ke Google Drive!\n\n` +
        `📁 Lokasi Folder: SIM RISK / ${cleanSubfolderName}\n` +
        `🔑 ID Akses Pemohon: ${permohonanId}`
      );

      navigate('/');
    } catch (error) {
      console.error('Submit error:', error);
      alert(`Gagal menyimpan atau mengunggah ke Google Drive: ${error.message || error}`);
    } finally {
      setIsSubmitting(false);
      setSubmitProgressText('');
    }
  };

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto', paddingBottom: '3rem' }}>
      <h1>Input Surat Permohonan</h1>
      <p style={{ color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: '2rem' }}>
        Masukkan detail surat permohonan pendampingan hukum. Dokumen akan otomatis masuk ke folder <strong style={{ color: 'var(--color-text-main)' }}>SIM RISK</strong> di Google Drive saat formulir dikirim.
      </p>

      <form className="card" onSubmit={handleSubmit}>
        <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--color-secondary-shadow)' }}>
          <Mail size={24} />
          Data Surat Permohonan
        </h2>

        {/* Kategori Permohonan */}
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            <FileText size={16} /> Kategori Permohonan
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="kategoriPermohonan" 
                value="Pendampingan Pemulihan/Penyelamatan Aset" 
                checked={formData.kategoriPermohonan === 'Pendampingan Pemulihan/Penyelamatan Aset'}
                onChange={e => setFormData({...formData, kategoriPermohonan: e.target.value})}
                style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--color-primary-shadow)' }}
              />
              <span style={{ fontSize: '0.95rem', color: 'var(--color-text-main)' }}>Pendampingan Pemulihan/Penyelamatan Aset</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="kategoriPermohonan" 
                value="Pendampingan Hukum Proyek Infrastruktur" 
                checked={formData.kategoriPermohonan === 'Pendampingan Hukum Proyek Infrastruktur'}
                onChange={e => setFormData({...formData, kategoriPermohonan: e.target.value})}
                style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--color-primary-shadow)' }}
              />
              <span style={{ fontSize: '0.95rem', color: 'var(--color-text-main)' }}>Pendampingan Hukum Proyek Infrastruktur</span>
            </label>
          </div>
        </div>
        
        {/* Asal Surat (Pemohon / Instansi) */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building size={16} /> Asal Surat (Instansi / Pemohon) <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <input
            required
            className="form-input"
            placeholder="Contoh: PT Pelabuhan Indonesia (Persero) atau Dinas PUPR NTT"
            value={formData.asalSurat}
            onChange={e => setFormData({...formData, asalSurat: e.target.value})}
          />
        </div>

        {/* Nomor Surat */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} /> Nomor Surat <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <input
            required
            className="form-input"
            placeholder="Contoh: HK.03/2/1/1/D4.2/SR/RBNT-26"
            value={formData.nomorSurat}
            onChange={e => setFormData({...formData, nomorSurat: e.target.value})}
          />
        </div>

        {/* Tanggal Surat */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={16} /> Tanggal Surat <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <input
            required
            type="date"
            className="form-input"
            value={formData.tanggalSurat}
            onChange={e => setFormData({...formData, tanggalSurat: e.target.value})}
          />
        </div>
        
        {/* Perihal */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} /> Perihal <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <input
            required
            className="form-input"
            placeholder="Contoh: Permohonan Pendampingan Hukum Pelaksanaan Pekerjaan Perkuatan Dermaga..."
            value={formData.perihal}
            onChange={e => setFormData({...formData, perihal: e.target.value})}
          />
        </div>

        {/* Isi Ringkas Surat */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} /> Isi Ringkas Surat <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <textarea
            required
            className="form-input"
            rows="4"
            placeholder="Ringkasan latar belakang dan maksud permohonan pendampingan..."
            value={formData.isiSurat}
            onChange={e => setFormData({...formData, isiSurat: e.target.value})}
          />
        </div>

        {/* Dokumen Surat Permohonan - Upload ke Google Drive saat submit */}
        <div className="form-group" style={{ marginTop: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <label className="form-label" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
              <UploadCloud size={18} color="var(--color-primary-shadow)" />
              Dokumen Surat Permohonan Resmi <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <button
              type="button"
              onClick={() => setIsManualLinkMode(!isManualLinkMode)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-primary-shadow)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <LinkIcon size={14} />
              {isManualLinkMode ? 'Pilih Unggah Berkas' : 'Mode Tautan Manual'}
            </button>
          </div>

          {/* Info Banner Folder Tujuan Google Drive */}
          <div style={{
            padding: '0.65rem 0.9rem',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.82rem',
            color: '#166534',
            marginBottom: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Folder size={18} color="#16a34a" style={{ flexShrink: 0 }} />
            <div>
              <strong>Target Subfolder di Google Drive:</strong> <code>SIM RISK / {targetSubfolderName} / 01_Surat_Permohonan</code>
              <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '2px' }}>
                ⚡ Berkas akan otomatis masuk ke folder ini saat tombol <strong>Terima & Simpan Permohonan</strong> diklik.
              </div>
            </div>
          </div>

          {isManualLinkMode ? (
            <div>
              <input
                className="form-input"
                placeholder="https://drive.google.com/file/d/... atau URL dokumen eksternal"
                value={formData.linkSurat}
                onChange={e => setFormData({ ...formData, linkSurat: e.target.value })}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '0.3rem' }}>
                Tempelkan tautan file Google Drive yang sudah ada jika tidak ingin mengunggah file baru.
              </span>
            </div>
          ) : (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              {!selectedFile ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${dragActive ? 'var(--color-primary-shadow)' : 'var(--color-border)'}`,
                    backgroundColor: dragActive ? 'rgba(30, 93, 107, 0.05)' : 'var(--color-bg)',
                    borderRadius: 'var(--radius-md)',
                    padding: '2rem 1.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.75rem auto'
                  }}>
                    <UploadCloud size={24} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>
                    Klik untuk memilih berkas surat atau seret file ke sini
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    Mendukung PDF, Word (.docx), atau Gambar (Maks 20MB)
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '1rem',
                  border: '1.5px solid var(--color-primary-shadow)',
                  backgroundColor: '#f8fafc',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      backgroundColor: '#e0f2fe',
                      color: '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <FileText size={22} />
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--color-text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {selectedFile.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '2px' }}>
                        <span>{formatFileSize(selectedFile.size)}</span>
                        <span>•</span>
                        <span style={{ color: '#0284c7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <CheckCircle2 size={13} /> Siap diunggah saat simpan
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Ganti Berkas
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ padding: '0.4rem 0.6rem', color: 'var(--color-danger-shadow)', borderColor: 'var(--color-danger-shadow)' }}
                      onClick={handleRemoveFile}
                      title="Batalkan pilihan berkas"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tombol Simpan & Status Loading */}
        <div style={{ marginTop: '2.5rem', borderTop: '2px solid var(--color-border)', paddingTop: '1.5rem' }}>
          {isSubmitting && submitProgressText && (
            <div style={{
              padding: '0.85rem 1rem',
              background: '#e0f2fe',
              border: '1px solid #7dd3fc',
              borderRadius: 'var(--radius-sm)',
              color: '#0369a1',
              fontSize: '0.88rem',
              fontWeight: 700,
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}>
              <Loader2 size={18} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
              <span>{submitProgressText}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              disabled={isSubmitting}
              onClick={() => navigate('/')}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '0.85rem 2rem', fontSize: '0.95rem' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Sedang Mengunggah & Menyimpan...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Terima & Simpan Permohonan
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default PermohonanForm;
