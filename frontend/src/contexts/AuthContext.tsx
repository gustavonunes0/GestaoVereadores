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
import { isParlamentarianUser, isPlatformUser, isStaffUser } from '../types/auth';

interface AuthContextValue {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login(identifier: string, password: string): Promise<void>;
    logout(): void;
    isAdminStaff: boolean;
    isStaff: boolean;
    isParliamentarian: boolean;
    isPlatformAdmin: boolean;
    canEdit: boolean;
    canWrite: boolean;
    canVotar: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Evita estourar localStorage com data URLs grandes (logo da câmara). */
function persistUser(user: AuthUser) {
    if (
        'tenantLogo' in user &&
        typeof user.tenantLogo === 'string' &&
        user.tenantLogo.startsWith('data:')
    ) {
        const { tenantLogo: _logo, ...rest } = user;
        localStorage.setItem('user', JSON.stringify(rest));
        return;
    }
    localStorage.setItem('user', JSON.stringify(user));
}

function loadStoredUser(): AuthUser | null {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw) as AuthUser;
        if (!parsed.sessionType) return null;
        return parsed;
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
                persistUser(u);
            })
            .catch(() => {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                setUser(null);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const login = useCallback(async (identifier: string, password: string) => {
        const trimmed = identifier.trim();
        const looksLikeEmail = trimmed.includes('@');
        const res = await authApi.login(
            looksLikeEmail
                ? { email: trimmed.toLowerCase(), password }
                : { cpf: trimmed, password },
        );
        localStorage.setItem('access_token', res.access_token);
        persistUser(res.user);
        setUser(res.user);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setUser(null);
    }, []);

    const value = useMemo<AuthContextValue>(() => {
        const isAdminStaff =
            !!user && isStaffUser(user) && user.role === 'ADMIN_STAFF';
        const isStaff = !!user && isStaffUser(user) && user.role === 'STAFF';
        const isParliamentarian = !!user && isParlamentarianUser(user);
        const isPlatformAdmin = !!user && isPlatformUser(user);

        return {
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            logout,
            isAdminStaff,
            isStaff,
            isParliamentarian,
            isPlatformAdmin,
            canEdit: isAdminStaff,
            canWrite: isAdminStaff || isStaff,
            canVotar: isParliamentarian,
        };
    }, [user, isLoading, login, logout]);

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth fora de AuthProvider');
    return ctx;
}
