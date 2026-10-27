import { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  FileText,
  Trash2,
  AlertTriangle,
  AlertCircle,
  ShieldCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Plus,
  X,
  Clock,
  Briefcase,
  Layers,
  Activity,
  FileCheck2,
  TrendingUp,
  FileWarning,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllPermohonan, deletePermohonan } from '../data/store';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// ─── Status Tahap SOP Sesuai Standar Datun ──────────────────────
const STEP_LABELS = {
  1: { label: 'Surat Diterima',      bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', icon: FileText },
  2: { label: 'Penerbitan SP-1',    bg: '#fef3c7', color: '#b45309', border: '#fde68a', icon: Clock },
  3: { label: 'Proses Telaah JPN',  bg: '#fff7ed', color: '#c2410c', border: '#fed7aa', icon: FileCheck2 },
  4: { label: 'Penerbitan SP-2',    bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe', icon: ShieldCheck },
  5: { label: 'Monitoring Berjalan',bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', icon: Activity },
};

const PAGE_SIZE_OPTIONS = [5, 10, 20];

const formatRupiah = (val) => {
  if (!val && val !== 0) return '-';
  return 'Rp ' + Number(val).toLocaleString('id-ID');
};

// ─── Komponen Badge Status Tahap ────────────────────────────────
function StatusBadge({ step }) {
  const s = STEP_LABELS[step] || { label: `Tahap ${step}`, bg: '#f1f5f9', color: '#475569', border: '#cbd5e1', icon: Clock };
  const IconComponent = s.icon;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      padding: '0.35rem 0.75rem',
      borderRadius: 'var(--radius-full)',
      fontSize: '0.78rem',
      fontWeight: 700,
      letterSpacing: '0.02em',
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
      whiteSpace: 'nowrap',
    }}>
      <IconComponent size={14} style={{ color: s.color, flexShrink: 0 }} />
      <span>{s.label}</span>
    </span>
  );
}

// ─── Komponen Badge Tingkat Risiko ──────────────────────────────
const RISK_CONFIG = {
  high:   { label: 'Risiko Tinggi', bg: '#fef2f2', color: '#b91c1c', border: '#fecaca', dot: '#dc2626' },
  medium: { label: 'Risiko Sedang', bg: '#fffbeb', color: '#b45309', border: '#fde68a', dot: '#d97706' },
  low:    { label: 'Risiko Rendah', bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', dot: '#16a34a' },
};

function RiskBadge({ risk }) {
  if (!risk) return <span style={{ color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>—</span>;
  const r = RISK_CONFIG[risk] || { label: risk, bg: '#f8fafc', color: '#475569', border: '#e2e8f0', dot: '#94a3b8' };

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.45rem',
      padding: '0.32rem 0.75rem',
      borderRadius: 'var(--radius-full)',
      fontSize: '0.78rem',
      fontWeight: 700,
      background: r.bg,
      color: r.color,
      border: `1px solid ${r.border}`,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: r.dot, flexShrink: 0 }} />
      <span>{r.label}</span>
    </span>
  );
}

// ─── Komponen Dual Progress Bar (Fisik vs Keuangan) ─────────────
function DualProgressBar({ fisik = '0%', keuangan = '0%' }) {
  const fNum = parseFloat(fisik) || 0;
  const kNum = parseFloat(keuangan) || 0;
  const deviasi = fNum - kNum;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: '150px' }}>
      {/* Bar Fisik */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600 }}>
        <span style={{ color: 'var(--color-text-muted)' }}>Fisik:</span>
        <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{fisik}</span>
      </div>
      <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(fNum, 100)}%`, height: '100%', background: 'var(--color-primary)', borderRadius: '99px' }} />
      </div>

      {/* Bar Keuangan */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, marginTop: '2px' }}>
        <span style={{ color: 'var(--color-text-muted)' }}>Keuangan:</span>
        <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>{keuangan}</span>
      </div>
      <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(kNum, 100)}%`, height: '100%', background: 'var(--color-accent)', borderRadius: '99px' }} />
      </div>

      {/* Deviasi */}
      <div style={{ fontSize: '0.72rem', fontWeight: 700, textAlign: 'right', marginTop: '2px' }}>
        <span style={{ color: deviasi < -5 ? 'var(--color-danger)' : deviasi < 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>
          Deviasi: {deviasi > 0 ? `+${deviasi.toFixed(1)}%` : `${deviasi.toFixed(1)}%`}
        </span>
      </div>
    </div>
  );
}

