import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { PARLAMENTAR_NAV_MENU } from '../app/navigation';
import { useAuth } from '../contexts/AuthContext';
import { AppFeedbackProvider } from '../hooks/useAppToast';
import { isParlamentarianUser } from '../types/auth';
import { resolveTenantLogoUrl } from '../utils/tenantLogo';
import { MobileBottomNav } from './mobile/MobileBottomNav';
import { ParlamentarTopbar } from './parlamentar/ParlamentarTopbar';
import { PushPermissionBanner } from './pwa/PushPermissionBanner';
import { SidebarNav } from './SidebarNav';
import fallbackLogoSrc from '../../assets/logo.png';

export function ParlamentarLayout() {
    const { pathname } = useLocation();
    const { user } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const tenantLogo =
        user && isParlamentarianUser(user)
            ? resolveTenantLogoUrl(user.tenantLogo)
            : null;
    const logoSrc = tenantLogo ?? fallbackLogoSrc;
    const logoAlt =
        user && isParlamentarianUser(user) && user.tenantName
            ? user.tenantName
            : 'Câmara Municipal — Portal do Parlamentar';

    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        document.body.classList.toggle('sidebar-menu-open', menuOpen);
        return () => document.body.classList.remove('sidebar-menu-open');
    }, [menuOpen]);

    return (
        <AppFeedbackProvider>
            <div
                className={`app-shell parlamentar-app-shell has-bottom-nav${menuOpen ? ' sidebar-open' : ''}`}
            >
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
                                alt={logoAlt}
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

                <MobileBottomNav onOpenMore={() => setMenuOpen(true)} />
                <PushPermissionBanner />
            </div>
        </AppFeedbackProvider>
    );
}
