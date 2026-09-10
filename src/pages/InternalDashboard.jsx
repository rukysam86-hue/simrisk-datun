import { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, Activity, Link as LinkIcon, Plus, X, Clock, FileText, Trash2, AlertTriangle, AlertCircle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllPermohonan, deletePermohonan } from '../data/store';

function InternalDashboard() {
  const [permohonanList, setPermohonanList] = useState([]);

  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const data = await getAllPermohonan();
    setPermohonanList(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus data ini secara permanen?')) {
      await deletePermohonan(id);
      loadData();
    }
  };

  // Filter activities (currentStep 5 and dapat didampingi)
  const activities = permohonanList.filter(p => p.currentStep === 5 && p.telaahData?.dapatDidampingi === 'ya');
  
  // Filter new permohonan (currentStep < 5)
  const newPermohonan = permohonanList.filter(p => p.currentStep < 5);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Dashboard Simrisk Datun Kejati NTT</h1>
          <p style={{ color: 'var(--color-text-muted)', fontWeight: '700' }}>Ringkasan Kegiatan Pendampingan Hukum</p>
        </div>
        <Link to="/register" className="btn btn-primary">
          <Plus size={20} />
          Kegiatan Baru
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '2px solid #99c2ff' }}>
          <div style={{ background: '#e5f0ff', padding: '1rem', borderRadius: '16px', color: '#0055ff' }}>
            <FileText size={32} />
          </div>
          <div>
            <h3 style={{ marginBottom: 0, fontSize: '2rem', color: '#0055ff' }}>{permohonanList.length}</h3>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-text-muted)' }}>Total Permohonan Diterima</p>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '2px solid #bce699' }}>
          <div style={{ background: '#e5f9d6', padding: '1rem', borderRadius: '16px', color: 'var(--color-primary-shadow)' }}>
            <CheckCircle size={32} />
          </div>
          <div>
            <h3 style={{ marginBottom: 0, fontSize: '2rem', color: 'var(--color-primary-shadow)' }}>{permohonanList.filter(p => p.telaahData?.dapatDidampingi === 'ya').length}</h3>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-text-muted)' }}>Pendampingan Disetujui</p>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '2px solid #ffb3b3' }}>
          <div style={{ background: '#ffe2e2', padding: '1rem', borderRadius: '16px', color: 'var(--color-danger-shadow)' }}>
            <ShieldAlert size={32} />
          </div>
          <div>
            <h3 style={{ marginBottom: 0, fontSize: '2rem', color: 'var(--color-danger-shadow)' }}>{permohonanList.filter(p => p.telaahData?.dapatDidampingi === 'tidak').length}</h3>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-text-muted)' }}>Tidak Didampingi (Arsip)</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '2px solid #ffb3b3' }}>
          <div style={{ background: '#ffe2e2', padding: '1rem', borderRadius: '16px', color: 'var(--color-danger-shadow)' }}>
            <AlertTriangle size={32} />
          </div>
          <div>
            <h3 style={{ marginBottom: 0, fontSize: '2rem', color: 'var(--color-danger-shadow)' }}>{activities.filter(a => a.monitoring?.risk === 'high').length}</h3>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-text-muted)' }}>Proyek Risiko Tinggi</p>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '2px solid #ffe599' }}>
          <div style={{ background: '#fff5cc', padding: '1rem', borderRadius: '16px', color: '#d4ac0d' }}>
            <AlertCircle size={32} />
          </div>
          <div>
            <h3 style={{ marginBottom: 0, fontSize: '2rem', color: '#d4ac0d' }}>{activities.filter(a => a.monitoring?.risk === 'medium').length}</h3>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-text-muted)' }}>Proyek Risiko Sedang</p>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '2px solid #bce699' }}>
          <div style={{ background: '#e5f9d6', padding: '1rem', borderRadius: '16px', color: 'var(--color-primary-shadow)' }}>
            <ShieldCheck size={32} />
          </div>
          <div>
            <h3 style={{ marginBottom: 0, fontSize: '2rem', color: 'var(--color-primary-shadow)' }}>{activities.filter(a => a.monitoring?.risk === 'low').length}</h3>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-text-muted)' }}>Proyek Risiko Rendah</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem', border: '2px solid var(--color-secondary-shadow)' }}>
        <div style={{ padding: '1.5rem', borderBottom: '2px solid var(--color-border)', backgroundColor: '#ddf4ff' }}>
          <h2 style={{ margin: 0, color: 'var(--color-secondary-shadow)' }}>Permohonan Pendampingan (Dalam Proses)</h2>
        </div>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Asal Surat & Tanggal</th>
                <th>Perihal</th>
                <th>Isi Ringkas</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {newPermohonan.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Tidak ada permohonan baru.</td>
                </tr>
              ) : (
                newPermohonan.map(act => (
                  <tr key={act.id}>
                    <td>
                      <div style={{ fontWeight: 800 }}>{act.suratData?.asalSurat}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>{act.suratData?.tanggalSurat}</div>
                    </td>
                    <td style={{ fontWeight: 700 }}>{act.suratData?.perihal}</td>
                    <td style={{ fontSize: '0.9rem' }}>{act.suratData?.isiSurat}</td>
                    <td>
                      <span className="badge badge-low" style={{ background: '#e0e0e0', color: '#4b4b4b', borderColor: '#ccc' }}>
                        {act.currentStep === 1 ? 'DITERIMA' : act.currentStep === 2 ? 'MENUNGGU SP-1' : act.currentStep === 3 ? 'MENUNGGU TELAAH' : 'MENUNGGU SP-2'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to={`/permohonan/${act.id}`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Detail Permohonan</Link>
                        <button className="btn btn-outline" style={{ padding: '0.5rem', color: 'var(--color-danger-shadow)', borderColor: 'var(--color-danger-shadow)' }} onClick={() => handleDelete(act.id)} title="Hapus Data">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '2px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Daftar Kegiatan Aktif</h2>
        </div>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Instansi & Kegiatan</th>
                <th>Nilai Anggaran</th>
                <th>Progres Kegiatan</th>
                <th>Keterangan & Update</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {activities.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Tidak ada kegiatan aktif.</td>
                </tr>
              ) : (
                activities.map(act => (
                  <tr key={act.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ fontWeight: 800 }}>{act.suratData?.perihal}</div>
                        {act.monitoring?.risk && (
                          <div 
                            title={act.monitoring.risk === 'high' ? 'Risiko Tinggi' : act.monitoring.risk === 'medium' ? 'Risiko Sedang' : 'Risiko Rendah'}
                            style={{ 
                              width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0,
                              backgroundColor: act.monitoring.risk === 'high' ? 'var(--color-danger)' : act.monitoring.risk === 'medium' ? 'var(--color-warning)' : 'var(--color-primary)' 
                            }} 
                          />
                        )}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>{act.suratData?.asalSurat}</div>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {act.monitoring?.nilai ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(act.monitoring.nilai) : '-'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 800, minWidth: '40px' }}>Prog:</span>
                        <div style={{ flex: 1, height: '8px', background: 'var(--color-surface)', borderRadius: '4px' }}>
                          <div style={{ width: act.monitoring?.persentaseKegiatan || '0%', height: '100%', background: 'var(--color-primary)', borderRadius: '4px' }}></div>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{act.monitoring?.persentaseKegiatan || '0%'}</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        {act.monitoring?.progressKegiatan || '-'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        {act.monitoring?.keterangan || '-'}
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                        Update: {act.monitoring?.lastUpdate || '-'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: '8px' }} title="Copy Secure Link Pemohon" onClick={() => {
                          const url = `${window.location.origin}/portal/${act.id}`;
                          navigator.clipboard.writeText(`Akses Link: ${url}\nPassword: ${act.id}`);
                          alert('Link dan password akses pemohon disalin ke clipboard!');
                        }}>
                          <LinkIcon size={16} />
                        </button>
                        <Link to={`/permohonan/${act.id}`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                          Detail
                        </Link>
                        <button className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: '8px', color: 'var(--color-danger-shadow)', borderColor: 'var(--color-danger-shadow)' }} onClick={() => handleDelete(act.id)} title="Hapus Data">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default InternalDashboard;
