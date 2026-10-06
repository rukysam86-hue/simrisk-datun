import { useState, useEffect } from 'react';
import { Lock, Send, Clock, Activity, FileText, Plus, X, ShieldAlert, DollarSign, Folder } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { getPermohonanById, updatePermohonan } from '../data/store';
import ReactMarkdown from 'react-markdown';
import WysiwygEditor from '../lib/WysiwygEditor';
import DriveFileUpload from '../components/DriveFileUpload';

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
  const [realisasiPencairan, setRealisasiPencairan] = useState('');
  const [persentasePencairan, setPersentasePencairan] = useState('');
  const [hambatan, setHambatan] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [linkDokumen, setLinkDokumen] = useState('');
  const [dokumenList, setDokumenList] = useState([]);
  const [folderDriveUrl, setFolderDriveUrl] = useState('');

  // Aset specific fields
  const [permasalahan, setPermasalahan] = useState('');
  const [jenisAset, setJenisAset] = useState(['']);
  const [nilaiDipulihkan, setNilaiDipulihkan] = useState('');

  const isAset = projectData?.suratData?.kategoriPermohonan === 'Pendampingan Pemulihan/Penyelamatan Aset';
  const isInfrastruktur = (projectData?.suratData?.kategoriPermohonan || 'Pendampingan Hukum Proyek Infrastruktur') === 'Pendampingan Hukum Proyek Infrastruktur';

  const handleAddAset = () => setJenisAset([...jenisAset, '']);
  const handleRemoveAset = (index) => {
    const newAset = [...jenisAset];
    newAset.splice(index, 1);
    setJenisAset(newAset);
  };
  const handleAsetChange = (index, value) => {
    const newAset = [...jenisAset];
    newAset[index] = value;
    setJenisAset(newAset);
  };

  const formatRupiah = (value) => {
    const numberString = (value || '').toString().replace(/[^,\d]/g, '');
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

  const formatCurrency = (value) => {
    const num = Number(value) || 0;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  const getDisbursementStats = () => {
    const totalAnggaran = projectData?.monitoring?.nilai || parseInt((nilaiAnggaran || '').replace(/\./g, ''), 10) || 0;
    const initialDisbursed = Number(projectData?.monitoring?.initialData?.realisasiPencairan || projectData?.monitoring?.realisasiPencairan || 0);
    
    let totalKumulatif = initialDisbursed;
    const reports = projectData?.monitoring?.reports || [];
    reports.forEach(rep => {
      totalKumulatif += Number(rep.realisasiPencairan || 0);
    });

    const percentKumulatif = totalAnggaran > 0 ? ((totalKumulatif / totalAnggaran) * 100).toFixed(1) : '0';
    const sisa = Math.max(0, totalAnggaran - totalKumulatif);

    return {
      totalAnggaran,
      totalKumulatif,
      percentKumulatif,
      sisa
    };
  };

  const getReportDisbursement = (index) => {
    const totalAnggaran = projectData?.monitoring?.nilai || 0;
    if (index === -1) {
      const initVal = Number(projectData?.monitoring?.initialData?.realisasiPencairan || projectData?.monitoring?.realisasiPencairan || 0);
      const initPct = projectData?.monitoring?.initialData?.persentasePencairan || (totalAnggaran > 0 ? `${((initVal / totalAnggaran) * 100).toFixed(1)}%` : '0%');
      return {
        tahap: initVal,
        persenTahap: initPct,
        kumulatif: initVal,
        persenKumulatif: initPct,
        sisa: Math.max(0, totalAnggaran - initVal)
      };
    }

    const reports = projectData?.monitoring?.reports || [];
    let kumulatif = Number(projectData?.monitoring?.initialData?.realisasiPencairan || projectData?.monitoring?.realisasiPencairan || 0);
    for (let i = 0; i <= index; i++) {
      const r = reports[i];
      const val = Number(r?.realisasiPencairan || 0);
      if (i < index) {
        kumulatif += val;
      } else if (i === index) {
        kumulatif += val;
        const pctTahap = r?.persentasePencairan || (totalAnggaran > 0 ? `${((val / totalAnggaran) * 100).toFixed(1)}%` : '0%');
        const pctKumulatif = r?.persentaseKumulatif || (totalAnggaran > 0 ? `${((kumulatif / totalAnggaran) * 100).toFixed(1)}%` : '0%');
        return {
          tahap: val,
          persenTahap: pctTahap,
          kumulatif: r?.totalPencairanKumulatif || kumulatif,
          persenKumulatif: pctKumulatif,
          sisa: Math.max(0, totalAnggaran - (r?.totalPencairanKumulatif || kumulatif))
        };
      }
    }

    return { tahap: 0, persenTahap: '0%', kumulatif: 0, persenKumulatif: '0%', sisa: totalAnggaran };
  };

  const handleRealisasiChange = (value) => {
    const formatted = formatRupiah(value);
    setRealisasiPencairan(formatted);
    const numeric = parseInt((value || '').replace(/\./g, ''), 10) || 0;
    const totalAnggaran = projectData?.monitoring?.nilai || parseInt((nilaiAnggaran || '').replace(/\./g, ''), 10) || 0;
    if (totalAnggaran > 0) {
      const pct = ((numeric / totalAnggaran) * 100).toFixed(1);
      setPersentasePencairan(pct);
    }
  };

  const handlePersentasePencairanChange = (value) => {
    setPersentasePencairan(value);
    const pct = parseFloat(value) || 0;
    const totalAnggaran = projectData?.monitoring?.nilai || parseInt((nilaiAnggaran || '').replace(/\./g, ''), 10) || 0;
    if (totalAnggaran > 0 && (!realisasiPencairan || realisasiPencairan === '0')) {
      const nominal = Math.round((pct / 100) * totalAnggaran);
      setRealisasiPencairan(formatRupiah(nominal.toString()));
    }
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

    const effectiveLink = dokumenList.length > 0 ? dokumenList[0].url : (linkDokumen || '');
    const effectiveFiles = dokumenList.length > 0 
      ? dokumenList 
      : (linkDokumen ? [{ name: 'Dokumen Laporan', url: linkDokumen }] : []);

    if (!hasInitialData) {
      // First time filling data
      const initDisbursedNum = isInfrastruktur ? (parseInt((realisasiPencairan || '0').replace(/\./g, ''), 10) || 0) : 0;
      const totalAnggaranNum = parseInt(nilaiAnggaran.replace(/\./g, ''), 10) || 0;
      const initPct = persentasePencairan ? `${persentasePencairan}%` : (totalAnggaranNum > 0 ? `${((initDisbursedNum / totalAnggaranNum) * 100).toFixed(1)}%` : '0%');
      const initSisa = Math.max(0, totalAnggaranNum - initDisbursedNum);

      await updatePermohonan(linkId, {
        ...(folderDriveUrl ? { driveFolderUrl: folderDriveUrl } : {}),
        monitoring: {
          kegiatan: kegiatan,
          nilai: totalAnggaranNum,
          kasusPosisi: kasusPosisi,
          progressKegiatan: progressKegiatan,
          persentaseKegiatan: `${persentaseKegiatan}%`,
          ...(isInfrastruktur ? {
            realisasiPencairan: initDisbursedNum,
            persentasePencairan: initPct,
            totalRealisasiPencairan: initDisbursedNum,
            persentasePencairanTotal: initPct,
            sisaAnggaran: initSisa,
          } : {}),
          hambatan: hambatan,
          keterangan: keterangan,
          linkDokumen: effectiveLink,
          dokumenFiles: effectiveFiles,
          lastUpdate: dateStr,
          initialData: {
            date: dateStr,
            progressKegiatan: progressKegiatan,
            persentaseKegiatan: `${persentaseKegiatan}%`,
            ...(isInfrastruktur ? {
              realisasiPencairan: initDisbursedNum,
              persentasePencairan: initPct,
              totalPencairanKumulatif: initDisbursedNum,
              persentaseKumulatif: initPct,
            } : {}),
            hambatan: hambatan,
            keterangan: keterangan,
            linkDokumen: effectiveLink,
            dokumenFiles: effectiveFiles,
            ...(isAset ? { permasalahan, jenisAset: jenisAset.filter(a => a.trim() !== '') } : {})
          },
          reports: []
        }
      });
      alert('Data Awal / Monev berhasil dilaporkan ke Kejati NTT!');
    } else {
      // Submitting periodic progress report
      const stats = getDisbursementStats();
      const numericRealisasi = isInfrastruktur ? (parseInt((realisasiPencairan || '0').replace(/\./g, ''), 10) || 0) : 0;
      const pctTahap = persentasePencairan ? `${persentasePencairan}%` : (stats.totalAnggaran > 0 ? `${((numericRealisasi / stats.totalAnggaran) * 100).toFixed(1)}%` : '0%');
      const cumulativeTotal = stats.totalKumulatif + numericRealisasi;
      const cumulativePct = stats.totalAnggaran > 0 ? `${((cumulativeTotal / stats.totalAnggaran) * 100).toFixed(1)}%` : '0%';
      const sisa = Math.max(0, stats.totalAnggaran - cumulativeTotal);

      const newReport = {
        id: Date.now().toString(),
        date: dateStr,
        progressKegiatan: progressKegiatan,
        persentaseKegiatan: `${persentaseKegiatan}%`,
        ...(isInfrastruktur ? {
          realisasiPencairan: numericRealisasi,
          persentasePencairan: pctTahap,
          totalPencairanKumulatif: cumulativeTotal,
          persentaseKumulatif: cumulativePct,
        } : {}),
        hambatan: hambatan,
        keterangan: keterangan,
        linkDokumen: effectiveLink,
        dokumenFiles: effectiveFiles,
        ...(isAset ? { nilaiDipulihkan: parseInt(nilaiDipulihkan.replace(/\./g, ''), 10) || 0 } : {})
      };
      
      const updatedMonitoring = {
        ...projectData.monitoring,
        progressKegiatan: progressKegiatan,
        persentaseKegiatan: `${persentaseKegiatan}%`,
        ...(isInfrastruktur ? {
          realisasiPencairan: numericRealisasi,
          persentasePencairan: pctTahap,
          totalRealisasiPencairan: cumulativeTotal,
          persentasePencairanTotal: cumulativePct,
          sisaAnggaran: sisa,
        } : {}),
        hambatan: hambatan,
        keterangan: keterangan,
        linkDokumen: effectiveLink,
        dokumenFiles: effectiveFiles,
        lastUpdate: dateStr,
        initialData: projectData.monitoring.initialData || {
          date: projectData.monitoring.lastUpdate,
          progressKegiatan: projectData.monitoring.progressKegiatan,
          persentaseKegiatan: projectData.monitoring.persentaseKegiatan,
          realisasiPencairan: projectData.monitoring.realisasiPencairan || 0,
          persentasePencairan: projectData.monitoring.persentasePencairan || '0%',
          hambatan: projectData.monitoring.hambatan,
          keterangan: projectData.monitoring.keterangan,
          linkDokumen: projectData.monitoring.linkDokumen
        },
        reports: [...(projectData.monitoring.reports || []), newReport]
      };
      
      await updatePermohonan(linkId, {
        ...(folderDriveUrl ? { driveFolderUrl: folderDriveUrl } : {}),
        monitoring: updatedMonitoring
      });
      alert('Progres Berkala berhasil dilaporkan ke Kejati NTT!');
      setIsReportingProgress(false); // Close form modal
    }
    
    setProjectData(await getPermohonanById(linkId));
    // Clear dynamic fields
    setProgressKegiatan('');
    setPersentaseKegiatan('');
    setRealisasiPencairan('');
    setPersentasePencairan('');
    setHambatan('');
    setKeterangan('');
    setLinkDokumen('');
    setDokumenList([]);
    setNilaiDipulihkan('');
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
            {!isAset ? (
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Kegiatan Yang Dampingi</label>
                <input type="text" className="form-input" placeholder="Contoh: Pembangunan SMA Unggul Garuda..." value={kegiatan} onChange={e => setKegiatan(e.target.value)} required />
              </div>
            ) : null}

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>{isAset ? 'Nilai Total Aset' : 'Nilai Anggaran'}</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0 0.5rem' }}>
                <span style={{ fontWeight: 700, paddingRight: '0.5rem', color: 'var(--color-text-muted)' }}>Rp</span>
                <input type="text" style={{ flex: 1, padding: '0.75rem 0', border: 'none', outline: 'none', background: 'transparent' }} placeholder="Contoh: 15.000.000.000" value={nilaiAnggaran} onChange={e => setNilaiAnggaran(formatRupiah(e.target.value))} required />
              </div>
            </div>

            {isInfrastruktur && (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 600 }}>Realisasi Pencairan Anggaran Awal (Uang Muka / Termin 1)</label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0 0.5rem' }}>
                    <span style={{ fontWeight: 700, paddingRight: '0.5rem', color: 'var(--color-text-muted)' }}>Rp</span>
                    <input 
                      type="text" 
                      style={{ flex: 1, padding: '0.75rem 0', border: 'none', outline: 'none', background: 'transparent' }} 
                      placeholder="Contoh: 2.000.000.000 (Kosongkan jika belum cair)" 
                      value={realisasiPencairan} 
                      onChange={e => handleRealisasiChange(e.target.value)} 
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>
                    Nominal dana awal yang sudah dicairkan (isi 0 jika belum ada pencairan)
                  </span>
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 600 }}>Persentase Pencairan (%)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className="form-input" 
                    placeholder="0 - 100" 
                    value={persentasePencairan} 
                    onChange={e => handlePersentasePencairanChange(e.target.value)} 
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>
                    Otomatis dihitung dari total dana
                  </span>
                </div>
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Kasus Posisi</label>
              <textarea className="form-input" rows="3" placeholder="Uraian singkat posisi kasus/kegiatan..." value={kasusPosisi} onChange={e => setKasusPosisi(e.target.value)} required></textarea>
            </div>

            {isAset && (
              <>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>Permasalahan</label>
                  <textarea className="form-input" rows="3" placeholder="Uraian singkat permasalahan..." value={permasalahan} onChange={e => setPermasalahan(e.target.value)} required></textarea>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>Jenis Aset (Daftar)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {jenisAset.map((aset, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '0.5rem' }}>
                        <input type="text" className="form-input" style={{ flex: 1 }} placeholder={`Aset ${idx + 1} (contoh: Tanah 1000m2)`} value={aset} onChange={e => handleAsetChange(idx, e.target.value)} required />
                        {jenisAset.length > 1 && (
                          <button type="button" className="btn btn-outline" style={{ padding: '0.75rem' }} onClick={() => handleRemoveAset(idx)}>
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" className="btn btn-outline" style={{ alignSelf: 'flex-start', padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={handleAddAset}>
                      <Plus size={16} style={{ marginRight: '0.5rem' }} /> Tambah Aset
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {(!hasInitialData && isAset) ? null : (
          <>
            {/* Live Financial Summary Banner inside Modal (Periodic Progress Reporting) */}
            {hasInitialData && isInfrastruktur && (() => {
              const currentDisbursedNum = parseInt((realisasiPencairan || '0').replace(/\./g, ''), 10) || 0;
              const stats = getDisbursementStats();
              const previewKumulatif = stats.totalKumulatif + currentDisbursedNum;
              const previewPctKumulatif = stats.totalAnggaran > 0 ? ((previewKumulatif / stats.totalAnggaran) * 100).toFixed(1) : '0';
              const previewSisa = Math.max(0, stats.totalAnggaran - previewKumulatif);

              return (
                <div style={{
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #e6f9ed 100%)',
                  border: '1px solid #86efac',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem',
                  marginBottom: '1.5rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#166534', fontSize: '0.92rem' }}>
                      <DollarSign size={18} /> Ringkasan Anggaran & Pencairan Proyek
                    </div>
                    <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: '99px', fontWeight: 800 }}>
                      Total Dana: {formatCurrency(stats.totalAnggaran)}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
                    <div style={{ background: 'white', padding: '0.6rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>Telah Dicairkan Sebelumnya</div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0284c7', marginTop: '2px' }}>
                        {formatCurrency(stats.totalKumulatif)}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                        ({stats.percentKumulatif}% dari total dana)
                      </div>
                    </div>
                    <div style={{ background: 'white', padding: '0.6rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>Total Setelah Pencairan Ini</div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#16a34a', marginTop: '2px' }}>
                        {formatCurrency(previewKumulatif)}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 800 }}>
                        ({previewPctKumulatif}% dari total dana)
                      </div>
                    </div>
                    <div style={{ background: 'white', padding: '0.6rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>Sisa Anggaran Proyek</div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#d97706', marginTop: '2px' }}>
                        {formatCurrency(previewSisa)}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                        ({stats.totalAnggaran > 0 ? (100 - parseFloat(previewPctKumulatif)).toFixed(1) : 0}% tersisa)
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

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

            {hasInitialData && isInfrastruktur && (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 600 }}>Realisasi Pencairan Anggaran (Termin/Tahap Ini)</label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0 0.5rem' }}>
                    <span style={{ fontWeight: 700, paddingRight: '0.5rem', color: 'var(--color-text-muted)' }}>Rp</span>
                    <input 
                      type="text" 
                      style={{ flex: 1, padding: '0.75rem 0', border: 'none', outline: 'none', background: 'transparent' }} 
                      placeholder="Contoh: 1.500.000.000 (Jika tidak ada pencairan isi 0)" 
                      value={realisasiPencairan} 
                      onChange={e => handleRealisasiChange(e.target.value)} 
                      required 
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>
                    Nominal pencairan anggaran pada pelaporan termin/tahap ini
                  </span>
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 600 }}>Persentase Pencairan (%)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className="form-input" 
                    placeholder="0 - 100" 
                    value={persentasePencairan} 
                    onChange={e => handlePersentasePencairanChange(e.target.value)} 
                    required 
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>
                    % termin tahap ini dari total dana
                  </span>
                </div>
              </div>
            )}

            {(hasInitialData && isAset) && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Nominal Aset Berhasil Dipulihkan</label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0 0.5rem' }}>
                  <span style={{ fontWeight: 700, paddingRight: '0.5rem', color: 'var(--color-text-muted)' }}>Rp</span>
                  <input type="text" style={{ flex: 1, padding: '0.75rem 0', border: 'none', outline: 'none', background: 'transparent' }} placeholder="Contoh: 5.000.000.000" value={nilaiDipulihkan} onChange={e => setNilaiDipulihkan(formatRupiah(e.target.value))} required />
                </div>
              </div>
            )}
          </>
        )}

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{ fontWeight: 600 }}>Hambatan / Kendala</label>
          <WysiwygEditor value={hambatan} onChange={setHambatan} placeholder="Tuliskan hambatan atau kendala yang dihadapi di lapangan..." />
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{ fontWeight: 600 }}>Keterangan Tambahan / Catatan</label>
          <WysiwygEditor value={keterangan} onChange={setKeterangan} placeholder="Catatan tambahan lainnya (opsional)..." />
        </div>

        <DriveFileUpload
          multiple
          label="Dokumen / Berkas Pendukung Laporan (Google Drive)"
          value={dokumenList.length > 0 ? dokumenList : (linkDokumen ? [{ name: 'Dokumen Laporan', url: linkDokumen }] : [])}
          onChange={(files, meta) => {
            if (Array.isArray(files)) {
              setDokumenList(files);
              setLinkDokumen(files.length > 0 ? files[0].url : '');
            } else {
              setLinkDokumen(files || '');
            }
            if (meta?.folderUrl) setFolderDriveUrl(meta.folderUrl);
          }}
          permohonanId={linkId}
          permohonanTitle={kegiatan || projectData?.monitoring?.kegiatan || projectData?.suratData?.perihal || linkId}
          folderCategory="laporan"
          helpText="Pilih satu atau banyak berkas (Kurva S, Foto Lapangan, Berita Acara, dsb.)"
        />

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
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="badge" style={{ background: 'white', color: 'var(--color-primary-shadow)' }}>
                {projectData.sp2Data?.nomor ? `SP-2: ${projectData.sp2Data.nomor}` : 'Belum terbit SP-2'}
              </span>
              {(projectData.driveFolderUrl || projectData.suratData?.driveFolderUrl || folderDriveUrl) && (
                <a
                  href={projectData.driveFolderUrl || projectData.suratData?.driveFolderUrl || folderDriveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="badge"
                  style={{
                    background: 'white',
                    color: 'var(--color-primary-shadow)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer'
                  }}
                  title="Buka Folder Arsip Google Drive Kegiatan"
                >
                  <Folder size={13} /> Folder Drive Kegiatan
                </a>
              )}
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
          // IF HAS INITIAL DATA: Show Financial Summary + Table
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Financial Summary Card */}
            {isInfrastruktur && (() => {
              const stats = getDisbursementStats();
              const latestPhysical = projectData.monitoring.reports?.length > 0
                ? projectData.monitoring.reports[projectData.monitoring.reports.length - 1].persentaseKegiatan
                : (projectData.monitoring.initialData?.persentaseKegiatan || projectData.monitoring.persentaseKegiatan || '0%');
              const physicalNum = parseFloat(latestPhysical) || 0;
              const financialNum = parseFloat(stats.percentKumulatif) || 0;
              const deviation = (financialNum - physicalNum).toFixed(1);

              return (
                <div className="card" style={{ padding: '1.5rem', background: 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <h2 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--color-primary-shadow)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <DollarSign size={22} color="var(--color-primary)" /> Ringkasan Realisasi Pencairan Anggaran
                      </h2>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                        Pengawasan komparatif realisasi pencairan dana terhadap kemajuan fisik pekerjaan
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge" style={{ background: '#e5f9d6', color: 'var(--color-primary-shadow)', fontWeight: 800, padding: '0.4rem 0.8rem' }}>
                        Total Dana: {formatCurrency(stats.totalAnggaran)}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Total Nilai Anggaran
                      </span>
                      <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1e293b', marginTop: '0.25rem' }}>
                        {formatCurrency(stats.totalAnggaran)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                        Plafon dana proyek
                      </div>
                    </div>

                    <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                      <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Total Sudah Dicairkan
                      </span>
                      <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#15803d', marginTop: '0.25rem' }}>
                        {formatCurrency(stats.totalKumulatif)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 700, marginTop: '0.25rem' }}>
                        {stats.percentKumulatif}% dari total dana
                      </div>
                    </div>

                    <div style={{ background: '#fffbeb', padding: '1rem', borderRadius: '10px', border: '1px solid #fef08a' }}>
                      <span style={{ fontSize: '0.78rem', color: '#854d0e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Sisa Anggaran Belum Dicairkan
                      </span>
                      <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#b45309', marginTop: '0.25rem' }}>
                        {formatCurrency(stats.sisa)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#854d0e', fontWeight: 700, marginTop: '0.25rem' }}>
                        {stats.totalAnggaran > 0 ? (100 - parseFloat(stats.percentKumulatif)).toFixed(1) : 0}% sisa alokasi
                      </div>
                    </div>
                  </div>

                  {/* Progress comparison */}
                  <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 700 }}>
                          <span style={{ color: '#0369a1' }}>🏗️ Kemajuan Fisik (Terakhir):</span>
                          <span style={{ color: '#0369a1' }}>{latestPhysical}</span>
                        </div>
                        <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${Math.min(100, physicalNum)}%`,
                            background: '#0284c7',
                            borderRadius: '99px',
                            transition: 'width 0.4s ease'
                          }} />
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 700 }}>
                          <span style={{ color: '#15803d' }}>💰 Realisasi Pencairan Anggaran:</span>
                          <span style={{ color: '#15803d' }}>{stats.percentKumulatif}% ({formatCurrency(stats.totalKumulatif)})</span>
                        </div>
                        <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${Math.min(100, financialNum)}%`,
                            background: '#16a34a',
                            borderRadius: '99px',
                            transition: 'width 0.4s ease'
                          }} />
                        </div>
                      </div>
                    </div>

                    {/* Deviation status bar */}
                    <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.82rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--color-text-muted)' }}>Status Keselarasan Fisik vs Keuangan:</span>
                      {Math.abs(deviation) <= 10 ? (
                        <span style={{ color: '#16a34a', fontWeight: 800, background: '#dcfce7', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                          ✓ Proporsional (Selisih {Math.abs(deviation)}%)
                        </span>
                      ) : deviation > 10 ? (
                        <span style={{ color: '#b91c1c', fontWeight: 800, background: '#fee2e2', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                          ⚠️ Pencairan mendahului fisik (+{deviation}%) - Perlu Pengawasan JPN
                        </span>
                      ) : (
                        <span style={{ color: '#d97706', fontWeight: 800, background: '#fef3c7', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                          ℹ️ Fisik mendahului pencairan ({deviation}%)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Table Riwayat Laporan Progres */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem', borderBottom: '2px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fafafa' }}>
                <h2 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <Activity size={20} /> Riwayat Laporan Progres & Pencairan Anggaran
                </h2>
              </div>
              <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tahap / Waktu</th>
                      <th>Progres Fisik</th>
                      {isInfrastruktur && <th>Realisasi Pencairan Anggaran</th>}
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
                        <div style={{ fontWeight: 700 }}>{projectData.monitoring.initialData?.progressKegiatan || projectData.monitoring.progressKegiatan || '-'}</div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', background: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 800, marginTop: '4px' }}>
                          Fisik: {projectData.monitoring.initialData?.persentaseKegiatan || projectData.monitoring.persentaseKegiatan || '0%'}
                        </div>
                      </td>
                      {isInfrastruktur && (
                        <td>
                          {(() => {
                            const dis = getReportDisbursement(-1);
                            return (
                              <div>
                                <div style={{ fontWeight: 800, color: '#166534', fontSize: '0.9rem' }}>
                                  {formatCurrency(dis.tahap)}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                                  Pencairan: <span style={{ color: '#15803d' }}>{dis.persenTahap}</span>
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '4px', background: '#f8fafc', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'inline-block' }}>
                                  Total cair: <strong>{formatCurrency(dis.kumulatif)}</strong> ({dis.persenKumulatif} dari total)
                                </div>
                              </div>
                            );
                          })()}
                        </td>
                      )}
                      <td>
                        <div style={{ fontSize: '0.9rem', color: '#c0392b' }}>
                          <div dangerouslySetInnerHTML={{ __html: projectData.monitoring.initialData?.hambatan || projectData.monitoring.hambatan || '-' }} />
                        </div>
                        {(projectData.monitoring.initialData?.keterangan || projectData.monitoring.keterangan) && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-main)', marginTop: '0.5rem' }}>
                            <span style={{ fontWeight: 700, color: 'var(--color-text-muted)' }}>Ket:</span> <div dangerouslySetInnerHTML={{ __html: projectData.monitoring.initialData?.keterangan || projectData.monitoring.keterangan }} />
                          </div>
                        )}
                        {((projectData.monitoring.initialData?.dokumenFiles && projectData.monitoring.initialData.dokumenFiles.length > 0) || (projectData.monitoring.initialData?.linkDokumen || projectData.monitoring.linkDokumen)) && (
                          <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {projectData.monitoring.initialData?.dokumenFiles && projectData.monitoring.initialData.dokumenFiles.length > 0 ? (
                              projectData.monitoring.initialData.dokumenFiles.map((doc, dIdx) => (
                                <a key={dIdx} href={doc.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-secondary-shadow)', textDecoration: 'underline', fontWeight: 600, fontSize: '0.82rem' }}>
                                  <FileText size={12} /> {doc.name || `Dokumen ${dIdx + 1}`}
                                </a>
                              ))
                            ) : (
                              <a href={projectData.monitoring.initialData?.linkDokumen || projectData.monitoring.linkDokumen} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-secondary-shadow)', textDecoration: 'underline', fontWeight: 600, fontSize: '0.85rem' }}>
                                Lihat Dokumen
                              </a>
                            )}
                          </div>
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
                        {(projectData.monitoring.initialData?.saranDriveUrl || projectData.monitoring.saranDriveUrl) && (
                          <div style={{ marginTop: '0.6rem' }}>
                            <a
                              href={projectData.monitoring.initialData?.saranDriveUrl || projectData.monitoring.saranDriveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#8e44ad', color: 'white', borderRadius: '8px', padding: '0.3rem 0.75rem', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none' }}
                            >
                              ⬇ Unduh Saran Kejati
                            </a>
                          </div>
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
                          <div style={{ fontWeight: 700 }}>{rep.progressKegiatan || '-'}</div>
                          <div style={{ display: 'inline-flex', alignItems: 'center', background: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 800, marginTop: '4px' }}>
                            Fisik: {rep.persentaseKegiatan || '0%'}
                          </div>
                          {isAset && rep.nilaiDipulihkan ? (
                            <div style={{ fontSize: '0.75rem', color: '#27ae60', fontWeight: 700, marginTop: '2px' }}>
                              Aset Pulih: {formatCurrency(rep.nilaiDipulihkan)}
                            </div>
                          ) : null}
                        </td>
                        {isInfrastruktur && (
                          <td>
                            {(() => {
                              const dis = getReportDisbursement(idx);
                              return (
                                <div>
                                  <div style={{ fontWeight: 800, color: '#166534', fontSize: '0.9rem' }}>
                                    {formatCurrency(dis.tahap)}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                                    Tahap ini: <span style={{ color: '#15803d' }}>{dis.persenTahap}</span>
                                  </div>
                                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '4px', background: '#f8fafc', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'inline-block' }}>
                                    Total s.d. tahap ini: <strong>{formatCurrency(dis.kumulatif)}</strong> ({dis.persenKumulatif} dari total)
                                  </div>
                                </div>
                              );
                            })()}
                          </td>
                        )}
                        <td>
                          <div style={{ fontSize: '0.9rem', color: '#c0392b' }}>
                            <div dangerouslySetInnerHTML={{ __html: rep.hambatan || '-' }} />
                          </div>
                          {rep.keterangan && (
                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-main)', marginTop: '0.5rem' }}>
                              <span style={{ fontWeight: 700, color: 'var(--color-text-muted)' }}>Ket:</span> <div dangerouslySetInnerHTML={{ __html: rep.keterangan }} />
                            </div>
                          )}
                          {((rep.dokumenFiles && rep.dokumenFiles.length > 0) || rep.linkDokumen) && (
                            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              {rep.dokumenFiles && rep.dokumenFiles.length > 0 ? (
                                rep.dokumenFiles.map((doc, dIdx) => (
                                  <a key={dIdx} href={doc.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-secondary-shadow)', textDecoration: 'underline', fontWeight: 600, fontSize: '0.82rem' }}>
                                    <FileText size={12} /> {doc.name || `Dokumen ${dIdx + 1}`}
                                  </a>
                                ))
                              ) : (
                                <a href={rep.linkDokumen} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-secondary-shadow)', textDecoration: 'underline', fontWeight: 600, fontSize: '0.85rem' }}>
                                  Lihat Dokumen
                                </a>
                              )}
                            </div>
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
                               {rep.saranDriveUrl && (
                                 <div style={{ marginTop: '0.6rem' }}>
                                   <a
                                     href={rep.saranDriveUrl}
                                     target="_blank"
                                     rel="noopener noreferrer"
                                     style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#8e44ad', color: 'white', borderRadius: '8px', padding: '0.3rem 0.75rem', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none' }}
                                   >
                                     ⬇ Unduh Saran Kejati
                                   </a>
                                 </div>
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
        const reportDisbursed = getReportDisbursement(index);

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
              {/* Financial Box */}
              {isInfrastruktur && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1.25rem', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#166534', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <DollarSign size={18} /> Realisasi Pencairan Anggaran & Progres Fisik
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', textAlign: 'center' }}>
                    <div style={{ background: 'white', padding: '0.6rem', borderRadius: '6px', border: '1px solid #dcfce7' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>Pencairan Tahap Ini</div>
                      <div style={{ fontWeight: 800, color: '#15803d', fontSize: '1rem' }}>{formatCurrency(reportDisbursed.tahap)}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>({reportDisbursed.persenTahap})</div>
                    </div>
                    <div style={{ background: 'white', padding: '0.6rem', borderRadius: '6px', border: '1px solid #dcfce7' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>Total Sudah Dicairkan</div>
                      <div style={{ fontWeight: 800, color: '#047857', fontSize: '1rem' }}>{formatCurrency(reportDisbursed.kumulatif)}</div>
                      <div style={{ fontSize: '0.7rem', color: '#047857', fontWeight: 700 }}>({reportDisbursed.persenKumulatif} dari total)</div>
                    </div>
                    <div style={{ background: 'white', padding: '0.6rem', borderRadius: '6px', border: '1px solid #dcfce7' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>Sisa Anggaran</div>
                      <div style={{ fontWeight: 800, color: '#b45309', fontSize: '1rem' }}>{formatCurrency(reportDisbursed.sisa)}</div>
                    </div>
                    <div style={{ background: 'white', padding: '0.6rem', borderRadius: '6px', border: '1px solid #dcfce7' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>Kemajuan Fisik</div>
                      <div style={{ fontWeight: 800, color: '#0284c7', fontSize: '1rem' }}>
                        {index === -1 ? (projectData.monitoring.initialData?.persentaseKegiatan || projectData.monitoring.persentaseKegiatan || '0%') : (targetData.persentaseKegiatan || '0%')}
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
