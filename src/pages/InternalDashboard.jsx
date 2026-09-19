import { useState, useEffect, useMemo } from 'react';
import { ShieldAlert, CheckCircle, FileText, Trash2, AlertTriangle, AlertCircle, ShieldCheck, Search, ChevronLeft, ChevronRight, Link as LinkIcon, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllPermohonan, deletePermohonan } from '../data/store';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// ─── Konstanta ───────────────────────────────────────────────
const STEP_LABELS = {
  1: { label: 'DITERIMA',       bg: '#e0f0ff', color: '#0055cc', border: '#99c2ff' },
  2: { label: 'MENUNGGU SP-1',  bg: '#fff5cc', color: '#a07800', border: '#ffe066' },
  3: { label: 'MENUNGGU TELAAH',bg: '#fff0e5', color: '#b84d00', border: '#ffb380' },
  4: { label: 'MENUNGGU SP-2',  bg: '#f3e5ff', color: '#6d00cc', border: '#c680ff' },
};

const PAGE_SIZE_OPTIONS = [5, 10, 20];

// ─── Komponen Badge Status ────────────────────────────────────
function StatusBadge({ step }) {
  const s = STEP_LABELS[step] || { label: `STEP ${step}`, bg: '#f0f0f0', color: '#555', border: '#ccc' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '0.3rem 0.75rem',
      borderRadius: '99px',
      fontSize: '0.72rem',
      fontWeight: 800,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      background: s.bg,
      color: s.color,
      border: `2px solid ${s.border}`,
      whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  );
}

// ─── Komponen Pagination ─────────────────────────────────────
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
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.9rem 1.25rem',
      borderTop: '2px solid var(--color-border)',
      backgroundColor: '#fafafa',
      flexWrap: 'wrap',
      gap: '0.75rem',
    }}>
      {/* Info & Page Size */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
          Menampilkan <strong style={{ color: 'var(--color-text-main)' }}>{from}–{to}</strong> dari <strong style={{ color: 'var(--color-text-main)' }}>{totalItems}</strong> data
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Per halaman:</span>
          <select
            value={pageSize}
            onChange={e => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
            style={{
              padding: '0.25rem 0.5rem', fontSize: '0.82rem', fontWeight: 700,
              border: '2px solid var(--color-border)', borderRadius: '6px',
              background: 'white', color: 'var(--color-text-main)', cursor: 'pointer',
            }}
          >
            {PAGE_SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Page Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '32px', height: '32px', border: '2px solid var(--color-border)',
            borderRadius: '8px', background: 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 1 ? 0.4 : 1, transition: 'all 0.15s',
          }}
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} style={{ padding: '0 0.25rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              style={{
                width: '32px', height: '32px', border: '2px solid',
                borderRadius: '8px', cursor: 'pointer', fontWeight: 800, fontSize: '0.82rem',
                transition: 'all 0.15s',
                borderColor: p === currentPage ? 'var(--color-secondary)' : 'var(--color-border)',
                background:  p === currentPage ? '#ddf4ff' : 'white',
                color:       p === currentPage ? 'var(--color-secondary-shadow)' : 'var(--color-text-main)',
              }}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '32px', height: '32px', border: '2px solid var(--color-border)',
            borderRadius: '8px', background: 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage === totalPages ? 0.4 : 1, transition: 'all 0.15s',
          }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ─── Komponen Tabel Permohonan ───────────────────────────────
