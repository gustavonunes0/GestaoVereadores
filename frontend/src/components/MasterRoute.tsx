import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/** Rotas restritas ao perfil MASTER. */
export function MasterRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="login-page">
        <p>Carregando…</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'MASTER' || user.authType === 'camara') {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
