import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, FileText, Key, Settings as SettingsIcon, LogOut, ShieldCheck } from 'lucide-react';
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

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    if (window.confirm('Yakin ingin keluar dari sistem?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="sidebar">
      {/* Logo & Brand */}
      <div style={{ padding: '0.5rem 0 1.25rem', marginBottom: '1rem', borderBottom: '2px solid var(--color-border)', textAlign: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
          <img
            src="/logo.png"
            alt="Logo SIMRISK DATUN"
            style={{
              width: '105px',
              height: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.12))',
              transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          />
          <div>
            <div style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--color-primary-shadow)', letterSpacing: '0.04em', lineHeight: 1.2 }}>
              SIMRISK DATUN
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '3px' }}>
              Kejati NTT
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1 }}>
        <ul className="nav-menu">
          <li>
            <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
              <Home size={20} />
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/register" className={`nav-item ${isActive('/register') ? 'active' : ''}`}>
              <FileText size={20} />
              Registrasi Kegiatan
            </Link>
          </li>
          <li>
            <Link to="/settings" className={`nav-item ${isActive('/settings') ? 'active' : ''}`}>
              <SettingsIcon size={20} />
              Pengaturan AI
            </Link>
          </li>
          <li style={{ marginTop: '2rem' }}>
            <Link to="/portal/demo123" className={`nav-item ${isActive('/portal/demo123') ? 'active' : ''}`}>
              <Key size={20} />
              Demo Link Pemohon
            </Link>
          </li>
        </ul>
      </nav>

      {/* Admin Info & Logout */}
      <div className="sidebar-admin-footer">
        <div className="sidebar-admin-info">
          <div className="sidebar-admin-avatar">
            <ShieldCheck size={18} color="white" />
          </div>
          <div>
            <div className="sidebar-admin-name">{user?.username || 'Admin'}</div>
            <div className="sidebar-admin-role">Administrator</div>
          </div>
        </div>
        <button
          className="sidebar-logout-btn"
          onClick={handleLogout}
          title="Keluar dari sistem"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}

function InternalLayout() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<InternalDashboard />} />
          <Route path="/register" element={<RiskRegisterForm />} />
          <Route path="/permohonan/:id" element={<DetailPermohonan />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
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
