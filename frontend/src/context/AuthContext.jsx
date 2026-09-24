// =============================================
// DEMO AUTH CONTEXT — FRONTEND-ONLY ROLE SYSTEM
//
// There is no real authentication backend. Signing in simply
// stores a demo profile (Learner or Administrator) so the UI
// can demonstrate both role-based views.
// =============================================
import { createContext, useContext, useState } from 'react';
import { DEMO_USERS } from '../data/demoUsers.js';
import { STORAGE_KEYS, readStorage, writeStorage, removeStorage } from '../utils/storage.js';
import { seedDefaults } from '../utils/progressStore.js';

const AuthContext = createContext({
  user: null,
  loginAs: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStorage(STORAGE_KEYS.AUTH, null));

  const loginAs = (role) => {
    const profile = DEMO_USERS[role];
    if (!profile) return;
    seedDefaults();
    writeStorage(STORAGE_KEYS.AUTH, profile);
    setUser(profile);
  };

  const logout = () => {
    removeStorage(STORAGE_KEYS.AUTH);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
