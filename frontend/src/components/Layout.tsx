import { Fragment } from 'react';

import { NavLink, Outlet, useLocation } from 'react-router-dom';

import { ADMIN_NAV, INSTITUTIONAL_NAV, WORKFLOW_NAV } from '../app/navigation';

import { ModuleTitle } from './common/ModuleTitle';

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

              <h1>

                <ModuleTitle icon="pi pi-building" as="span" className="sidebar-brand__title">

                  SIGL

                </ModuleTitle>

              </h1>

              <p>Atividade legislativa</p>

            </div>



            <nav className="sidebar-nav" aria-label="Fluxo legislativo">

              <div className="nav-section">Fluxo</div>

              <ol className="workflow-nav-list">

                {WORKFLOW_NAV.map((item) => (

                  <Fragment key={item.to}>

                    {'pipelineBridge' in item && item.pipelineBridge && (
                      <li className="workflow-nav-bridge" aria-hidden>
                        <span>{item.pipelineBridge}</span>
                      </li>
                    )}

                    <li

                      className={`workflow-nav-item${item.match(location.pathname) ? ' workflow-nav-item--active' : ''}`}

                    >

                      <NavLink

                        to={item.to}

                        end={'end' in item ? item.end : undefined}

                        className={() =>

                          `nav-link${item.match(location.pathname) ? ' active' : ''}`

                        }

                      >
                        <ModuleTitle icon={item.icon} as="span" className="nav-link__label">

                          {item.label}

                        </ModuleTitle>

                      </NavLink>

                    </li>

                  </Fragment>

                ))}

              </ol>

            </nav>



            <div className="nav-section">Institucional</div>

            {INSTITUTIONAL_NAV.map((item) => (

              <NavLink

                key={item.to}

                to={item.to}

                className={() =>

                  `nav-link${item.match(location.pathname) ? ' active' : ''}`

                }

              >

                <ModuleTitle icon={item.icon} as="span" className="nav-link__label">

                  {item.label}

                </ModuleTitle>

              </NavLink>

            ))}



            {user?.role === 'MASTER' && user?.authType !== 'camara' && (

              <>

                <div className="nav-section">Administração</div>

                {ADMIN_NAV.map((item) => (

                  <NavLink

                    key={item.to}

                    to={item.to}

                    className={() =>

                      `nav-link${item.match(location.pathname) ? ' active' : ''}`

                    }

                  >

                    <ModuleTitle icon={item.icon} as="span" className="nav-link__label">

                      {item.label}

                    </ModuleTitle>

                  </NavLink>

                ))}

              </>

            )}



            <div className="sidebar-flow-hint">

              <p className="sidebar-flow-hint__title">Pipeline</p>

              <ol className="sidebar-flow-hint__steps">

                <li>Painel</li>

                <li>Matérias</li>

                <li>Sessões</li>

                <li>Normas</li>

                <li>Atos</li>

                <li>Relatórios</li>

              </ol>

            </div>

          </aside>



          <div className="main">

            <header className="topbar">

              <LegislaturaBar />

              <div className="topbar-user">

                <span className="topbar-user-info">

                  <strong>{user?.nome}</strong>

                  <Tag value={user?.role ?? '—'} severity="secondary" className="topbar-role-tag" />

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

