import LogoutOutlined from '@mui/icons-material/LogoutOutlined';
import { useAuth } from '../../contexts/AuthContext';
import { isParlamentarianUser } from '../../types/auth';
import { SiglButton } from '../common/SiglButton';

type Props = {
    menuOpen: boolean;
    onMenuToggle: () => void;
};

export function ParlamentarTopbar({ menuOpen, onMenuToggle }: Props) {
    const { user, logout } = useAuth();
    const parlUser = user && isParlamentarianUser(user) ? user : null;
    const nome = parlUser?.parliamentaryName ?? 'Parlamentar';
    const cargo = `${nome} Parlamentar`;
    const inicial = nome.charAt(0).toUpperCase();

    return (
        <header className="topbar">
            <div className="topbar__start">
                <SiglButton
                    type="button"
                    className="sidebar-toggle"
                    icon="pi pi-bars"
                    severity="secondary"
                    text
                    aria-label="Abrir menu"
                    aria-expanded={menuOpen}
                    aria-controls="parlamentar-sidebar"
                    onClick={onMenuToggle}
                />
            </div>

            <div className="topbar-user parlamentar-topbar-user">
                <div className="parlamentar-topbar-user__meta">
                    <strong className="parlamentar-topbar-user__nome">{nome}</strong>
                    <span className="parlamentar-topbar-user__cargo">{cargo}</span>
                </div>

                {parlUser?.photoUrl ? (
                    <img
                        src={parlUser.photoUrl}
                        alt={nome}
                        className="parlamentar-topbar-user__avatar"
                    />
                ) : (
                    <div
                        className="parlamentar-topbar-user__avatar parlamentar-topbar-user__avatar--fallback"
                        aria-hidden
                    >
                        {inicial}
                    </div>
                )}

                <button type="button" className="btn-sair" onClick={logout}>
                    <LogoutOutlined sx={{ fontSize: 16 }} aria-hidden="true" />
                    Sair
                </button>
            </div>
        </header>
    );
}
