import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LegislaturaProvider } from '../contexts/LegislaturaContext';
import { LegislaturaBar } from './LegislaturaBar';

const workflowNav: {
  to: string;
  label: string;
  end?: boolean;
  match: (p: string) => boolean;
}[] = [
  { to: '/', label: 'Painel', end: true, match: (p) => p === '/' },
  { to: '/materias', label: 'Matérias', match: (p) => p.startsWith('/materias') },
  { to: '/sessoes', label: 'Sessões', match: (p) => p.startsWith('/sessoes') },
  { to: '/publicacao/normas', label: 'Publicação', match: (p) => p.startsWith('/publicacao') },
  { to: '/relatorios', label: 'Relatórios', match: (p) => p.startsWith('/relatorios') },
];

const supportNav = [{ to: '/camara/parlamentares', label: 'Estrutura da Câmara' }];

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <LegislaturaProvider>
      <div className="app-shell">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <h1>SIGL</h1>
            <p>Atividade legislativa</p>
          </div>

          <div className="nav-section">Fluxo</div>
          {workflowNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={() =>
                `nav-link${item.match(location.pathname) ? ' active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}

          <div className="nav-section">Institucional</div>
          {supportNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={() =>
                `nav-link${location.pathname.startsWith('/camara') ? ' active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}

          {user?.role === 'MASTER' && (
            <>
              <div className="nav-section">Administração</div>
              <NavLink
                to="/usuarios"
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                Usuários
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
              <span>
                <strong>{user?.nome}</strong>
                <span className="badge">{user?.role}</span>
              </span>
              <button type="button" className="btn btn-secondary btn-sm" onClick={logout}>
                Sair
              </button>
            </div>
          </header>
          <main className="content">
            <Outlet />
          </main>
        </div>
      </div>
    </LegislaturaProvider>
  );
}