function PermohonanTable({ data, onDelete }) {
  const [search, setSearch]         = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize]     = useState(5);

  // Filter berdasarkan pencarian
  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(p =>
      p.suratData?.asalSurat?.toLowerCase().includes(q)  ||
      p.suratData?.perihal?.toLowerCase().includes(q)    ||
      p.suratData?.nomorSurat?.toLowerCase().includes(q)
    );
  }, [data, search]);

  // Reset ke halaman 1 saat pencarian berubah
  useEffect(() => { setCurrentPage(1); }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem', border: '2px solid var(--color-secondary-shadow)' }}>

      {/* Header */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '2px solid var(--color-border)',
        backgroundColor: '#ddf4ff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '0.75rem',
      }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--color-secondary-shadow)', fontSize: '1.15rem' }}>
            Permohonan Pendampingan
            <span style={{
              marginLeft: '0.6rem', display: 'inline-flex', alignItems: 'center',
              background: 'var(--color-secondary)', color: 'white',
              borderRadius: '99px', padding: '0.1rem 0.6rem',
              fontSize: '0.8rem', fontWeight: 800, verticalAlign: 'middle',
            }}>
              Dalam Proses
            </span>
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: 'var(--color-secondary-shadow)', fontWeight: 700, opacity: 0.75 }}>
            {data.length} permohonan sedang berjalan
          </p>
        </div>

        {/* Search bar */}
        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={16} style={{
            position: 'absolute', left: '0.75rem', top: '50%',
            transform: 'translateY(-50%)', color: 'var(--color-text-muted)',
            pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Cari instansi, perihal, nomor surat..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', paddingLeft: '2.25rem', paddingRight: search ? '2.25rem' : '0.9rem',
              paddingTop: '0.55rem', paddingBottom: '0.55rem',
              border: '2px solid rgba(28,176,246,0.3)', borderRadius: '10px',
              fontSize: '0.875rem', fontWeight: 600,
              background: 'white', color: 'var(--color-text-main)',
              outline: 'none', transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--color-secondary)'}
            onBlur={e => e.target.style.borderColor = 'rgba(28,176,246,0.3)'}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute', right: '0.6rem', top: '50%',
                transform: 'translateY(-50%)', background: 'none', border: 'none',
                cursor: 'pointer', color: 'var(--color-text-muted)',
                display: 'flex', alignItems: 'center', padding: '2px',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="table" style={{ minWidth: '600px' }}>
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>#</th>
              <th>Instansi Pemohon</th>
              <th>Nomor & Perihal Surat</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <Search size={32} color="var(--color-text-muted)" strokeWidth={1.5} />
                    <span style={{ color: 'var(--color-text-muted)', fontWeight: 700, fontSize: '0.9rem' }}>
                      {search ? `Tidak ada hasil untuk "${search}"` : 'Tidak ada permohonan dalam proses.'}
                    </span>
                    {search && (
                      <button onClick={() => setSearch('')} style={{
                        marginTop: '0.25rem', background: 'none', border: 'none',
                        color: 'var(--color-secondary)', fontWeight: 700, cursor: 'pointer',
                        fontSize: '0.85rem', textDecoration: 'underline',
                      }}>
                        Hapus pencarian
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((act, idx) => (
                <tr key={act.id} style={{ transition: 'background 0.15s' }}>
                  {/* Nomor urut */}
                  <td style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontWeight: 800, fontSize: '0.85rem' }}>
                    {(currentPage - 1) * pageSize + idx + 1}
                  </td>

                  {/* Instansi */}
                  <td>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#1a2332' }}>
                      {act.suratData?.asalSurat || '-'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700, marginTop: '2px' }}>
                      {act.suratData?.tanggalSurat
                        ? new Date(act.suratData.tanggalSurat).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                        : '-'}
                    </div>
                  </td>

                  {/* Nomor & Perihal */}
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-main)', marginBottom: '2px' }}>
                      {act.suratData?.perihal || '-'}
                    </div>
                    {act.suratData?.nomorSurat && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 700, fontFamily: 'monospace' }}>
                        {act.suratData.nomorSurat}
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td style={{ textAlign: 'center' }}>
                    <StatusBadge step={act.currentStep} />
                  </td>

                  {/* Aksi */}
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                      <Link
                        to={`/permohonan/${act.id}`}
                        className="btn btn-secondary"
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', borderRadius: '8px' }}
                      >
                        Detail
                      </Link>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '0.45rem 0.6rem', borderRadius: '8px', color: 'var(--color-danger-shadow)', borderColor: 'var(--color-danger-shadow)' }}
                        onClick={() => onDelete(act.id)}
                        title="Hapus Data"
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

// ─── Komponen Badge Risiko ───────────────────────────────────
const RISK_CONFIG = {
  high:   { label: 'Risiko Tinggi',  bg: '#ffe2e2', color: '#ea2b2b', border: '#ffb3b3', dot: '#ff4b4b' },
  medium: { label: 'Risiko Sedang',  bg: '#fff5cc', color: '#a07800', border: '#ffe066', dot: '#ffc800' },
  low:    { label: 'Risiko Rendah',  bg: '#e5f9d6', color: '#58a700', border: '#bce699', dot: '#58cc02' },
};

function RiskBadge({ risk }) {
  if (!risk) return <span style={{ color: 'var(--color-text-muted)', fontWeight: 700, fontSize: '0.82rem' }}>—</span>;
  const r = RISK_CONFIG[risk] || { label: risk, bg: '#f0f0f0', color: '#555', border: '#ccc', dot: '#aaa' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
      padding: '0.28rem 0.7rem',
      borderRadius: '99px',
      fontSize: '0.72rem', fontWeight: 800,
      letterSpacing: '0.06em', textTransform: 'uppercase',
      background: r.bg, color: r.color, border: `2px solid ${r.border}`,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: r.dot, flexShrink: 0 }} />
      {r.label}
    </span>
  );
}

