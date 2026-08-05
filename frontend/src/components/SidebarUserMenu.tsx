import { useMemo, useRef, useState, type MouseEvent } from 'react';
import PersonOutlined from '@mui/icons-material/PersonOutlined';
import ChevronRightOutlined from '@mui/icons-material/ChevronRightOutlined';
import { Menu } from 'primereact/menu';
import type { MenuItem } from 'primereact/menuitem';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../app/navigation';
import { useAuth } from '../contexts/AuthContext';
import type { AuthUser } from '../types/auth';
import { isStaffUser } from '../types/auth';
import { AlterarSenhaDialog } from './auth/AlterarSenhaDialog';
import { PersonAvatar } from './common/PersonAvatar';

function staffRoleLabel(role: 'ADMIN_STAFF' | 'STAFF') {
    return role === 'ADMIN_STAFF' ? 'Administrador' : 'Operador';
}

function userRoleLabel(user: AuthUser): string {
    if (isStaffUser(user)) return staffRoleLabel(user.role);
    if (user.sessionType === 'parliamentarian') return 'Parlamentar';
    if (user.sessionType === 'platform') return 'Super Admin';
    return '—';
}

function alignMenuBesideTrigger(trigger: HTMLElement) {
    const menu = document.querySelector<HTMLElement>(
        '.sidebar-user-menu.p-menu.p-menu-overlay',
    );
    if (!menu) return;

    const margin = 8;
    const gap = 6;
    const triggerRect = trigger.getBoundingClientRect();
    const width = Math.min(280, window.innerWidth - margin * 2);

    menu.style.width = `${width}px`;
    menu.style.minWidth = `${width}px`;
    menu.style.maxWidth = `${width}px`;

    const menuHeight = menu.offsetHeight;

    let left = triggerRect.right + gap;
    if (left + width > window.innerWidth - margin) {
        left = Math.max(margin, triggerRect.left - width - gap);
    }

    let top = triggerRect.bottom - menuHeight;
    if (top < margin) {
        top = margin;
    }
    if (top + menuHeight > window.innerHeight - margin) {
        top = window.innerHeight - menuHeight - margin;
    }

    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    menu.style.right = 'auto';
    menu.style.bottom = 'auto';
    menu.style.transform = 'none';
    menu.style.margin = '0';
    menu.style.transformOrigin = 'left bottom';
}

export function SidebarUserMenu() {
    const navigate = useNavigate();
    const { user, logout, isAdminStaff } = useAuth();
    const menuRef = useRef<Menu>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState(false);
    const [senhaDialogOpen, setSenhaDialogOpen] = useState(false);

    const actionItems = useMemo<MenuItem[]>(() => {
        if (!user) return [];

        const items: MenuItem[] = [
            {
                label: 'Alterar senha',
                icon: 'pi pi-lock',
                command: () => setSenhaDialogOpen(true),
            },
        ];

        if (isAdminStaff && isStaffUser(user)) {
            items.push({
                label: 'Gerenciar usuários',
                icon: 'pi pi-users',
                command: () => navigate(ROUTES.usuarios),
            });
        }

        items.push({
            label: 'Sair',
            icon: 'pi pi-sign-out',
            className: 'sidebar-user-menu__logout',
            command: () => logout(),
        });

        return items;
    }, [user, isAdminStaff, logout, navigate]);

    const profileHeader = useMemo(() => {
        if (!user) return null;
        const photoUrl = 'photoUrl' in user ? user.photoUrl : undefined;
        const tenantName = 'tenantName' in user ? user.tenantName : undefined;

        return (
            <div className="sidebar-user-menu__header">
                <PersonAvatar
                    photoUrl={photoUrl}
                    name={user.name}
                    size="md"
                    aria-hidden
                    className="sidebar-user-menu__header-avatar"
                    fallback={<PersonOutlined sx={{ fontSize: 22 }} />}
                />
                <div className="sidebar-user-menu__header-text">
                    <strong>{user.name}</strong>
                    {user.email ? <span>{user.email}</span> : null}
                    <span>{userRoleLabel(user)}</span>
                    {tenantName ? <span>{tenantName}</span> : null}
                </div>
            </div>
        );
    }, [user]);

    const menuModel = useMemo<MenuItem[]>(() => {
        if (!user) return [];

        return [
            {
                template: () => profileHeader,
            },
            { separator: true },
            ...actionItems,
        ];
    }, [user, profileHeader, actionItems]);

    const transitionOptions = useMemo(
        () => ({
            timeout: 0,
            onEnter: () => {
                requestAnimationFrame(() => {
                    if (triggerRef.current) {
                        alignMenuBesideTrigger(triggerRef.current);
                    }
                });
            },
            onEntered: () => {
                if (triggerRef.current) {
                    alignMenuBesideTrigger(triggerRef.current);
                }
            },
        }),
        [],
    );

    if (!user) return null;

    function handleToggle(e: MouseEvent<HTMLButtonElement>) {
        menuRef.current?.toggle(e);
    }

    function handleShow() {
        setOpen(true);
    }

    return (
        <div className="sidebar-user">
            <AlterarSenhaDialog
                visible={senhaDialogOpen}
                onHide={() => setSenhaDialogOpen(false)}
            />
            <Menu
                ref={menuRef}
                id="sidebar-user-menu"
                model={menuModel}
                popup
                className="sidebar-user-menu sidebar-user-menu--lateral"
                popupAlignment="right"
                baseZIndex={1400}
                transitionOptions={transitionOptions}
                onShow={handleShow}
                onHide={() => setOpen(false)}
            />
            <button
                ref={triggerRef}
                type="button"
                className={`sidebar-item sidebar-user__trigger${open ? ' active' : ''}`}
                onClick={handleToggle}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls="sidebar-user-menu"
            >
                <PersonAvatar
                    photoUrl={'photoUrl' in user ? user.photoUrl : undefined}
                    name={user.name}
                    size="sm"
                    aria-hidden
                    className="sidebar-user__avatar"
                    fallback={<PersonOutlined sx={{ fontSize: 20 }} />}
                />
                <span className="sidebar-user__trigger-label">{user.name}</span>
                <ChevronRightOutlined
                    aria-hidden="true"
                    className="sidebar-item__chevron sidebar-user__chevron"
                    sx={{ fontSize: 18, flexShrink: 0, color: 'currentColor' }}
                />
            </button>
        </div>
    );
}
