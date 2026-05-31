import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  ADMINISTRATIVO_NAV,
  DASHBOARD_NAV,
  SIDEBAR_NAV_GROUPS,
  type NavGroup,
} from '../app/navigation';
import { ModuleTitle } from './common/ModuleTitle';

const STORAGE_KEY = 'sigl_sidebar_groups';

function loadOpenGroups(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    /* ignore */
  }
  return {};
}

function groupHasActivePath(group: NavGroup, pathname: string) {
  return group.items.some((item) => item.match(pathname));
}

type Props = {
  adminItems?: typeof import('../app/navigation').ADMIN_NAV;
  showAdmin?: boolean;
};

export function SidebarNav({ adminItems, showAdmin }: Props) {
  const { pathname } = useLocation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const stored = loadOpenGroups();
    const initial: Record<string, boolean> = {};
    for (const g of SIDEBAR_NAV_GROUPS) {
      initial[g.id] =
        stored[g.id] ??
        g.defaultOpen ??
        groupHasActivePath(g, pathname);
    }
    return initial;
  });

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      for (const g of SIDEBAR_NAV_GROUPS) {
        if (groupHasActivePath(g, pathname)) {
          next[g.id] = true;
        }
      }
      return next;
    });
  }, [pathname]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(openGroups));
  }, [openGroups]);

  function toggleGroup(id: string) {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <nav className="sidebar-nav" aria-label="Menu principal">
      <NavLink
        to={DASHBOARD_NAV.to}
        end={DASHBOARD_NAV.end}
        className={() =>
          `nav-link nav-link--top${DASHBOARD_NAV.match(pathname) ? ' active' : ''}`
        }
      >
        <ModuleTitle icon={DASHBOARD_NAV.icon} as="span" className="nav-link__label">
          {DASHBOARD_NAV.label}
        </ModuleTitle>
      </NavLink>

      {SIDEBAR_NAV_GROUPS.map((group) => {
        const isOpen = openGroups[group.id] ?? false;
        const activeInGroup = groupHasActivePath(group, pathname);
        return (
          <div
            key={group.id}
            className={`nav-group${isOpen ? ' nav-group--open' : ''}${activeInGroup ? ' nav-group--active' : ''}`}
          >
            <button
              type="button"
              className="nav-group__trigger"
              aria-expanded={isOpen}
              onClick={() => toggleGroup(group.id)}
            >
              <span className="nav-group__label">{group.label}</span>
              <span className="nav-group__meta">
                <span className="nav-group__count">{group.items.length}</span>
                <i className={`pi ${isOpen ? 'pi-chevron-up' : 'pi-chevron-down'} nav-group__chevron`} aria-hidden />
              </span>
            </button>
            {isOpen && (
              <div className="nav-group__items">
                {group.items
                  .filter((item) => item.to !== DASHBOARD_NAV.to)
                  .map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={() =>
                        `nav-link nav-link--nested${item.match(pathname) ? ' active' : ''}`
                      }
                    >
                      <ModuleTitle icon={item.icon} as="span" className="nav-link__label">
                        {item.label}
                      </ModuleTitle>
                    </NavLink>
                  ))}
              </div>
            )}
          </div>
        );
      })}

      <div className="nav-section">Outros</div>
      {ADMINISTRATIVO_NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={() => `nav-link${item.match(pathname) ? ' active' : ''}`}
        >
          <ModuleTitle icon={item.icon} as="span" className="nav-link__label">
            {item.label}
          </ModuleTitle>
        </NavLink>
      ))}

      {showAdmin && adminItems && (
        <>
          <div className="nav-section">Plataforma</div>
          {adminItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={() => `nav-link${item.match(pathname) ? ' active' : ''}`}
            >
              <ModuleTitle icon={item.icon} as="span" className="nav-link__label">
                {item.label}
              </ModuleTitle>
            </NavLink>
          ))}
        </>
      )}

    </nav>
  );
}
