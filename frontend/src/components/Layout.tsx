import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { INSTITUTIONAL_NAV, ROUTES, WORKFLOW_NAV } from '../app/navigation';
import { SiglButton } from './common/SiglButton';
import { Tag } from 'primereact/tag';
import { useAuth } from '../contexts/AuthContext';
import { LegislaturaProvider } from '../contexts/LegislaturaContext';
import { AppFeedbackProvider } from '../hooks/useAppToast';
import { LegislaturaBar } from './LegislaturaBar';

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <LegislaturaProvider>
      <AppFeedbackProvider>
        <div className="app-shell">
          <aside className="sidebar">
            <div className="sidebar-brand">
              <h1>SIGL</h1>
              <p>Atividade legislativa</p>
            </div>

            <div className="nav-section">Fluxo</div>
            {WORKFLOW_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={'end' in item ? item.end : undefined}
                className={() =>
                  `nav-link${item.match(location.pathname) ? ' active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}

            <div className="nav-section">Institucional</div>
            {INSTITUTIONAL_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={() =>
                  `nav-link${item.match(location.pathname) ? ' active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}

            {user?.role === 'MASTER' && user?.authType !== 'camara' && (
              <>
                <div className="nav-section">Administração</div>
                <NavLink
                  to={ROUTES.usuarios}
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                >
                  Usuários SIGL
                </NavLink>
              </>
            )}

            <div className="sidebar-flow-hint">
              <p>Matéria → Tramitação → Sessão → Publicação</p>
            </div>
          </aside>

          <div className="main">
            <header className="topbar">
              <LegislaturaBar />
              <div className="topbar-user">
                <span className="topbar-user-info">
                  <strong>{user?.nome}</strong>
                  <Tag value={user?.role ?? '—'} severity="info" className="topbar-role-tag" />
                  {user?.tenantName && (
                    <span className="topbar-tenant">{user.tenantName}</span>
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
          </div>
        </div>
      </AppFeedbackProvider>
    </LegislaturaProvider>
  );
}
