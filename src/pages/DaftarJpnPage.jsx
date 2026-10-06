import { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, RotateCcw, Search, Check, X, Shield, Award, UserCheck } from 'lucide-react';
import { getMasterJpnList, addMasterJpn, updateMasterJpn, deleteMasterJpn, resetMasterJpnToDefault } from '../data/store';

export default function DaftarJpnPage() {
  const [jpnList, setJpnList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nama: '',
    pangkat: 'Jaksa Madya',
    nip: '',
    nrp: '',
    jabatan: 'Jaksa Pengacara Negara pada Kantor Pengacara Negara di Kejaksaan Tinggi NTT'
  });

  const loadData = () => {
    setJpnList(getMasterJpnList());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      nama: '',
      pangkat: 'Jaksa Madya',
      nip: '',
      nrp: '',
      jabatan: 'Jaksa Pengacara Negara pada Kantor Pengacara Negara di Kejaksaan Tinggi NTT'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingId(item.id);
    setFormData({
      nama: item.nama || '',
      pangkat: item.pangkat || 'Jaksa Madya',
      nip: item.nip || '',
      nrp: item.nrp || '',
      jabatan: item.jabatan || 'Jaksa Pengacara Negara pada Kantor Pengacara Negara di Kejaksaan Tinggi NTT'
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.nama.trim()) {
      alert('Nama JPN wajib diisi.');
      return;
    }

    if (editingId) {
      updateMasterJpn(editingId, formData);
    } else {
      addMasterJpn(formData);
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = (id, nama) => {
    if (window.confirm(`Yakin ingin menghapus ${nama} dari daftar JPN?`)) {
      deleteMasterJpn(id);
      loadData();
    }
  };

  const handleResetDefault = () => {
    if (window.confirm('Kembalikan daftar JPN ke data personil default Kejati NTT (7 Jaksa)?')) {
      resetMasterJpnToDefault();
      loadData();
    }
  };

  const filteredJpn = jpnList.filter(j => {
    const q = searchTerm.toLowerCase();
    return (
      (j.nama || '').toLowerCase().includes(q) ||
      (j.nip || '').toLowerCase().includes(q) ||
      (j.nrp || '').toLowerCase().includes(q) ||
      (j.pangkat || '').toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2.1rem' }}>
            <Users size={32} color="var(--color-primary-shadow)" />
            Daftar Jaksa Pengacara Negara (JPN)
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontWeight: 700, margin: '0.5rem 0 0 0' }}>
            Kejaksaan Tinggi Nusa Tenggara Timur • Personil terdaftar akan otomatis terisi saat penugasan SP-1 & SP-2
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-outline"
            style={{ padding: '0.65rem 1.1rem', fontSize: '0.88rem' }}
            onClick={handleResetDefault}
            title="Kembalikan ke susunan personil default Kejati NTT"
          >
            <RotateCcw size={16} /> Reset Default
          </button>
          <button
            className="btn btn-primary"
            style={{ padding: '0.65rem 1.3rem', fontSize: '0.88rem' }}
            onClick={handleOpenAddModal}
          >
            <Plus size={18} /> Tambah JPN Baru
          </button>
        </div>
      </div>

      {/* Info Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div className="card" style={{ padding: '1.25rem', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
            <UserCheck size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>TOTAL PERSONIL JPN</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--color-text-main)' }}>{jpnList.length} Orang</div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
            <Award size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>JAKSA UTAMA PRATAMA</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#d97706' }}>
              {jpnList.filter(j => (j.pangkat || '').toLowerCase().includes('utama')).length} Orang
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
            <Shield size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>JAKSA MADYA</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#16a34a' }}>
              {jpnList.filter(j => (j.pangkat || '').toLowerCase().includes('madya')).length} Orang
            </div>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Search size={20} color="var(--color-text-muted)" />
        <input
          type="text"
          placeholder="Cari personil JPN berdasarkan nama, NIP, NRP, atau pangkat..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            border: 'none',
            outline: 'none',
            width: '100%',
            fontSize: '0.95rem',
            fontWeight: 600,
            background: 'transparent'
          }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Table of JPN */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-surface)', borderBottom: '2px solid var(--color-border)' }}>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 800, width: '50px' }}>No</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 800 }}>Nama Lengkap & Gelar</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 800 }}>Pangkat / Golongan</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 800 }}>NIP & NRP</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 800 }}>Jabatan Penugasan</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 800, textAlign: 'center', width: '110px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredJpn.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    Tidak ada personil JPN yang cocok dengan pencarian "{searchTerm}".
                  </td>
                </tr>
              ) : (
                filteredJpn.map((jpn, idx) => (
                  <tr
                    key={jpn.id || idx}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--color-text-main)' }}>
                        {jpn.nama}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          backgroundColor: (jpn.pangkat || '').toLowerCase().includes('utama') ? '#fef3c7' : '#e0f2fe',
                          color: (jpn.pangkat || '').toLowerCase().includes('utama') ? '#92400e' : '#0369a1'
                        }}
                      >
                        {jpn.pangkat || 'Jaksa Madya'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem' }}>
                      <div><span style={{ color: 'var(--color-text-muted)', fontWeight: 700 }}>NIP:</span> {jpn.nip || '-'}</div>
                      <div><span style={{ color: 'var(--color-text-muted)', fontWeight: 700 }}>NRP:</span> {jpn.nrp || '-'}</div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', maxWidth: '280px' }}>
                      {jpn.jabatan || 'Jaksa Pengacara Negara pada Kejati NTT'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '0.4rem 0.55rem', borderRadius: '8px' }}
                          onClick={() => handleOpenEditModal(jpn)}
                          title="Edit Data JPN"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '0.4rem 0.55rem', borderRadius: '8px', color: 'var(--color-danger-shadow)', borderColor: 'var(--color-danger-shadow)' }}
                          onClick={() => handleDelete(jpn.id, jpn.nama)}
                          title="Hapus JPN"
                        >
                          <Trash2 size={15} />
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

      {/* Modal Tambah / Edit JPN */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '540px', margin: 0, padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.75rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={22} color="var(--color-primary-shadow)" />
                {editingId ? 'Edit Data JPN' : 'Tambah JPN Baru'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Nama Lengkap & Gelar *</label>
                <input
                  required
                  className="form-input"
                  placeholder="Contoh: Choirun Parapat, S.H., M.H."
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Pangkat / Golongan</label>
                <select
                  className="form-input"
                  value={formData.pangkat}
                  onChange={(e) => setFormData({ ...formData, pangkat: e.target.value })}
                >
                  <option value="Jaksa Utama Madya">Jaksa Utama Madya (IV/d)</option>
                  <option value="Jaksa Utama Pratama">Jaksa Utama Pratama (IV/c)</option>
                  <option value="Jaksa Madya">Jaksa Madya (IV/a - IV/b)</option>
                  <option value="Jaksa Muda">Jaksa Muda (III/d)</option>
                  <option value="Jaksa Pratama">Jaksa Pratama (III/c)</option>
                  <option value="Ajun Jaksa">Ajun Jaksa (III/b)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>NIP</label>
                  <input
                    className="form-input"
                    placeholder="Contoh: 197601152000121001"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>NRP</label>
                  <input
                    className="form-input"
                    placeholder="Contoh: 60176017"
                    value={formData.nrp}
                    onChange={(e) => setFormData({ ...formData, nrp: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Jabatan / Unit Tugas</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Contoh: Jaksa Pengacara Negara pada Kantor Pengacara Negara di Kejaksaan Tinggi NTT"
                  value={formData.jabatan}
                  onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={18} /> Simpan Data JPN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
