import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import LogoutOutlined from '@mui/icons-material/LogoutOutlined';
import { ROUTES } from '../app/navigation';
import { useAuth } from '../contexts/AuthContext';
import { AppFeedbackProvider } from '../hooks/useAppToast';
import logoSrc from '../../assets/camara-gest-logo.png';

export function PlatformLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <AppFeedbackProvider>
            <div className="app-shell platform-app-shell">
                <aside className="sidebar platform-sidebar">
                    <div className="sidebar-logo-area">
                        <h1 className="sidebar-logo-area__heading">
                            <img
                                src={logoSrc}
                                alt="CâmaraGest"
                                className="sidebar-brand__logo platform-sidebar__logo"
                            />
                        </h1>
                        <span className="platform-sidebar__badge">Super Admin</span>
                    </div>

                    <nav className="sidebar-nav" aria-label="Menu plataforma">
                        <NavLink
                            to={ROUTES.platform.tenants}
                            className={({ isActive }) =>
                                `sidebar-item${isActive ? ' active' : ''}`
                            }
                            end
                        >
                            <i className="pi pi-building" aria-hidden />
                            <span>Clientes (tenants)</span>
                        </NavLink>
                    </nav>

                    <div className="sidebar-user-menu platform-sidebar__footer">
                        <div className="platform-sidebar__user">
                            <strong>{user && 'name' in user ? user.name : 'Admin'}</strong>
                            <span>Plataforma SaaS</span>
                        </div>
                        <button
                            type="button"
                            className="btn-sair"
                            onClick={() => {
                                logout();
                                navigate(ROUTES.login);
                            }}
                        >
                            <LogoutOutlined sx={{ fontSize: 16 }} aria-hidden />
                            Sair
                        </button>
                    </div>
                </aside>

                <div className="main">
                    <main className="content">
                        <Outlet />
                    </main>
                </div>
            </div>
        </AppFeedbackProvider>
    );
}
