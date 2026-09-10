import { useState, useEffect } from 'react';
import { Lock, Send, Clock, Activity, FileText, Plus, X, ShieldAlert } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { getPermohonanById, updatePermohonan } from '../data/store';
import ReactMarkdown from 'react-markdown';

function PemohonPortal() {
  const { linkId } = useParams();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  
  const [projectData, setProjectData] = useState(null);
  
  // State to toggle the form when already has initial data
  const [isReportingProgress, setIsReportingProgress] = useState(false);
  const [isViewingAssessmentDetails, setIsViewingAssessmentDetails] = useState(false);
  
  // Form fields
  const [kegiatan, setKegiatan] = useState('');
  const [nilaiAnggaran, setNilaiAnggaran] = useState('');
  const [kasusPosisi, setKasusPosisi] = useState('');
  const [progressKegiatan, setProgressKegiatan] = useState('');
  const [persentaseKegiatan, setPersentaseKegiatan] = useState('');
  const [hambatan, setHambatan] = useState('');
  const [keterangan, setKeterangan] = useState('');

  const formatRupiah = (value) => {
    const numberString = value.replace(/[^,\d]/g, '').toString();
    const split = numberString.split(',');
    const sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
      const separator = sisa ? '.' : '';
      rupiah += separator + ribuan.join('.');
    }

    return split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (password === linkId) {
      const data = await getPermohonanById(linkId);
      if (data) {
        setProjectData(data);
        setIsUnlocked(true);
      } else {
        alert('Data permohonan tidak ditemukan!');
      }
    } else {
      alert('Password salah!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dateStr = new Date().toISOString().split('T')[0];
    
    const hasInitialData = !!projectData.monitoring;

    if (!hasInitialData) {
      // First time filling data
      await updatePermohonan(linkId, {
        monitoring: {
          kegiatan: kegiatan,
          nilai: parseInt(nilaiAnggaran.replace(/\./g, ''), 10) || 0,
          kasusPosisi: kasusPosisi,
          progressKegiatan: progressKegiatan,
          persentaseKegiatan: `${persentaseKegiatan}%`,
          hambatan: hambatan,
          keterangan: keterangan,
          lastUpdate: dateStr,
          initialData: {
            date: dateStr,
            progressKegiatan: progressKegiatan,
            persentaseKegiatan: `${persentaseKegiatan}%`,
            hambatan: hambatan,
            keterangan: keterangan
          },
          reports: []
        }
      });
      alert('Data Awal / Monev berhasil dilaporkan ke Kejati NTT!');
    } else {
      // Submitting periodic progress report
      const newReport = {
        id: Date.now().toString(),
        date: dateStr,
        progressKegiatan: progressKegiatan,
        persentaseKegiatan: `${persentaseKegiatan}%`,
        hambatan: hambatan,
        keterangan: keterangan
      };
      
      const updatedMonitoring = {
        ...projectData.monitoring,
        progressKegiatan: progressKegiatan,
        persentaseKegiatan: `${persentaseKegiatan}%`,
        hambatan: hambatan,
        keterangan: keterangan,
        lastUpdate: dateStr,
        initialData: projectData.monitoring.initialData || {
          date: projectData.monitoring.lastUpdate,
          progressKegiatan: projectData.monitoring.progressKegiatan,
          persentaseKegiatan: projectData.monitoring.persentaseKegiatan,
          hambatan: projectData.monitoring.hambatan,
          keterangan: projectData.monitoring.keterangan
        },
        reports: [...(projectData.monitoring.reports || []), newReport]
      };
      
      await updatePermohonan(linkId, {
        monitoring: updatedMonitoring
      });
      alert('Progres Berkala berhasil dilaporkan ke Kejati NTT!');
      setIsReportingProgress(false); // Close form modal
    }
    
    setProjectData(await getPermohonanById(linkId));
    // Clear dynamic fields
    setProgressKegiatan('');
    setPersentaseKegiatan('');
    setHambatan('');
    setKeterangan('');
  };

  if (!isUnlocked || !projectData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--color-surface)' }}>
        <div className="card" style={{ maxWidth: '420px', width: '100%', textAlign: 'center', padding: '2.5rem 2rem' }}>
          <img 
            src="/logo.png" 
            alt="Logo SIMRISK DATUN" 
            style={{ width: '125px', height: 'auto', margin: '0 auto 1.25rem', display: 'block', filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.12))' }} 
          />
          <h2 style={{ marginBottom: '0.5rem', color: 'var(--color-primary-shadow)' }}>Portal Pemohon Mandiri</h2>
          <p style={{ color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: '2rem' }}>
            Masukkan PIN / Kata Sandi untuk melaporkan progres kegiatan pendampingan Anda.
          </p>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <input 
                type="password" 
                className="form-input" 
                placeholder="Masukkan Password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.2em' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Buka Akses
            </button>
          </form>
        </div>
      </div>
    );
  }

  const hasInitialData = !!projectData.monitoring;

  const renderForm = (isModal = false) => (
    <div className="card" style={isModal ? { width: '100%', maxWidth: '800px', margin: '0 auto', maxHeight: '90vh', overflowY: 'auto' } : { maxWidth: '800px', margin: '0 auto' }}>
      {isModal && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>Laporkan Progres Berkala</h2>
          <button onClick={() => setIsReportingProgress(false)} className="btn btn-outline" style={{ padding: '0.5rem' }}>
            <X size={20} />
          </button>
        </div>
      )}
      {!isModal && (
        <h2 style={{ marginBottom: '1.5rem' }}>Form Pengisian Data Awal (Monev)</h2>
      )}
      <form onSubmit={handleSubmit}>
        {!hasInitialData && (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Kegiatan Yang Dampingi</label>
              <input type="text" className="form-input" placeholder="Contoh: Pembangunan SMA Unggul Garuda..." value={kegiatan} onChange={e => setKegiatan(e.target.value)} required />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Nilai Anggaran</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0 0.5rem' }}>
                <span style={{ fontWeight: 700, paddingRight: '0.5rem', color: 'var(--color-text-muted)' }}>Rp</span>
                <input type="text" style={{ flex: 1, padding: '0.75rem 0', border: 'none', outline: 'none', background: 'transparent' }} placeholder="Contoh: 15.000.000.000" value={nilaiAnggaran} onChange={e => setNilaiAnggaran(formatRupiah(e.target.value))} required />
              </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Kasus Posisi</label>
              <textarea className="form-input" rows="3" placeholder="Uraian singkat posisi kasus/kegiatan..." value={kasusPosisi} onChange={e => setKasusPosisi(e.target.value)} required></textarea>
            </div>
          </>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label className="form-label" style={{ fontWeight: 600 }}>Progress Kegiatan</label>
            <input type="text" className="form-input" placeholder="Contoh: Tahap Konstruksi Pondasi" value={progressKegiatan} onChange={e => setProgressKegiatan(e.target.value)} required />
          </div>
          <div>
            <label className="form-label" style={{ fontWeight: 600 }}>Persentase (%)</label>
            <input type="number" className="form-input" placeholder="0 - 100" value={persentaseKegiatan} onChange={e => setPersentaseKegiatan(e.target.value)} required />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{ fontWeight: 600 }}>Hambatan / Kendala</label>
          <textarea className="form-input" rows="3" placeholder="Tuliskan hambatan atau kendala yang dihadapi di lapangan..." value={hambatan} onChange={e => setHambatan(e.target.value)}></textarea>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 600 }}>Keterangan Tambahan</label>
          <textarea className="form-input" rows="2" placeholder="Catatan tambahan lainnya (opsional)..." value={keterangan} onChange={e => setKeterangan(e.target.value)}></textarea>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            <Send size={20} style={{ marginRight: '0.5rem' }} />
            {hasInitialData ? 'Kirim Laporan Progres' : 'Simpan Data Awal'}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface)', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Portal Header Branding */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', background: 'white', padding: '0.85rem 1.5rem', borderRadius: 'var(--radius-lg)', border: '2px solid var(--color-border)', boxShadow: '0 2px 0 var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <img src="/logo.png" alt="Logo SIMRISK DATUN" style={{ width: '48px', height: 'auto', objectFit: 'contain' }} />
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.15rem', color: 'var(--color-primary-shadow)', lineHeight: 1.1 }}>SIMRISK DATUN</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Portal Pemohon • Kejati NTT</div>
            </div>
          </div>
          <span className="badge" style={{ background: '#e5f9d6', color: 'var(--color-primary-shadow)', fontWeight: 800, padding: '0.4rem 0.8rem' }}>
            Akses Terverifikasi
          </span>
        </div>

        {/* Header Info */}
        <div className="card" style={{ display: 'flex', gap: '2rem', alignItems: 'center', backgroundColor: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-primary-shadow)', marginBottom: '2rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            <FileText size={48} />
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '2rem' }}>{projectData.suratData?.perihal || 'Nama Proyek'}</h1>
            <p style={{ margin: 0, fontWeight: 700, opacity: 0.9 }}>{projectData.suratData?.asalSurat || 'Instansi'}</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <span className="badge" style={{ background: 'white', color: 'var(--color-primary-shadow)' }}>
                {projectData.sp2Data?.nomor ? `SP-2: ${projectData.sp2Data.nomor}` : 'Belum terbit SP-2'}
              </span>
            </div>
          </div>
          {hasInitialData && projectData.currentStep !== 6 && (
            <button className="btn btn-primary" style={{ background: 'white', color: 'var(--color-primary-shadow)' }} onClick={() => setIsReportingProgress(true)}>
              <Plus size={20} style={{ marginRight: '0.5rem' }} /> Laporkan Progres Berkala
            </button>
          )}
        </div>

        {!hasInitialData ? (
          // IF NO INITIAL DATA: Show Form
          renderForm(false)
        ) : (
          // IF HAS INITIAL DATA: Show Table
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '2px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fafafa' }}>
              <h2 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <Activity size={20} /> Riwayat Laporan Progres
              </h2>
            </div>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Tahap / Waktu</th>
                    <th>Progres</th>
                    <th>Hambatan / Catatan</th>
                    <th>Status Risiko & Instruksi</th>
                    <th style={{ width: '120px' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div style={{ fontWeight: 800 }}>Data Awal</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{projectData.monitoring.initialData?.date || projectData.monitoring.lastUpdate}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{projectData.monitoring.initialData?.progressKegiatan || projectData.monitoring.progressKegiatan || '-'} ({projectData.monitoring.initialData?.persentaseKegiatan || projectData.monitoring.persentaseKegiatan || '0%'})</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.9rem', color: '#c0392b' }}>{projectData.monitoring.initialData?.hambatan || projectData.monitoring.hambatan || '-'}</div>
                      {(projectData.monitoring.initialData?.keterangan || projectData.monitoring.keterangan) && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Ket: {projectData.monitoring.initialData?.keterangan || projectData.monitoring.keterangan}</div>
                      )}
                    </td>
                    <td>
                      {projectData.monitoring.risk && (
                         <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, backgroundColor: projectData.monitoring.risk === 'high' ? '#ffe2e2' : projectData.monitoring.risk === 'medium' ? '#fff5cc' : '#e5f9d6', color: projectData.monitoring.risk === 'high' ? 'var(--color-danger)' : projectData.monitoring.risk === 'medium' ? '#d4ac0d' : 'var(--color-primary-shadow)' }}>
                            {projectData.monitoring.risk === 'high' ? 'Tinggi' : projectData.monitoring.risk === 'medium' ? 'Sedang' : 'Rendah'}
                         </div>
                      )}
                      {projectData.monitoring.adminNotes && (
                         <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>{projectData.monitoring.adminNotes}</div>
                      )}
                      {!projectData.monitoring.risk && <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>Belum dinilai</span>}
                    </td>
                    <td>
                      {projectData.monitoring.aiAnalysis && (
                        <button className="btn btn-outline" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', width: '100%', display: 'flex', justifyContent: 'center', gap: '0.25rem' }} onClick={() => setIsViewingAssessmentDetails(-1)}>
                          <ShieldAlert size={14} /> Detail
                        </button>
                      )}
                    </td>
                  </tr>
                  {(projectData.monitoring.reports || []).map((rep, idx) => (
                    <tr key={rep.id || idx}>
                      <td>
                        <div style={{ fontWeight: 800 }}>Progres #{idx + 1}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{rep.date || rep.tanggal}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{rep.progressKegiatan || '-'} ({rep.persentaseKegiatan || '0%'})</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.9rem', color: '#c0392b' }}>{rep.hambatan || '-'}</div>
                        {rep.keterangan && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Ket: {rep.keterangan}</div>
                        )}
                      </td>
                      <td>
                        {rep.risk ? (
                          <>
                             <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, backgroundColor: rep.risk === 'high' ? '#ffe2e2' : rep.risk === 'medium' ? '#fff5cc' : '#e5f9d6', color: rep.risk === 'high' ? 'var(--color-danger)' : rep.risk === 'medium' ? '#d4ac0d' : 'var(--color-primary-shadow)' }}>
                                {rep.risk === 'high' ? 'Tinggi' : rep.risk === 'medium' ? 'Sedang' : 'Rendah'}
                             </div>
                             {rep.adminNotes && (
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>{rep.adminNotes}</div>
                             )}
                          </>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>Dalam proses penilaian</span>
                        )}
                      </td>
                      <td>
                        {rep.aiAnalysis && (
                          <button className="btn btn-outline" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', width: '100%', display: 'flex', justifyContent: 'center', gap: '0.25rem' }} onClick={() => setIsViewingAssessmentDetails(idx)}>
                            <ShieldAlert size={14} /> Detail
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
      
      {/* Modal Reporting Progress */}
      {isReportingProgress && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '2rem' }}>
          {renderForm(true)}
        </div>
      )}

      {/* Modal Detail Penilaian Risiko */}
      {isViewingAssessmentDetails !== false && (() => {
        const index = isViewingAssessmentDetails;
        const targetData = index === -1 
          ? projectData.monitoring 
          : (projectData.monitoring.reports?.[index] || {});
        const riskLevel = targetData.risk || 'low';
        const hambatan = index === -1 ? (projectData.monitoring.initialData?.hambatan || projectData.monitoring.hambatan || '-') : (targetData.hambatan || '-');

        return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="card" style={{ width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={28} color="var(--color-primary-shadow)" /> {index === -1 ? 'Detail Penilaian Data Awal' : `Detail Penilaian Laporan Progres ${index + 1}`}
              </h2>
              <button onClick={() => setIsViewingAssessmentDetails(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <X size={28} />
              </button>
            </div>
            
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>Kasus Posisi:</span>
                <div style={{ background: 'var(--color-surface)', padding: '1rem', borderRadius: '8px' }}>{projectData.monitoring?.kasusPosisi || '-'}</div>
              </div>
              
              <div>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>Hambatan / Kendala yang Dilaporkan:</span>
                <div style={{ background: '#fff0f0', color: '#c0392b', border: '1px solid #ffcccc', padding: '1rem', borderRadius: '8px' }}>{hambatan}</div>
              </div>

              <div>
                <span style={{ fontSize: '0.9rem', color: '#8e44ad', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  ✨ Hasil Analisis Gemini:
                </span>
                <div className="markdown-body" style={{ background: '#f9f2fc', border: '1px solid #d7bde2', padding: '1.5rem', borderRadius: '8px', lineHeight: '1.6' }}>
                  <ReactMarkdown>{targetData.aiAnalysis || ''}</ReactMarkdown>
                </div>
              </div>

              <div style={{ background: 'var(--color-surface)', border: '2px solid var(--color-border)', padding: '1.5rem', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem' }}>Penentuan Risiko & Catatan (Oleh Admin)</h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>Tingkat Risiko Final:</span>
                  <span className={`badge badge-${riskLevel}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                    {riskLevel === 'high' ? 'Tinggi (Kritis / Perlu Mitigasi Segera)' : riskLevel === 'medium' ? 'Sedang (Perlu Perhatian)' : 'Rendah (Aman)'}
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>Catatan / Instruksi untuk Pemohon:</span>
                  <div style={{ background: 'white', padding: '1rem', borderRadius: '4px', border: '1px solid var(--color-border)', minHeight: '80px' }}>
                    {targetData.adminNotes || 'Tidak ada catatan.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}

export default PemohonPortal;
