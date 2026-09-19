import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ============================================================
// ProtectedRoute — Route Guard untuk halaman internal admin
// Redirect ke /login jika belum terautentikasi
// ============================================================

function ProtectedRoute({ children }) {
  const { isLoggedIn, isInitializing } = useAuth();
  const location = useLocation();

  // Tampilkan blank screen saat mengecek sesi awal
  // (hindari flash redirect sebelum sessionStorage dicek)
  if (isInitializing) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'var(--color-background)',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid var(--color-border)',
          borderTop: '4px solid var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  if (!isLoggedIn) {
    // Simpan lokasi yang ingin diakses agar bisa redirect setelah login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
