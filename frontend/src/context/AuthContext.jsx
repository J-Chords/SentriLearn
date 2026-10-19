// =============================================
// AUTH CONTEXT — real backend-authenticated session
//
// On mount: establish a CSRF token, then check whether a session
// cookie from a previous visit is still valid (GET /me). No demo
// role-switching exists here — role comes only from the server.
// =============================================
import { createContext, useContext, useEffect, useState } from 'react';
import { initCsrf } from '../services/api.service.js';
import { AuthService } from '../services/auth.service.js';

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        await initCsrf();
        const res = await AuthService.me();
        setUser(res.data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password, rememberMe) => {
    const loggedInUser = await AuthService.login(email, password, rememberMe);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } finally {
      setUser(null);
      await initCsrf(); // re-establish an anonymous CSRF token for the login page
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
