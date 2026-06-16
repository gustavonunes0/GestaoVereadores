import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { STAFF_NAV_GROUPS, type NavItemDef } from '../app/navigation';
import { useAuth } from '../contexts/AuthContext';

export function SidebarNav() {
    const { pathname } = useLocation();
    const { isAdminStaff } = useAuth();
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    function toggleGroup(label: string) {
        setExpandedGroups((prev) => {
            const next = new Set(prev);
            next.has(label) ? next.delete(label) : next.add(label);
            return next;
        });
    }

    function isRouteActive(route: string) {
        if (route === '/') return pathname === '/';
        return pathname.startsWith(route);
    }

    function renderItem(item: NavItemDef, nested = false): React.ReactNode {
        if (item.adminOnly && !isAdminStaff) return null;

        if (item.children) {
            const isExpanded = expandedGroups.has(item.label);
            const hasActiveChild = item.children.some(
                (c) => c.route && isRouteActive(c.route),
            );
            return (
                <div key={item.label} className={`nav-group${hasActiveChild ? ' nav-group--active' : ''}`}>
                    <button
                        type="button"
                        className="nav-link w-full text-left"
                        onClick={() => toggleGroup(item.label)}
                        aria-expanded={isExpanded}
                    >
                        <span className="nav-link__label flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <i className={`pi ${item.icon} module-title__icon`} aria-hidden="true" />
                                <span>{item.label}</span>
                            </span>
                            <i
                                className={`pi ${isExpanded ? 'pi-chevron-up' : 'pi-chevron-down'} text-xs opacity-50`}
                                aria-hidden="true"
                            />
                        </span>
                    </button>
                    {isExpanded && (
                        <div role="group" className="nav-group__items">
                            {item.children
                                .filter((child) => !child.adminOnly || isAdminStaff)
                                .map((child) => renderItem(child, true))}
                        </div>
                    )}
                </div>
            );
        }

        if (!item.route) return null;
        const active = isRouteActive(item.route);

        return (
            <NavLink
                key={item.route}
                to={item.route}
                end={item.route === '/'}
                className={() =>
                    `nav-link${nested ? ' nav-link--nested' : ''}${active ? ' active' : ''}`
                }
                aria-current={active ? 'page' : undefined}
            >
                <span className="nav-link__label flex items-center gap-2">
                    <i className={`pi ${item.icon} module-title__icon`} aria-hidden="true" />
                    <span>{item.label}</span>
                </span>
            </NavLink>
        );
    }

    return (
        <nav className="sidebar-nav" aria-label="Navegação principal">
            {STAFF_NAV_GROUPS.map((item) => renderItem(item))}
        </nav>
    );
}