// ─── Komponen Pagination Ergonomis ──────────────────────────────
function Pagination({ currentPage, totalPages, pageSize, onPageChange, onPageSizeChange, totalItems }) {
  if (totalItems === 0) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to   = Math.min(currentPage * pageSize, totalItems);

  const pages = [];
  const delta = 1;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="pagination-container">
      {/* Informasi Baris Data */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
        <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>
          Menampilkan <strong style={{ color: 'var(--color-text-main)' }}>{from}–{to}</strong> dari <strong style={{ color: 'var(--color-text-main)' }}>{totalItems}</strong> baris
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>Baris:</span>
          <select
            value={pageSize}
            onChange={e => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
            style={{
              padding: '0.3rem 0.6rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              background: 'white',
              color: 'var(--color-text-main)',
              cursor: 'pointer',
            }}
          >
            {PAGE_SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Tombol Halaman */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <button
          className="pagination-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Halaman Sebelumnya"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} style={{ padding: '0 0.35rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`pagination-btn ${p === currentPage ? 'active' : ''}`}
            >
              {p}
            </button>
          )
        )}

        <button
          className="pagination-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Halaman Berikutnya"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── Tabel Permohonan Dalam Proses (Tahap 1–4) ─────────────────
function PermohonanTable({ data, onDelete }) {
  const [search, setSearch]           = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize]       = useState(5);

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(p =>
      (p.suratData?.asalSurat || p.suratData?.namaPemohon || '').toLowerCase().includes(q) ||
      (p.suratData?.perihal || '').toLowerCase().includes(q) ||
      (p.suratData?.nomorSurat || '').toLowerCase().includes(q)
    );
  }, [data, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => { setCurrentPage(1); }, [search]);
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  return (
    <div className="table-card-wrapper fade-in">
      {/* Header Tabel & Pencarian */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span>Permohonan Sedang Diproses</span>
            <span style={{
              background: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              border: '1px solid var(--color-primary-border)',
              borderRadius: 'var(--radius-full)',
              padding: '0.15rem 0.65rem',
              fontSize: '0.78rem',
              fontWeight: 700,
            }}>
              Tahap 1 s.d. 4 SOP
            </span>
          </h3>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Daftar surat permohonan yang menunggu verifikasi, penerbitan SP-1, telaah yuridis, atau SP-2.
          </p>
        </div>

        {/* Input Pencarian */}
        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={17} style={{
            position: 'absolute',
            left: '0.85rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)',
            pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Cari instansi, nomor, perihal..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.4rem', paddingRight: search ? '2.4rem' : '1rem', minHeight: '40px', fontSize: '0.9rem' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '0.65rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                padding: '3px',
              }}
              title="Reset pencarian"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Kontainer Tabel */}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '45px', textAlign: 'center' }}>No</th>
              <th>Instansi Pemohon</th>
              <th>Nomor & Perihal Surat</th>
              <th style={{ textAlign: 'center' }}>Tahapan SOP</th>
              <th style={{ textAlign: 'center', width: '130px' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
                    <Search size={36} color="var(--color-text-muted)" strokeWidth={1.5} />
                    <span style={{ color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.95rem' }}>
                      {search ? `Tidak ditemukan data untuk "${search}"` : 'Belum ada permohonan dalam proses.'}
                    </span>
                    {search && (
                      <button
                        onClick={() => setSearch('')}
                        className="btn btn-sm btn-outline"
                        style={{ marginTop: '0.25rem' }}
                      >
                        Hapus Filter
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((act, idx) => (
                <tr key={act.id}>
                  {/* Nomor */}
                  <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                    {(currentPage - 1) * pageSize + idx + 1}
                  </td>

                  {/* Instansi */}
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-main)' }}>
                      {act.suratData?.asalSurat || act.suratData?.namaPemohon || '-'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={13} />
                      <span>
                        {act.suratData?.tanggalSurat
                          ? new Date(act.suratData.tanggalSurat).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                          : '-'}
                      </span>
                    </div>
                  </td>

                  {/* Perihal */}
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--color-text-body)', lineHeight: 1.4 }}>
                      {act.suratData?.perihal || '-'}
                    </div>
                    {act.suratData?.nomorSurat && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-accent)', fontWeight: 700, fontFamily: 'monospace', marginTop: '3px' }}>
                        No: {act.suratData.nomorSurat}
                      </div>
                    )}
                  </td>

                  {/* Status Tahap SOP */}
                  <td style={{ textAlign: 'center' }}>
                    <StatusBadge step={act.currentStep} />
                  </td>

                  {/* Aksi */}
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.45rem', justifyContent: 'center' }}>
                      <Link
                        to={`/permohonan/${act.id}`}
                        className="btn btn-sm btn-primary"
                        title="Buka Lembar Kerja Tahapan Permohonan"
                      >
                        Detail
                      </Link>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        style={{ color: 'var(--color-danger)', borderColor: 'var(--color-border)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onDelete(act.id);
                        }}
                        title="Hapus Permohonan"
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

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        totalItems={filtered.length}
      />
    </div>
  );
}

// ─── Tabel Kegiatan Monitoring Aktif (Tahap 5) ─────────────────
function KegiatanTable({ data, onDelete }) {
  const [search, setSearch]           = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize]       = useState(5);

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(p =>
      p.suratData?.perihal?.toLowerCase().includes(q)   ||
      p.suratData?.asalSurat?.toLowerCase().includes(q) ||
      p.monitoring?.kegiatan?.toLowerCase().includes(q)
    );
  }, [data, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => { setCurrentPage(1); }, [search]);
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  return (
    <div className="table-card-wrapper fade-in">
      {/* Header Tabel */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span>Kegiatan Pendampingan Aktif</span>
            <span style={{
              background: 'var(--color-accent-light)',
              color: 'var(--color-accent)',
              border: '1px solid var(--color-accent-border)',
              borderRadius: 'var(--radius-full)',
              padding: '0.15rem 0.65rem',
              fontSize: '0.78rem',
              fontWeight: 700,
            }}>
              Tahap 5 Monitoring & Evaluasi
            </span>
          </h3>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Proyek fisik & kegiatan hukum strategis yang didampingi Tim JPN Kejati NTT secara berkelanjutan.
          </p>
        </div>

        {/* Input Pencarian */}
        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={17} style={{
            position: 'absolute',
            left: '0.85rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)',
            pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Cari kegiatan, pemohon..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.4rem', paddingRight: search ? '2.4rem' : '1rem', minHeight: '40px', fontSize: '0.9rem' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '0.65rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                padding: '3px',
              }}
              title="Reset pencarian"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Kontainer Tabel Responsif */}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '45px', textAlign: 'center' }}>No</th>
              <th>Instansi & Objek Kegiatan</th>
              <th style={{ textAlign: 'center' }}>Klasifikasi Risiko</th>
              <th>Pagu & Realisasi Anggaran</th>
              <th>Capaian Fisik vs Keuangan</th>
              <th style={{ textAlign: 'center', width: '130px' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
                    <Search size={36} color="var(--color-text-muted)" strokeWidth={1.5} />
                    <span style={{ color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.95rem' }}>
                      {search ? `Tidak ditemukan data untuk "${search}"` : 'Belum ada kegiatan monitoring aktif.'}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((act, idx) => (
                <tr key={act.id}>
                  {/* Nomor */}
                  <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                    {(currentPage - 1) * pageSize + idx + 1}
                  </td>

                  {/* Instansi & Kegiatan */}
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-main)' }}>
                      {act.monitoring?.kegiatan || act.suratData?.perihal || '-'}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '2px', fontWeight: 500 }}>
                      {act.suratData?.asalSurat || act.suratData?.namaPemohon || '-'}
                    </div>
                  </td>

                  {/* Risiko */}
                  <td style={{ textAlign: 'center' }}>
                    <RiskBadge risk={act.monitoring?.risk} />
                  </td>

                  {/* Anggaran */}
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--color-text-main)' }}>
                      {formatRupiah(act.monitoring?.nilai)}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-accent)', fontWeight: 600, marginTop: '2px' }}>
                      Realisasi: {formatRupiah(act.monitoring?.realisasiPencairan)}
                    </div>
                  </td>

                  {/* Progres Dual Bar */}
                  <td>
                    <DualProgressBar
                      fisik={act.monitoring?.progress}
                      keuangan={act.monitoring?.persentasePencairan}
                    />
                  </td>

                  {/* Aksi */}
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.45rem', justifyContent: 'center' }}>
                      <Link
                        to={`/permohonan/${act.id}`}
                        className="btn btn-sm btn-primary"
                        title="Buka Panel Monitoring Proyek"
                      >
                        Detail
                      </Link>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        style={{ color: 'var(--color-danger)', borderColor: 'var(--color-border)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onDelete(act.id);
                        }}
                        title="Hapus Data Kegiatan"
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

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        totalItems={filtered.length}
      />
    </div>
  );
}

