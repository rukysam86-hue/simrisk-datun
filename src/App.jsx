import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FilePlus2,
  Users2,
  Settings as SettingsIcon,
  LogOut,
  ShieldCheck,
  ExternalLink,
  Menu,
  X,
  Calendar,
  Building2,
  FolderOpen,
  ChevronDown,
  Lock
} from 'lucide-react';
import './index.css';

// Auth
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import InternalDashboard from './pages/InternalDashboard';
import RiskRegisterForm from './pages/RiskRegisterForm';
import PemohonPortal from './pages/PemohonPortal';
import DetailPermohonan from './pages/DetailPermohonan';
import Settings from './pages/Settings';
import LoginPage from './pages/LoginPage';
import DaftarJpnPage from './pages/DaftarJpnPage';

// Daftar Resmi Satuan Kerja Kejaksaan se-Wilayah NTT
const SATUAN_KERJA_NTT = [
  { id: 'kejati', nama: 'Kejaksaan Tinggi NTT', tipe: 'Kantor Utama' },
  { id: 'kejari-kota-kupang', nama: 'Kejari Kota Kupang', tipe: 'Kejari' },
  { id: 'kejari-kab-kupang', nama: 'Kejari Kabupaten Kupang', tipe: 'Kejari' },
  { id: 'kejari-tts', nama: 'Kejari Timor Tengah Selatan', tipe: 'Kejari' },
  { id: 'kejari-ttu', nama: 'Kejari Timor Tengah Utara', tipe: 'Kejari' },
  { id: 'kejari-belu', nama: 'Kejari Belu (Atambua)', tipe: 'Kejari' },
  { id: 'kejari-malaka', nama: 'Kejari Malaka', tipe: 'Kejari' },
  { id: 'kejari-alor', nama: 'Kejari Alor (Kalabahi)', tipe: 'Kejari' },
  { id: 'kejari-flotim', nama: 'Kejari Flores Timur', tipe: 'Kejari' },
  { id: 'kejari-sikka', nama: 'Kejari Sikka (Maumere)', tipe: 'Kejari' },
  { id: 'kejari-ende', nama: 'Kejari Ende', tipe: 'Kejari' },
  { id: 'kejari-ngada', nama: 'Kejari Ngada (Bajawa)', tipe: 'Kejari' },
  { id: 'kejari-nagekeo', nama: 'Kejari Nagekeo', tipe: 'Kejari' },
  { id: 'kejari-manggarai', nama: 'Kejari Manggarai (Ruteng)', tipe: 'Kejari' },
  { id: 'kejari-mabar', nama: 'Kejari Manggarai Barat', tipe: 'Kejari' },
  { id: 'kejari-matim', nama: 'Kejari Manggarai Timur', tipe: 'Kejari' },
  { id: 'kejari-sumba-timur', nama: 'Kejari Sumba Timur', tipe: 'Kejari' },
  { id: 'kejari-sumba-barat', nama: 'Kejari Sumba Barat', tipe: 'Kejari' },
  { id: 'kejari-sbd', nama: 'Kejari Sumba Barat Daya', tipe: 'Kejari' },
  { id: 'kejari-rote-ndao', nama: 'Kejari Rote Ndao', tipe: 'Kejari' },
  { id: 'kejari-sabu-raijua', nama: 'Kejari Sabu Raijua', tipe: 'Kejari' },
  { id: 'cabjari-waiwerang', nama: 'Cabjari Waiwerang', tipe: 'Cabjari' },
];

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isSatkerOpen, setIsSatkerOpen] = useState(false);
  const isActive = (path) => location.pathname === path;

  // Tutup sidebar otomatis saat rute berpindah di layar mobile
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  const handleLogout = () => {
    if (window.confirm('Yakin ingin keluar dari sistem SIMRISK DATUN?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className={`mobile-backdrop ${isOpen ? 'active' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        {/* Tombol Tutup Khusus Mobile */}
        <div className="sidebar-mobile-close">
          <button
            onClick={onClose}
            className="mobile-close-btn"
            title="Tutup Menu"
            aria-label="Tutup Menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Logo & Brand Kejaksaan */}
        <div className="sidebar-brand">
          <Link to="/" className="sidebar-brand-link" title="Beranda SIMRISK DATUN">
            <img
              src="/logo.png"
              alt="Logo Resmi SIMRISK DATUN Kejaksaan RI"
              className="sidebar-logo-img"
            />
            <div>
              <div className="sidebar-brand-title">SIMRISK DATUN</div>
              <div className="sidebar-brand-badge">KEJATI NUSA TENGGARA TIMUR</div>
            </div>
          </Link>
        </div>

        {/* Navigasi Utama */}
        <nav style={{ flex: 1 }}>
          <ul className="nav-menu">
            <li className="nav-category-title">Menu Utama</li>
            <li>
              <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/register" className={`nav-item ${isActive('/register') ? 'active' : ''}`}>
                <FilePlus2 size={20} />
                <span>Registrasi Kegiatan</span>
              </Link>
            </li>
            <li>
              <Link to="/jpn" className={`nav-item ${isActive('/jpn') ? 'active' : ''}`}>
                <Users2 size={20} />
                <span>Daftar Jaksa JPN</span>
              </Link>
            </li>
            <li>
              <button
                type="button"
                className={`nav-dropdown-btn ${isSatkerOpen ? 'open' : ''}`}
                onClick={() => setIsSatkerOpen(prev => !prev)}
                aria-expanded={isSatkerOpen}
                title="Daftar Satuan Kerja Kejati & Kejari se-NTT"
              >
                <Building2 size={20} className="nav-icon" />
                <span style={{ flex: 1 }}>Satuan Kerja</span>
                <ChevronDown
                  size={16}
                  style={{
                    color: 'var(--sidebar-text-muted)',
                    transition: 'transform 0.2s ease',
                    transform: isSatkerOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}
                />
              </button>

              {isSatkerOpen && (
                <div className="satker-dropdown-menu">
                  <div className="satker-header-note">
                    <span>Wilayah Hukum NTT ({SATUAN_KERJA_NTT.length})</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#38bdf8' }}>
                      <Lock size={11} /> Akses Terbatas
                    </span>
                  </div>
                  {SATUAN_KERJA_NTT.map((satker) => (
                    <button
                      key={satker.id}
                      type="button"
                      disabled
                      className="satker-item-disabled"
                      title={`${satker.nama} (${satker.tipe}) — Akses dibatasi untuk akun Kejati NTT`}
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', paddingRight: '0.4rem' }}>
                        {satker.nama}
                      </span>
                      <span className="satker-badge-locked">
                        <Lock size={9} /> Disabled
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </li>
            <li>
              <Link to="/settings" className={`nav-item ${isActive('/settings') ? 'active' : ''}`}>
                <SettingsIcon size={20} />
                <span>Pengaturan AI & Cloud</span>
              </Link>
            </li>

            <li className="nav-category-title" style={{ marginTop: '1.25rem' }}>Simulasi Portal</li>
            <li>
              <Link
                to="/portal/demo123"
                className={`nav-item ${isActive('/portal/demo123') ? 'active' : ''}`}
                style={{ borderStyle: 'dashed', borderColor: 'rgba(234, 179, 8, 0.4)' }}
              >
                <ExternalLink size={18} style={{ color: '#facc15' }} />
                <span>Portal Pemohon (Demo)</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Informasi Akun Admin & Logout */}
        <div className="sidebar-admin-footer">
          <div className="sidebar-admin-info">
            <div className="sidebar-admin-avatar">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="sidebar-admin-name">{user?.username || 'Admin Datun'}</div>
              <div className="sidebar-admin-role">Administrator</div>
            </div>
          </div>
          <button
            className="sidebar-logout-btn"
            onClick={handleLogout}
            title="Keluar dari sistem"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}

function TopNavbar({ onToggleMobileMenu }) {
  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="top-navbar">
      <div className="top-navbar-left">
        <button
          className="mobile-menu-toggle"
          onClick={onToggleMobileMenu}
          aria-label="Buka Menu Navigasi"
        >
          <Menu size={22} />
        </button>

        <div className="navbar-agency-info">
          <div className="navbar-agency-name">Kejaksaan Tinggi Nusa Tenggara Timur</div>
          <div className="navbar-agency-sub">Bidang Perdata dan Tata Usaha Negara • Sistem Manajemen Risiko</div>
        </div>
      </div>

      <div className="top-navbar-right">
        {/* Tanggal Hari Ini */}
        <div className="navbar-date-pill">
          <Calendar size={15} style={{ color: 'var(--color-primary)' }} />
          <span>{currentDate}</span>
        </div>

        {/* Status Sistem */}
        <div className="navbar-live-status">
          <span className="status-dot-pulse" />
          <span>Sistem Online</span>
        </div>
      </div>
    </header>
  );
}

function InternalLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="app-container">
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="main-layout-wrapper">
        <TopNavbar onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<InternalDashboard />} />
            <Route path="/register" element={<RiskRegisterForm />} />
            <Route path="/permohonan/:id" element={<DetailPermohonan />} />
            <Route path="/jpn" element={<DaftarJpnPage />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes — tidak perlu login */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/portal/:linkId" element={<PemohonPortal />} />

          {/* Protected Routes — hanya untuk admin yang sudah login */}
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <InternalLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
