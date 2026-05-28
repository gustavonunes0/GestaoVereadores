import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi, type AuthUser } from '../api/client';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  });
  const [loading, setLoading] = useState(!!localStorage.getItem('access_token'));

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((u) => {
        setUser(u);
        localStorage.setItem('user', JSON.stringify(u));
      })
      .catch(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await authApi.login(username, password);
    localStorage.setItem('access_token', res.access_token);
    localStorage.setItem('user', JSON.stringify(res.user));
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth fora de AuthProvider');
  return ctx;
}
