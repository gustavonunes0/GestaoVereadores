import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { useAuth } from '../contexts/AuthContext';
import { PARLAMENTAR_NAV_ITEMS, type NavItemDef } from '../app/navigation';
import { AppFeedbackProvider } from '../hooks/useAppToast';
import { isParlamentarianUser } from '../types/auth';

export function ParlamentarLayout() {
    const { user, logout } = useAuth();
    const { pathname } = useLocation();
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Perfil']));

    const parlUser = user && isParlamentarianUser(user) ? user : null;

    function toggleGroup(label: string) {
        setExpandedGroups((prev) => {
            const next = new Set(prev);
            next.has(label) ? next.delete(label) : next.add(label);
            return next;
        });
    }

    function isActive(route: string) {
        if (route === '/') return pathname === '/';
        return pathname.startsWith(route);
    }

    function renderNavItem(item: NavItemDef, nested = false): React.ReactNode {
        if (item.children) {
            const isExpanded = expandedGroups.has(item.label);
            return (
                <div key={item.label}>
                    <button
                        type="button"
                        className="parlamentar-nav-item w-full text-left flex items-center justify-between"
                        onClick={() => toggleGroup(item.label)}
                        aria-expanded={isExpanded}
                    >
                        <span className="flex items-center gap-2">
                            <i className={`pi ${item.icon}`} aria-hidden="true" />
                            <span>{item.label}</span>
                        </span>
                        <i
                            className={`pi ${isExpanded ? 'pi-chevron-up' : 'pi-chevron-down'} text-xs opacity-50`}
                            aria-hidden="true"
                        />
                    </button>
                    {isExpanded && (
                        <div role="group" className="pl-4">
                            {item.children.map((child) => renderNavItem(child, true))}
                        </div>
                    )}
                </div>
            );
        }

        if (!item.route) return null;
        const active = isActive(item.route);

        return (
            <NavLink
                key={item.route}
                to={item.route}
                className={() =>
                    `parlamentar-nav-item${nested ? ' parlamentar-nav-item--nested' : ''}${active ? ' active' : ''}`
                }
                aria-current={active ? 'page' : undefined}
            >
                <i className={`pi ${item.icon}`} aria-hidden="true" />
                <span>{item.label}</span>
            </NavLink>
        );
    }

    return (
        <AppFeedbackProvider>
            <div className="parlamentar-layout">
                <header className="parlamentar-header">
                    <div className="parlamentar-identity">
                        {parlUser?.photoUrl ? (
                            <Avatar image={parlUser.photoUrl} size="large" shape="circle" />
                        ) : (
                            <Avatar
                                label={
                                    parlUser?.parliamentaryName?.charAt(0).toUpperCase() ?? '?'
                                }
                                size="large"
                                shape="circle"
                            />
                        )}
                        <div>
                            <span className="parlamentar-name">
                                {parlUser?.parliamentaryName ?? 'Parlamentar'}
                            </span>
                            {parlUser?.name && (
                                <span className="parlamentar-role block text-sm opacity-70">
                                    {parlUser.name}
                                </span>
                            )}
                        </div>
                    </div>
                    <Button
                        icon="pi pi-sign-out"
                        label="Sair"
                        text
                        severity="secondary"
                        aria-label="Sair"
                        onClick={logout}
                    />
                </header>

                <div className="parlamentar-body">
                    <nav className="parlamentar-sidebar" aria-label="Menu parlamentar">
                        {PARLAMENTAR_NAV_ITEMS.map((item) => renderNavItem(item))}
                    </nav>

                    <main className="parlamentar-content">
                        <Outlet />
                    </main>
                </div>
            </div>
        </AppFeedbackProvider>
    );
}
