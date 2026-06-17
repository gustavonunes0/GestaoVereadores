import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '../app/navigation';
import { useAuth } from '../contexts/AuthContext';
import { isStaffUser } from '../types/auth';

export function AdminRoute({ children }: { children: ReactNode }) {
    const { user } = useAuth();

    if (!user || !isStaffUser(user) || user.role !== 'ADMIN_STAFF') {
        return <Navigate to={ROUTES.dashboard} replace />;
    }
    return <>{children}</>;
}
