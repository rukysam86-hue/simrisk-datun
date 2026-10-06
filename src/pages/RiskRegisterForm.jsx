import { useState } from 'react';
import { Save, Mail, Calendar, FileText, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { addPermohonan, generateId } from '../data/store';
import DriveFileUpload from '../components/DriveFileUpload';

function PermohonanForm() {
  const navigate = useNavigate();
  const [permohonanId] = useState(() => generateId());
  const [driveFolderUrl, setDriveFolderUrl] = useState('');
  const [formData, setFormData] = useState({
    asalSurat: '',
    nomorSurat: '',
    tanggalSurat: '',
    perihal: '',
    isiSurat: '',
    linkSurat: '',
    kategoriPermohonan: 'Pendampingan Hukum Proyek Infrastruktur'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Create the DB record
    const newPermohonan = {
      id: permohonanId,
      currentStep: 1, // Start at step 1
      driveFolderUrl: driveFolderUrl,
      suratData: {
        asalSurat: formData.asalSurat,
        nomorSurat: formData.nomorSurat,
        tanggalSurat: formData.tanggalSurat,
        perihal: formData.perihal,
        isiSurat: formData.isiSurat,
        pdfUrl: formData.linkSurat,
        kategoriPermohonan: formData.kategoriPermohonan,
        driveFolderUrl: driveFolderUrl
      },
      sp1Data: { timJpn: [] },
      telaahData: {},
      sp2Data: { timJpn: [] },
      monitoring: null // Not started yet
    };

    try {
      await addPermohonan(newPermohonan);
      alert(`Permohonan berhasil disimpan!\nID Akses Pemohon: ${permohonanId}`);
      navigate('/');
    } catch (error) {
      alert('Gagal menyimpan permohonan. Periksa koneksi atau konfigurasi Supabase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1>Input Surat Permohonan</h1>
      <p style={{ color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: '2rem' }}>
        Masukkan detail surat permohonan pendampingan hukum yang masuk.
      </p>

      <form className="card" onSubmit={handleSubmit}>
        <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--color-secondary-shadow)' }}>
          <Mail size={24} />
          Data Surat Permohonan
        </h2>

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
        
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building size={16} /> Asal Surat (Instansi)
          </label>
          <input required className="form-input" placeholder="Contoh: PT Nindya Karya" value={formData.asalSurat} onChange={e => setFormData({...formData, asalSurat: e.target.value})} />
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} /> Nomor Surat
          </label>
          <input required className="form-input" placeholder="Contoh: B-123/NK/II/2026" value={formData.nomorSurat} onChange={e => setFormData({...formData, nomorSurat: e.target.value})} />
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={16} /> Tanggal Surat
          </label>
          <input required type="date" className="form-input" value={formData.tanggalSurat} onChange={e => setFormData({...formData, tanggalSurat: e.target.value})} />
        </div>
        
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} /> Perihal
          </label>
          <input required className="form-input" placeholder="Contoh: Permohonan Bantuan Hukum..." value={formData.perihal} onChange={e => setFormData({...formData, perihal: e.target.value})} />
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} /> Isi Ringkas Surat
          </label>
          <textarea required className="form-input" rows="4" placeholder="Ringkasan isi surat permohonan..." value={formData.isiSurat} onChange={e => setFormData({...formData, isiSurat: e.target.value})}></textarea>
        </div>

        <DriveFileUpload
          label="Dokumen Surat Permohonan (Google Drive)"
          value={formData.linkSurat}
          onChange={(url, meta) => {
            setFormData({ ...formData, linkSurat: url });
            if (meta?.folderUrl) setDriveFolderUrl(meta.folderUrl);
          }}
          permohonanId={permohonanId}
          permohonanTitle={formData.perihal || formData.asalSurat}
          folderCategory="surat_masuk"
          required
          helpText="Unggah scan surat permohonan resmi (.pdf, .docx, atau gambar)"
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '1rem 2rem' }} disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : (
              <>
                <Save size={20} />
                Terima & Simpan Permohonan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PermohonanForm;
