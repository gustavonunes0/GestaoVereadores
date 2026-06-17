import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { PARLAMENTAR_NAV_MENU } from '../app/navigation';
import { AppFeedbackProvider } from '../hooks/useAppToast';
import { ParlamentarTopbar } from './parlamentar/ParlamentarTopbar';
import { SidebarNav } from './SidebarNav';
import logoSrc from '../../assets/logo.png';

export function ParlamentarLayout() {
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
        <AppFeedbackProvider>
            <div className={`app-shell parlamentar-app-shell${menuOpen ? ' sidebar-open' : ''}`}>
                <button
                    type="button"
                    className="sidebar-backdrop"
                    aria-label="Fechar menu"
                    tabIndex={menuOpen ? 0 : -1}
                    onClick={() => setMenuOpen(false)}
                />

                <aside className="sidebar" id="parlamentar-sidebar">
                    <div className="sidebar-logo-area">
                        <h1 className="sidebar-logo-area__heading">
                            <img
                                src={logoSrc}
                                alt="Câmara Municipal — Portal do Parlamentar"
                                className="sidebar-brand__logo"
                            />
                        </h1>
                    </div>

                    <SidebarNav menu={PARLAMENTAR_NAV_MENU} />
                </aside>

                <div className="main">
                    <ParlamentarTopbar
                        menuOpen={menuOpen}
                        onMenuToggle={() => setMenuOpen((open) => !open)}
                    />

                    <main className="content">
                        <Outlet />
                    </main>
                </div>
            </div>
        </AppFeedbackProvider>
    );
}
