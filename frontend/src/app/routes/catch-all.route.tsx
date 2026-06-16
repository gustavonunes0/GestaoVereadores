import { Navigate } from 'react-router-dom';
import { ROUTES } from '../navigation';
import { useAuth } from '../../contexts/AuthContext';

/** Redireciona URL desconhecida conforme perfil autenticado. */
export function CatchAllRoute() {
    const { user, isLoading } = useAuth();

    if (isLoading) return null;

    if (!user) {
        return <Navigate to={ROUTES.login} replace />;
    }

    if (user.role === 'PARLIAMENTARIAN') {
        return <Navigate to={ROUTES.parlamentar.perfil} replace />;
    }

    return <Navigate to={ROUTES.dashboard} replace />;
}
