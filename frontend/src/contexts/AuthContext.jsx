import React, { createContext, useContext, useEffect, useState } from 'react';
import { API_BASE } from '../utils';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    let active = true;
    const check = async () => {
      try {
        const response = await fetch(API_BASE + '/auth/session');
        const result = await response.json();
        if (active) setAuthenticated(response.ok && result.role === 'admin');
      } finally { if (active) setChecking(false); }
    };
    check().catch(() => { if (active) setChecking(false); });
    const expired = () => { sessionStorage.removeItem('hr_token'); setAuthenticated(false); };
    window.addEventListener('hr-session-expired', expired);
    return () => { active = false; window.removeEventListener('hr-session-expired', expired); };
  }, []);
  const login = async password => {
    const response = await fetch(API_BASE + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.error || 'Accesso non riuscito');
    sessionStorage.setItem('hr_token', result.token);
    setAuthenticated(true);
  };
  const logout = async () => {
    try { await fetch(API_BASE + '/auth/logout', { method: 'POST' }); }
    finally { sessionStorage.removeItem('hr_token'); setAuthenticated(false); }
  };
  return <AuthContext.Provider value={{ authenticated, checking, login, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
