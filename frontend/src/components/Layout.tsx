import { useEffect, useState } from 'react';
import LogoutOutlined from '@mui/icons-material/LogoutOutlined';
import { Outlet, useLocation } from 'react-router-dom';
import { Tag } from 'primereact/tag';
import { useAuth } from '../contexts/AuthContext';
import { isStaffUser } from '../types/auth';
import { LegislaturaProvider } from '../contexts/LegislaturaContext';
import { AppFeedbackProvider } from '../hooks/useAppToast';
import { SidebarNav } from './SidebarNav';
import { FooterBar } from './FooterBar';
import logoSrc from '../../assets/logo.png';

export function Layout() {
    const { user, logout } = useAuth();
    const { pathname } = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        document.body.classList.toggle('sidebar-menu-open', menuOpen);
        return () => document.body.classList.remove('sidebar-menu-open');
    }, [menuOpen]);

    return (
        <LegislaturaProvider>
            <AppFeedbackProvider>
                <div className={`app-shell${menuOpen ? ' sidebar-open' : ''}`}>
                    <button
                        type="button"
                        className="sidebar-backdrop"
                        aria-label="Fechar menu"
                        tabIndex={menuOpen ? 0 : -1}
                        onClick={() => setMenuOpen(false)}
                    />

                    <aside className="sidebar" id="app-sidebar">
                        <div className="sidebar-logo-area">
                            <h1 className="sidebar-logo-area__heading">
                                <img
                                    src={logoSrc}
                                    alt="Câmara Municipal de Baturité — SIGL"
                                    className="sidebar-brand__logo"
                                />
                            </h1>
                        </div>

                        <SidebarNav />
                    </aside>

                    <div className="main">
                        <header className="topbar">
                            {/* <div className="topbar__start">
                                <SiglButton
                                    type="button"
                                    className="sidebar-toggle"
                                    icon="pi pi-bars"
                                    severity="secondary"
                                    text
                                    aria-label="Abrir menu"
                                    aria-expanded={menuOpen}
                                    aria-controls="app-sidebar"
                                    onClick={() => setMenuOpen((open) => !open)}
                                />
                                <LegislaturaBar />
                            </div> */}

                            <div className="topbar-user">
                                <span className="topbar-user-info">
                                    <strong>{user?.name}</strong>
                                    <Tag
                                        value={
                                            user && isStaffUser(user)
                                                ? user.role
                                                : user?.sessionType === 'parliamentarian'
                                                  ? 'Parlamentar'
                                                  : '—'
                                        }
                                        severity="secondary"
                                        className="topbar-role-tag"
                                    />
                                    {user?.tenantName && (
                                        <span className="topbar-tenant">
                                            {user.tenantName}
                                        </span>
                                    )}
                                </span>
                                <button
                                    type="button"
                                    className="btn-sair"
                                    onClick={logout}
                                >
                                    <LogoutOutlined
                                        sx={{ fontSize: 16 }}
                                        aria-hidden="true"
                                    />
                                    Sair
                                </button>
                            </div>
                        </header>

                        <main className="content">
                            <Outlet />
                        </main>

                        <FooterBar />
                    </div>
                </div>
            </AppFeedbackProvider>
        </LegislaturaProvider>
    );
}
