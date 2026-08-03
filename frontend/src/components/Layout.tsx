import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { LegislaturaProvider } from '../contexts/LegislaturaContext';
import { AppFeedbackProvider } from '../hooks/useAppToast';
import { SidebarNav } from './SidebarNav';
import { SiglButton } from './common/SiglButton';
import logoSrc from '../../assets/logo.png';
import { FooterBar } from './FooterBar';

export function Layout() {
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
                                    alt="Câmara Municipal de Baturité"
                                    className="sidebar-brand__logo"
                                />
                            </h1>
                        </div>

                        <SidebarNav showUserFooter />
                        <FooterBar compact className="footer-bar--sidebar" />
                    </aside>

                    <div className="main">
                        {/* Menu off-canvas (tablet/celular) — sem topbar */}
                        <SiglButton
                            type="button"
                            className="sidebar-toggle sidebar-menu-fab"
                            icon="pi pi-bars"
                            severity="secondary"
                            aria-label="Abrir menu"
                            aria-expanded={menuOpen}
                            aria-controls="app-sidebar"
                            onClick={() => setMenuOpen((open) => !open)}
                        />
                        <main className="content">
                            <Outlet />
                        </main>
                    </div>
                </div>
            </AppFeedbackProvider>
        </LegislaturaProvider>
    );
}
