import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, FileText, Key, Settings as SettingsIcon } from 'lucide-react';
import './index.css';

// Placeholder Pages
import InternalDashboard from './pages/InternalDashboard';
import RiskRegisterForm from './pages/RiskRegisterForm';
import PemohonPortal from './pages/PemohonPortal';
import DetailPermohonan from './pages/DetailPermohonan';
import Settings from './pages/Settings';

function Sidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar">
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
      
      <nav>
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
          <li style={{marginTop: '2rem'}}>
            <Link to="/portal/demo123" className={`nav-item ${isActive('/portal/demo123') ? 'active' : ''}`}>
              <Key size={20} />
              Demo Link Pemohon
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Secure Portal Route (No Sidebar) */}
        <Route path="/portal/:linkId" element={<PemohonPortal />} />
        
        {/* Internal Routes (With Sidebar) */}
        <Route path="*" element={
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
        } />
      </Routes>
    </Router>
  );
}

export default App;