// ─── Halaman Utama Dashboard ──────────────────────────────────
export default function InternalDashboard() {
  const [permohonanList, setPermohonanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('permohonan'); // 'permohonan' | 'kegiatan' | 'analisis'

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
    if (window.confirm('Yakin ingin menghapus data permohonan ini secara permanen dari sistem?')) {
      const cleanId = String(id).trim();

      // Optimistic update: langsung hilangkan seketika dari tabel
      setPermohonanList(prev => prev.filter(p => String(p.id).trim() !== cleanId));

      try {
        await deletePermohonan(cleanId);
      } catch (err) {
        console.error('Gagal menghapus permohonan:', err);
        await loadData();
      }
    }
  };

  // Filter Data
  const activities    = permohonanList.filter(p => p.currentStep === 5 && p.telaahData?.dapatDidampingi === 'ya');
  const newPermohonan = permohonanList.filter(p => p.currentStep < 5);
  const disetujuiCount = permohonanList.filter(p => p.telaahData?.dapatDidampingi === 'ya').length;
  const arsipCount    = permohonanList.filter(p => p.telaahData?.dapatDidampingi === 'tidak').length;

  const highRiskCount   = activities.filter(a => a.monitoring?.risk === 'high').length;
  const mediumRiskCount = activities.filter(a => a.monitoring?.risk === 'medium').length;
  const lowRiskCount    = activities.filter(a => a.monitoring?.risk === 'low').length;
  const otherCount      = activities.length - (highRiskCount + mediumRiskCount + lowRiskCount);

  // Data Pie Chart
  const pieData = [
    { name: 'Risiko Tinggi',          value: highRiskCount,   color: '#dc2626' },
    { name: 'Risiko Sedang',          value: mediumRiskCount, color: '#d97706' },
    { name: 'Risiko Rendah',          value: lowRiskCount,    color: '#16a34a' },
    { name: 'Belum Dinilai / Lainnya',value: Math.max(0, otherCount), color: '#94a3b8' },
  ].filter(d => d.value > 0);

  return (
    <div>
      {/* Page Header Admin */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.75rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span>Dashboard Pengawasan Datun</span>
          </h1>
          <p style={{ margin: '0.35rem 0 0', color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Monitoring Terintegrasi Permohonan Pendampingan Hukum & Mitigasi Risiko Proyek
          </p>
        </div>

        <Link to="/register" className="btn btn-accent" style={{ padding: '0.75rem 1.4rem', fontWeight: 700 }}>
          <Plus size={20} />
          <span>Registrasi Kegiatan Baru</span>
        </Link>
      </div>

      {/* KPI Highlight Metrics (Sangat Mudah Dibaca untuk Usia 30+) */}
      <div className="kpi-grid">
        {/* Total Permohonan */}
        <div className="kpi-card" style={{ '--card-accent-color': 'var(--color-primary)' }}>
          <div className="kpi-icon-bubble" style={{ background: '#eff6ff', color: 'var(--color-primary)' }}>
            <FileText size={28} />
          </div>
          <div className="kpi-content">
            <div className="kpi-value">{permohonanList.length}</div>
            <div className="kpi-label">Total Permohonan Masuk</div>
          </div>
        </div>

        {/* Pendampingan Disetujui */}
        <div className="kpi-card" style={{ '--card-accent-color': 'var(--color-warning)' }}>
          <div className="kpi-icon-bubble" style={{ background: '#fef3c7', color: 'var(--color-warning)' }}>
            <CheckCircle2 size={28} />
          </div>
          <div className="kpi-content">
            <div className="kpi-value">{disetujuiCount}</div>
            <div className="kpi-label">Pendampingan Disetujui</div>
          </div>
        </div>

        {/* Kegiatan Monitoring Aktif */}
        <div className="kpi-card" style={{ '--card-accent-color': 'var(--color-accent)' }}>
          <div className="kpi-icon-bubble" style={{ background: '#f0f9ff', color: 'var(--color-accent)' }}>
            <Activity size={28} />
          </div>
          <div className="kpi-content">
            <div className="kpi-value">{activities.length}</div>
            <div className="kpi-label">Kegiatan Berjalan (Tahap 5)</div>
          </div>
        </div>

        {/* Proyek Berisiko Tinggi */}
        <div className="kpi-card" style={{ '--card-accent-color': 'var(--color-danger)' }}>
          <div className="kpi-icon-bubble" style={{ background: '#fef2f2', color: 'var(--color-danger)' }}>
            <AlertTriangle size={28} />
          </div>
          <div className="kpi-content">
            <div className="kpi-value">{highRiskCount}</div>
            <div className="kpi-label">Perlu Mitigasi Segera</div>
          </div>
        </div>
      </div>

      {/* Tab Navigasi Halaman Utama Dashboard */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        borderBottom: '2px solid var(--color-border)',
        marginBottom: '1.5rem',
        overflowX: 'auto',
        paddingBottom: '2px',
      }}>
        <button
          onClick={() => setActiveTab('permohonan')}
          className="btn"
          style={{
            minHeight: '44px',
            background: activeTab === 'permohonan' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'permohonan' ? '#ffffff' : 'var(--color-text-body)',
            fontWeight: 700,
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            borderBottom: activeTab === 'permohonan' ? '2px solid var(--color-accent)' : '2px solid transparent',
            marginBottom: '-2px',
          }}
        >
          <Layers size={18} />
          <span>Permohonan Dalam Proses</span>
          <span style={{
            background: activeTab === 'permohonan' ? 'rgba(255,255,255,0.2)' : 'var(--color-border)',
            color: activeTab === 'permohonan' ? '#ffffff' : 'var(--color-text-main)',
            padding: '0.1rem 0.5rem',
            borderRadius: '99px',
            fontSize: '0.75rem',
            marginLeft: '0.3rem',
          }}>
            {newPermohonan.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('kegiatan')}
          className="btn"
          style={{
            minHeight: '44px',
            background: activeTab === 'kegiatan' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'kegiatan' ? '#ffffff' : 'var(--color-text-body)',
            fontWeight: 700,
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            borderBottom: activeTab === 'kegiatan' ? '2px solid var(--color-accent)' : '2px solid transparent',
            marginBottom: '-2px',
          }}
        >
          <Briefcase size={18} />
          <span>Kegiatan Monitoring Aktif</span>
          <span style={{
            background: activeTab === 'kegiatan' ? 'rgba(255,255,255,0.2)' : 'var(--color-border)',
            color: activeTab === 'kegiatan' ? '#ffffff' : 'var(--color-text-main)',
            padding: '0.1rem 0.5rem',
            borderRadius: '99px',
            fontSize: '0.75rem',
            marginLeft: '0.3rem',
          }}>
            {activities.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('analisis')}
          className="btn"
          style={{
            minHeight: '44px',
            background: activeTab === 'analisis' ? 'var(--color-primary)' : 'transparent',
            color: activeTab === 'analisis' ? '#ffffff' : 'var(--color-text-body)',
            fontWeight: 700,
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            borderBottom: activeTab === 'analisis' ? '2px solid var(--color-accent)' : '2px solid transparent',
            marginBottom: '-2px',
          }}
        >
          <TrendingUp size={18} />
          <span>Peta Risiko Yuridis</span>
        </button>
      </div>

      {/* Konten Berdasarkan Tab yang Dipilih */}
      {activeTab === 'permohonan' && (
        <PermohonanTable data={newPermohonan} onDelete={handleDelete} />
      )}

      {activeTab === 'kegiatan' && (
        <KegiatanTable data={activities} onDelete={handleDelete} />
      )}

      {activeTab === 'analisis' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }} className="fade-in">
          {/* Card Grafik Distribusi Risiko */}
          <div className="card">
            <div className="card-header-clean">
              <div className="card-title-clean">
                <ShieldCheck size={20} style={{ color: 'var(--color-primary)' }} />
                <span>Distribusi Tingkat Risiko Kegiatan</span>
              </div>
            </div>

            {pieData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                Belum ada data risiko kegiatan yang dinilai.
              </div>
            ) : (
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#ffffff',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        boxShadow: 'var(--shadow-md)',
                        fontSize: '0.85rem',
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(val) => <span style={{ color: 'var(--color-text-body)', fontWeight: 600, fontSize: '0.82rem' }}>{val}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Card Panduan & Standar Mitigasi Datun */}
          <div className="card" style={{ borderLeft: '4px solid var(--color-accent)' }}>
            <div className="card-header-clean">
              <div className="card-title-clean">
                <ShieldAlert size={20} style={{ color: 'var(--color-accent)' }} />
                <span>Pedoman Penanganan Risiko JPN</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#dc2626', marginTop: '4px', flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#b91c1c' }}>Risiko Tinggi (Deviasi &gt; 10% / Konflik Kontrak):</strong>
                  <p style={{ margin: '2px 0 0', color: 'var(--color-text-muted)' }}>
                    Wajib segera dilakukan rapat koordinasi terpadu bersama instansi pemohon, pengawas, dan pelaksana untuk menerbitkan Surat Saran JPN.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#d97706', marginTop: '4px', flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#b45309' }}>Risiko Sedang (Deviasi 5% – 10% / Kendala Administrasi):</strong>
                  <p style={{ margin: '2px 0 0', color: 'var(--color-text-muted)' }}>
                    Pengawasan rutin uji mutu, verifikasi adendum kontrak, serta kepatuhan batas waktu pencairan termin.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#16a34a', marginTop: '4px', flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#15803d' }}>Risiko Rendah (Deviasi Normal &lt; 5%):</strong>
                  <p style={{ margin: '2px 0 0', color: 'var(--color-text-muted)' }}>
                    Progres fisik dan keuangan seimbang sesuai kontrak kerja, pemantauan berkala via laporan mingguan pemohon.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
