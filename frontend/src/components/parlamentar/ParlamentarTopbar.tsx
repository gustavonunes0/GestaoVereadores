import ExpandMoreOutlined from '@mui/icons-material/ExpandMoreOutlined';
import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { Menu } from 'primereact/menu';
import type { MenuItem } from 'primereact/menuitem';
import { useAuth } from '../../contexts/AuthContext';
import { isParlamentarianUser } from '../../types/auth';
import { SiglButton } from '../common/SiglButton';
import { PersonAvatar } from '../common/PersonAvatar';
import { AlterarSenhaDialog } from '../auth/AlterarSenhaDialog';

type Props = {
    menuOpen: boolean;
    onMenuToggle: () => void;
};

export function ParlamentarTopbar({ menuOpen, onMenuToggle }: Props) {
    const { user, logout } = useAuth();
    const menuRef = useRef<Menu>(null);
    const [accountOpen, setAccountOpen] = useState(false);
    const [senhaDialogOpen, setSenhaDialogOpen] = useState(false);
    const parlUser = user && isParlamentarianUser(user) ? user : null;
    const nome = parlUser?.parliamentaryName ?? 'Parlamentar';

    const menuModel = useMemo<MenuItem[]>(
        () => [
            {
                label: 'Alterar senha',
                icon: 'pi pi-lock',
                command: () => setSenhaDialogOpen(true),
            },
            {
                label: 'Sair',
                icon: 'pi pi-sign-out',
                command: () => logout(),
            },
        ],
        [logout],
    );

    function handleUserMenu(e: MouseEvent<HTMLButtonElement>) {
        menuRef.current?.toggle(e);
    }

    return (
        <>
            <AlterarSenhaDialog
                visible={senhaDialogOpen}
                onHide={() => setSenhaDialogOpen(false)}
            />
            <Menu
                ref={menuRef}
                id="parlamentar-topbar-menu"
                model={menuModel}
                popup
                popupAlignment="right"
                baseZIndex={1400}
                className="parlamentar-topbar-menu"
                onShow={() => setAccountOpen(true)}
                onHide={() => setAccountOpen(false)}
            />
            <header className="topbar parlamentar-topbar">
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
                        <span className="parlamentar-topbar-user__cargo">Parlamentar</span>
                    </div>

                    <button
                        type="button"
                        className={`parlamentar-topbar-user__trigger${accountOpen ? ' is-open' : ''}`}
                        onClick={handleUserMenu}
                        aria-haspopup="menu"
                        aria-expanded={accountOpen}
                        aria-controls="parlamentar-topbar-menu"
                        aria-label={`Conta de ${nome}`}
                    >
                        <PersonAvatar
                            photoUrl={parlUser?.photoUrl}
                            name={nome}
                            size="md"
                            alt=""
                            className="parlamentar-topbar-user__avatar"
                        />
                        <ExpandMoreOutlined
                            sx={{ fontSize: 18 }}
                            aria-hidden
                            className="parlamentar-topbar-user__chevron"
                        />
                    </button>
                </div>
            </header>
        </>
    );
}
