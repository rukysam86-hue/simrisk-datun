import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, FileText, AlertTriangle, Key, Settings as SettingsIcon } from 'lucide-react';
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
      <div style={{ padding: '1rem 0', marginBottom: '1rem' }}>
        <h2 style={{ color: 'var(--color-primary-shadow)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle />
          SIMRISK DATUN
        </h2>
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
