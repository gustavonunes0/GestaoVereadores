import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { authApi } from '../api/client';
import type { AuthUser } from '../types/auth';

interface AuthContextValue {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login(cpf: string, password: string): Promise<void>;
    logout(): void;
    isAdminStaff: boolean;
    isStaff: boolean;
    isParliamentarian: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

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
    const [isLoading, setIsLoading] = useState(
        !!localStorage.getItem('access_token'),
    );

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            setIsLoading(false);
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
            .finally(() => setIsLoading(false));
    }, []);

    const login = useCallback(async (cpf: string, password: string) => {
        const res = await authApi.login({ cpf, password });
        localStorage.setItem('access_token', res.access_token);
        localStorage.setItem('user', JSON.stringify(res.user));
        setUser(res.user);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setUser(null);
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            logout,
            isAdminStaff: user?.role === 'ADMIN_STAFF',
            isStaff: user?.role === 'STAFF',
            isParliamentarian: user?.role === 'PARLIAMENTARIAN',
        }),
        [user, isLoading, login, logout],
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
