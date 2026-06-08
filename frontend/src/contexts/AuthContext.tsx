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
import { digitsOnly } from '../utils/normalizeDocument';

type AuthContextValue = {
    user: AuthUser | null;
    loading: boolean;
    loginSigl: (username: string, password: string) => Promise<void>;
    loginCamara: (
        email: string,
        password: string,
        tenantCnpj: string,
    ) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function persistSession(accessToken: string, user: AuthUser) {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
}

function loadStoredUser(): AuthUser | null {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
        return JSON.parse(raw) as AuthUser;
    } catch {
        return null;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(loadStoredUser);
    const [loading, setLoading] = useState(
        !!localStorage.getItem('access_token'),
    );

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            setLoading(false);
            return;
        }
        authApi
            .me()
            .then((u) => {
                const stored = loadStoredUser();
                const merged: AuthUser = {
                    ...stored,
                    ...u,
                    authType: stored?.authType ?? u.authType ?? 'sigl',
                };
                setUser(merged);
                localStorage.setItem('user', JSON.stringify(merged));
            })
            .catch(() => {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, []);

    const loginSigl = useCallback(
        async (username: string, password: string) => {
            const res = await authApi.login(username, password);
            persistSession(res.access_token, res.user);
            setUser(res.user);
        },
        [],
    );

    const loginCamara = useCallback(
        async (email: string, password: string, tenantCnpj: string) => {
            const res = await authApi.loginCamara(
                email.trim().toLowerCase(),
                password,
                digitsOnly(tenantCnpj),
            );
            persistSession(res.access_token, res.user);
            setUser(res.user);
        },
        [],
    );

    const logout = useCallback(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setUser(null);
    }, []);

    const value = useMemo(
        () => ({ user, loading, loginSigl, loginCamara, logout }),
        [user, loading, loginSigl, loginCamara, logout],
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth fora de AuthProvider');
    return ctx;
}
