import { useState } from 'react';
import ExpandLessOutlined from '@mui/icons-material/ExpandLessOutlined';
import ExpandMoreOutlined from '@mui/icons-material/ExpandMoreOutlined';
import { NavLink, useLocation } from 'react-router-dom';
import { SIDEBAR_ICONS } from '../app/sidebar-icons';
import {
    STAFF_NAV_MENU,
    type NavGroupDef,
    type NavItemDef,
} from '../app/navigation';
import { useAuth } from '../contexts/AuthContext';
import { SidebarIcon } from './ui/SidebarIcon';

type Props = {
    menu?: NavGroupDef[];
};

export function SidebarNav({ menu = STAFF_NAV_MENU }: Props) {
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

    function renderSidebarIcon(item: NavItemDef, active: boolean) {
        if (!item.sidebarIcon) return null;
        const pair = SIDEBAR_ICONS[item.sidebarIcon];
        return (
            <SidebarIcon
                icon={pair.icon}
                iconActive={pair.iconActive}
                active={active}
            />
        );
    }

    function renderItem(item: NavItemDef, nested = false): React.ReactNode {
        if (item.adminOnly && !isAdminStaff) return null;

        if (item.children) {
            const isExpanded = expandedGroups.has(item.label);
            const hasActiveChild = item.children.some(
                (c) => c.route && isRouteActive(c.route),
            );
            const groupActive = hasActiveChild;

            return (
                <div key={item.label} className={`nav-group${groupActive ? ' nav-group--active' : ''}`}>
                    <button
                        type="button"
                        className={`sidebar-item text-left${groupActive ? ' active' : ''}`}
                        onClick={() => toggleGroup(item.label)}
                        aria-expanded={isExpanded}
                    >
                        <span className="sidebar-item__label">
                            {renderSidebarIcon(item, groupActive)}
                            <span>{item.label}</span>
                            {isExpanded ? (
                                <ExpandLessOutlined
                                    aria-hidden="true"
                                    className="sidebar-item__chevron"
                                    sx={{ fontSize: 18, flexShrink: 0, color: 'currentColor' }}
                                />
                            ) : (
                                <ExpandMoreOutlined
                                    aria-hidden="true"
                                    className="sidebar-item__chevron"
                                    sx={{ fontSize: 18, flexShrink: 0, color: 'currentColor' }}
                                />
                            )}
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

        if (!item.route || !item.sidebarIcon) return null;
        const active = isRouteActive(item.route);

        return (
            <NavLink
                key={item.route}
                to={item.route}
                end={item.route === '/'}
                className={() =>
                    `sidebar-item${nested ? ' sidebar-item--nested' : ''}${active ? ' active' : ''}`
                }
                aria-current={active ? 'page' : undefined}
            >
                {renderSidebarIcon(item, active)}
                <span>{item.label}</span>
            </NavLink>
        );
    }

    return (
        <nav className="sidebar-nav" aria-label="Navegação principal">
            {menu.map((group) => (
                <div key={group.label} className="sidebar-nav__group">
                    <div className="sidebar-group-label">{group.label}</div>
                    {group.items.map((item) => renderItem(item))}
                </div>
            ))}
        </nav>
    );
}
