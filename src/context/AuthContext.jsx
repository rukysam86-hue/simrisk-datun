import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isAuthenticated, getSession, login as authLogin, logout as authLogout } from '../lib/auth';

// ============================================================
// AuthContext — Global authentication state untuk SIMRISK DATUN
// ============================================================

const AuthContext = createContext(null);

/**
 * Provider yang membungkus seluruh aplikasi.
 * Menyediakan state autentikasi dan fungsi login/logout.
 */
export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Saat pertama load, cek apakah ada sesi yang masih aktif
  useEffect(() => {
    const auth = isAuthenticated();
    if (auth) {
      const session = getSession();
      setIsLoggedIn(true);
      setUser(session);
    }
    setIsInitializing(false);
  }, []);

  const login = useCallback(async (username, password) => {
    const success = await authLogin(username, password);
    if (success) {
      const session = getSession();
      setIsLoggedIn(true);
      setUser(session);
    }
    return success;
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setIsLoggedIn(false);
    setUser(null);
  }, []);

  const value = {
    isLoggedIn,
    user,
    isInitializing,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook untuk mengakses AuthContext dari komponen manapun.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
