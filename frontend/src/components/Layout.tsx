import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Tag } from 'primereact/tag';
import { useAuth } from '../contexts/AuthContext';
import { LegislaturaProvider } from '../contexts/LegislaturaContext';
import { AppFeedbackProvider } from '../hooks/useAppToast';
import { SiglButton } from './common/SiglButton';
import { SidebarNav } from './SidebarNav';
import { FooterBar } from './FooterBar';
import { LegislaturaBar } from './LegislaturaBar';
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
                        <div className="sidebar-brand">
                            <h1 className="sidebar-brand__heading">
                                <img
                                    src={logoSrc}
                                    alt="SIGL"
                                    className="sidebar-brand__logo"
                                />
                            </h1>
                            
                        </div>

                        <SidebarNav />
                    </aside>

                    <div className="main">
                        <header className="topbar">
                            <div className="topbar__start">
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
                            </div>

                            <div className="topbar-user">
                                <span className="topbar-user-info">
                                    <strong>{user?.name}</strong>
                                    <Tag
                                        value={user?.role ?? '—'}
                                        severity="secondary"
                                        className="topbar-role-tag"
                                    />
                                    {user?.tenantName && (
                                        <span className="topbar-tenant">
                                            {user.tenantName}
                                        </span>
                                    )}
                                </span>
                                <SiglButton
                                    label="Sair"
                                    icon="pi pi-sign-out"
                                    severity="secondary"
                                    onClick={logout}
                                />
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
