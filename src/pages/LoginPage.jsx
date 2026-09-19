import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, User, Lock, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ============================================================
// LoginPage — Halaman Login Admin SIMRISK DATUN
// ============================================================

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect ke halaman sebelumnya, atau ke dashboard
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Username dan password tidak boleh kosong.');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(username, password);
      if (success) {
        navigate(from, { replace: true });
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= 3) {
          setError(`Kredensial salah. Anda telah gagal ${newAttempts} kali. Periksa kembali username dan password.`);
        } else {
          setError('Username atau password salah. Silakan coba lagi.');
        }
        // Shake effect on error
        const form = document.getElementById('login-form');
        form?.classList.add('shake');
        setTimeout(() => form?.classList.remove('shake'), 500);
      }
    } catch (err) {
      setError('Terjadi kesalahan sistem. Silakan refresh halaman.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Decorative background elements */}
      <div className="login-bg-decoration">
        <div className="login-bg-circle login-bg-circle-1" />
        <div className="login-bg-circle login-bg-circle-2" />
        <div className="login-bg-circle login-bg-circle-3" />
      </div>

      <div className="login-container">
        {/* Logo & Header */}
        <div className="login-header">
          <div className="login-logo-wrapper">
            <img
              src="/logo.png"
              alt="Logo SIMRISK DATUN"
              className="login-logo-img"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="login-shield-icon">
              <Shield size={28} color="white" strokeWidth={2.5} />
            </div>
          </div>
          <div className="login-title-group">
            <h1 className="login-title">SIMRISK DATUN</h1>
            <p className="login-subtitle">Sistem Manajemen Risiko Datun<br />Kejaksaan Tinggi Nusa Tenggara Timur</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="login-card" id="login-form">
          <div className="login-card-header">
            <div className="login-admin-badge">
              <Shield size={14} />
              AKSES ADMIN
            </div>
            <h2 className="login-card-title">Masuk ke Sistem</h2>
            <p className="login-card-desc">Masukkan kredensial administrator Anda untuk melanjutkan</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form" autoComplete="off">
            {/* Error Message */}
            {error && (
              <div className="login-error" role="alert">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Username Field */}
            <div className="login-field">
              <label className="login-label" htmlFor="login-username">
                <User size={15} />
                Username
              </label>
              <div className="login-input-wrapper">
                <input
                  id="login-username"
                  type="text"
                  className={`login-input ${error ? 'login-input-error' : ''}`}
                  placeholder="Masukkan username admin"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(''); }}
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="login-field">
              <label className="login-label" htmlFor="login-password">
                <Lock size={15} />
                Password
              </label>
              <div className="login-input-wrapper" style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`login-input ${error ? 'login-input-error' : ''}`}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  disabled={isLoading}
                  autoComplete="current-password"
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="login-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="login-spinner" />
                  Memverifikasi...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Masuk ke Sistem
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="login-footer">
          &copy; {new Date().getFullYear()} Kejaksaan Tinggi NTT — Sistem ini hanya dapat diakses oleh personel yang berwenang.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