// ─── Komponen Progress Bar ────────────────────────────────────
function ProgressBar({ value }) {
  const pct = parseInt(value) || 0;
  const color = pct >= 80 ? '#58cc02' : pct >= 40 ? '#ffc800' : '#1cb0f6';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{
        flex: 1, height: '8px',
        background: '#efefef', borderRadius: '99px',
        overflow: 'hidden', minWidth: '60px',
      }}>
        <div style={{
          width: `${Math.min(pct, 100)}%`, height: '100%',
          background: color, borderRadius: '99px',
          transition: 'width 0.4s ease',
        }} />
      </div>
      <span style={{ fontWeight: 800, fontSize: '0.82rem', minWidth: '36px', color: color }}>
        {value || '0%'}
      </span>
    </div>
  );
}

// ─── Tabel Kegiatan Aktif ─────────────────────────────────────
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
      p.monitoring?.keterangan?.toLowerCase().includes(q)
    );
  }, [data, search]);

  useEffect(() => { setCurrentPage(1); }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

      {/* Header */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '2px solid var(--color-border)',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #e5f9d6 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '0.75rem',
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--color-primary-shadow)' }}>
            Daftar Kegiatan Aktif
            <span style={{
              marginLeft: '0.6rem', display: 'inline-flex', alignItems: 'center',
              background: 'var(--color-primary)', color: 'white',
              borderRadius: '99px', padding: '0.1rem 0.6rem',
              fontSize: '0.8rem', fontWeight: 800, verticalAlign: 'middle',
            }}>
              Berlangsung
            </span>
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: 'var(--color-primary-shadow)', fontWeight: 700, opacity: 0.75 }}>
            {data.length} kegiatan sedang didampingi
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={16} style={{
            position: 'absolute', left: '0.75rem', top: '50%',
            transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Cari kegiatan, instansi, keterangan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', paddingLeft: '2.25rem', paddingRight: search ? '2.25rem' : '0.9rem',
              paddingTop: '0.55rem', paddingBottom: '0.55rem',
              border: '2px solid rgba(88,167,0,0.3)', borderRadius: '10px',
              fontSize: '0.875rem', fontWeight: 600,
              background: 'white', color: 'var(--color-text-main)',
              outline: 'none', transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
            onBlur={e => e.target.style.borderColor = 'rgba(88,167,0,0.3)'}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute', right: '0.6rem', top: '50%',
                transform: 'translateY(-50%)', background: 'none', border: 'none',
                cursor: 'pointer', color: 'var(--color-text-muted)',
                display: 'flex', alignItems: 'center', padding: '2px',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="table" style={{ minWidth: '780px' }}>
          <thead>
            <tr>
              <th style={{ width: '36px', textAlign: 'center' }}>#</th>
              <th>Instansi & Kegiatan</th>
              <th style={{ textAlign: 'center' }}>Risiko</th>
              <th>Nilai Anggaran</th>
              <th>Progres</th>
              <th>Keterangan</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <Search size={32} color="var(--color-text-muted)" strokeWidth={1.5} />
                    <span style={{ color: 'var(--color-text-muted)', fontWeight: 700, fontSize: '0.9rem' }}>
                      {search ? `Tidak ada hasil untuk "${search}"` : 'Tidak ada kegiatan aktif.'}
                    </span>
                    {search && (
                      <button onClick={() => setSearch('')} style={{
                        marginTop: '0.25rem', background: 'none', border: 'none',
                        color: 'var(--color-primary)', fontWeight: 700, cursor: 'pointer',
                        fontSize: '0.85rem', textDecoration: 'underline',
                      }}>
                        Hapus pencarian
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((act, idx) => (
                <tr key={act.id}>
                  {/* No */}
                  <td style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontWeight: 800, fontSize: '0.85rem' }}>
                    {(currentPage - 1) * pageSize + idx + 1}
                  </td>

                  {/* Instansi & Perihal */}
                  <td>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1a2332', marginBottom: '2px' }}>
                      {act.suratData?.perihal || '-'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>
                      {act.suratData?.asalSurat || '-'}
                    </div>
                  </td>

                  {/* Badge Risiko */}
                  <td style={{ textAlign: 'center' }}>
                    <RiskBadge risk={act.monitoring?.risk} />
                  </td>

                  {/* Nilai Anggaran */}
                  <td>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1a2332', whiteSpace: 'nowrap' }}>
                      {act.monitoring?.nilai
                        ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(act.monitoring.nilai)
                        : <span style={{ color: 'var(--color-text-muted)', fontWeight: 700 }}>—</span>}
                    </div>
                  </td>

                  {/* Progres */}
                  <td style={{ minWidth: '140px' }}>
                    <ProgressBar value={act.monitoring?.persentaseKegiatan} />
                    {act.monitoring?.progressKegiatan && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                        {act.monitoring.progressKegiatan}
                      </div>
                    )}
                  </td>

                  {/* Keterangan & Update */}
                  <td style={{ maxWidth: '200px' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-main)', marginBottom: '3px', lineHeight: 1.4 }}>
                      {act.monitoring?.keterangan || <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
                    </div>
                    {act.monitoring?.lastUpdate && (
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        fontSize: '0.72rem', fontWeight: 700,
                        color: 'var(--color-text-muted)',
                        background: '#f5f5f5', borderRadius: '6px',
                        padding: '0.15rem 0.45rem',
                      }}>
                        ⏱ {act.monitoring.lastUpdate}
                      </div>
                    )}
                  </td>

                  {/* Aksi */}
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '0.45rem 0.6rem', borderRadius: '8px' }}
                        title="Salin Link Akses Pemohon"
                        onClick={() => {
                          const url = `${window.location.origin}/portal/${act.id}`;
                          navigator.clipboard.writeText(`Akses Link: ${url}\nPassword: ${act.id}`);
                          alert('Link dan password akses pemohon disalin ke clipboard!');
                        }}
                      >
                        <LinkIcon size={15} />
                      </button>
                      <Link
                        to={`/permohonan/${act.id}`}
                        className="btn btn-secondary"
                        style={{ padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem' }}
                      >
                        Detail
                      </Link>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '0.45rem 0.6rem', borderRadius: '8px', color: 'var(--color-danger-shadow)', borderColor: 'var(--color-danger-shadow)' }}
                        onClick={() => onDelete(act.id)}
                        title="Hapus Data"
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
function InternalDashboard() {
  const [permohonanList, setPermohonanList] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const data = await getAllPermohonan();
    setPermohonanList(data || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus data ini secara permanen?')) {
      await deletePermohonan(id);
      loadData();
    }
  };

  const activities    = permohonanList.filter(p => p.currentStep === 5 && p.telaahData?.dapatDidampingi === 'ya');
  const newPermohonan = permohonanList.filter(p => p.currentStep < 5);

  const highRiskCount   = activities.filter(a => a.monitoring?.risk === 'high').length;
  const mediumRiskCount = activities.filter(a => a.monitoring?.risk === 'medium').length;
  const lowRiskCount    = activities.filter(a => a.monitoring?.risk === 'low').length;
  const otherCount      = permohonanList.length - (highRiskCount + mediumRiskCount + lowRiskCount);

  const pieData = [
    { name: 'Risiko Tinggi',          value: highRiskCount,   color: '#ea2b2b' },
    { name: 'Risiko Sedang',          value: mediumRiskCount, color: '#e5b400' },
    { name: 'Risiko Rendah',          value: lowRiskCount,    color: '#58a700' },
    { name: 'Belum Dinilai / Lainnya',value: otherCount,      color: '#afafaf' },
  ].filter(d => d.value > 0);

  return (
    <div>
      {/* Page Header */}
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

      {/* Stat Cards Row 1 */}
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

      {/* Stat Cards Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '2px solid #ffb3b3' }}>
          <div style={{ background: '#ffe2e2', padding: '1rem', borderRadius: '16px', color: 'var(--color-danger-shadow)' }}>
            <AlertTriangle size={32} />
          </div>
          <div>
            <h3 style={{ marginBottom: 0, fontSize: '2rem', color: 'var(--color-danger-shadow)' }}>{highRiskCount}</h3>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-text-muted)' }}>Proyek Risiko Tinggi</p>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '2px solid #ffe599' }}>
          <div style={{ background: '#fff5cc', padding: '1rem', borderRadius: '16px', color: '#d4ac0d' }}>
            <AlertCircle size={32} />
          </div>
          <div>
            <h3 style={{ marginBottom: 0, fontSize: '2rem', color: '#d4ac0d' }}>{mediumRiskCount}</h3>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-text-muted)' }}>Proyek Risiko Sedang</p>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '2px solid #bce699' }}>
          <div style={{ background: '#e5f9d6', padding: '1rem', borderRadius: '16px', color: 'var(--color-primary-shadow)' }}>
            <ShieldCheck size={32} />
          </div>
          <div>
            <h3 style={{ marginBottom: 0, fontSize: '2rem', color: 'var(--color-primary-shadow)' }}>{lowRiskCount}</h3>
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-text-muted)' }}>Proyek Risiko Rendah</p>
          </div>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Distribusi Risiko Permohonan</h2>
        <div style={{ height: '350px', width: '100%', maxWidth: '600px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%" cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, 'Total Permohonan']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Tabel Permohonan Dalam Proses (dengan Search + Pagination) ── */}
      <PermohonanTable data={newPermohonan} onDelete={handleDelete} />

      {/* ── Tabel Kegiatan Aktif ── */}
      <KegiatanTable data={activities} onDelete={handleDelete} />
    </div>
  );
}

export default InternalDashboard;
