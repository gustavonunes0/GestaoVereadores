import { NavLink, Outlet } from 'react-router-dom';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { useAuth } from '../contexts/AuthContext';
import { PARLAMENTAR_NAV_ITEMS } from '../app/navigation';
import { AppFeedbackProvider } from '../hooks/useAppToast';

export function ParlamentarLayout() {
    const { user, logout } = useAuth();

    return (
        <AppFeedbackProvider>
            <div className="parlamentar-layout">
                <header className="parlamentar-header">
                    <div className="parlamentar-identity">
                        {user?.photoUrl ? (
                            <Avatar image={user.photoUrl} size="large" shape="circle" />
                        ) : (
                            <Avatar icon="pi pi-user" size="large" shape="circle" />
                        )}
                        <div>
                            <span className="parlamentar-name">
                                {user?.parliamentaryName ?? user?.name}
                            </span>
                            <span className="parlamentar-role">Parlamentar</span>
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
                        {PARLAMENTAR_NAV_ITEMS.map((item) => (
                            <NavLink
                                key={item.route}
                                to={item.route}
                                className={({ isActive }) =>
                                    `parlamentar-nav-item${isActive ? ' active' : ''}`
                                }
                            >
                                <i className={`pi ${item.icon}`} aria-hidden="true" />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    <main className="parlamentar-content">
                        <Outlet />
                    </main>
                </div>
            </div>
        </AppFeedbackProvider>
    );
}
