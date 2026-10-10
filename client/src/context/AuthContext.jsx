import { useCallback, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/api.js';
import { AuthContext } from './authContextValue.js';


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, ask the server who we are. The cookie is invisible to JS,
  // so this call is the only way to know if a session exists.
  useEffect(() => {
    let active = true;
    authService
      .me()
      .then((res) => active && setUser(res.data.user))
      .catch(() => active && setUser(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials);
    setUser(res.data.user);
  }, []);

  const register = useCallback(async (data) => {
    const res = await authService.register(data);
    setUser(res.data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

