import LogoutOutlined from '@mui/icons-material/LogoutOutlined';
import { useAuth } from '../contexts/AuthContext';
import { isStaffUser } from '../types/auth';
import { SiglButton } from './common/SiglButton';

type Props = {
    menuOpen: boolean;
    onMenuToggle: () => void;
};

/**
 * Topbar do staff em celular/tablet — hamburger + identidade + sair.
 * Visível em ≤1024px (sidebar off-canvas, alinhado ao shell PWA).
 */
export function StaffTopbar({ menuOpen, onMenuToggle }: Props) {
    const { user, logout } = useAuth();
    const nome = user && isStaffUser(user) ? user.name : 'Usuário';

    return (
        <header className="topbar staff-topbar">
            <div className="topbar__start">
                <SiglButton
                    type="button"
                    className="sidebar-toggle"
                    icon="pi pi-bars"
                    severity="secondary"
                    text
                    aria-label="Abrir menu"
                    aria-expanded={menuOpen}
                    aria-controls="app-sidebar"
                    onClick={onMenuToggle}
                />
                <div className="staff-topbar__brand">
                    <strong>SIGL</strong>
                    <span className="staff-topbar__user">{nome}</span>
                </div>
            </div>

            <div className="topbar-user">
                <button type="button" className="btn-sair" onClick={logout}>
                    <LogoutOutlined sx={{ fontSize: 16 }} aria-hidden="true" />
                    Sair
                </button>
            </div>
        </header>
    );
}
