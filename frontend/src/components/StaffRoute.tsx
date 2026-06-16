import { Navigate, Outlet } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
import { ROUTES } from '../app/navigation';
import { useAuth } from '../contexts/AuthContext';

export function StaffRoute() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex align-items-center justify-content-center" style={{ height: '100vh' }}>
                <ProgressSpinner />
            </div>
        );
    }

    if (!user) return <Navigate to={ROUTES.login} replace />;
    if (user.role === 'PARLIAMENTARIAN') return <Navigate to={ROUTES.parlamentar.perfil} replace />;
    return <Outlet />;
}
