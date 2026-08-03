import { NavLink, useLocation } from 'react-router-dom';
import { ROUTES } from '../../app/navigation';
import { SIDEBAR_ICONS, type SidebarIconKey } from '../../app/sidebar-icons';

export type BottomNavItem = {
    label: string;
    to: string;
    icon: SidebarIconKey;
    /** Match prefix (ex.: /parlamentar/sessoes/:id). */
    matchPrefix?: boolean;
};

export const PARLAMENTAR_BOTTOM_NAV: BottomNavItem[] = [
    {
        label: 'Sessões',
        to: ROUTES.parlamentar.sessoes,
        icon: 'gavel',
        matchPrefix: true,
    },
    {
        label: 'Matérias',
        to: ROUTES.parlamentar.materias,
        icon: 'description',
    },
    {
        label: 'Comissões',
        to: ROUTES.parlamentar.comissoes,
        icon: 'people',
    },
    {
        label: 'Perfil',
        to: ROUTES.parlamentar.perfil,
        icon: 'badge',
    },
];

type Props = {
    onOpenMore: () => void;
};

function isActivePath(pathname: string, item: BottomNavItem): boolean {
    if (item.matchPrefix) {
        return pathname === item.to || pathname.startsWith(`${item.to}/`);
    }
    return pathname === item.to;
}

/**
 * Navegação inferior do portal parlamentar (celular e tablet).
 * O item "Mais" abre o menu lateral com o restante das rotas.
 */
export function MobileBottomNav({ onOpenMore }: Props) {
    const { pathname } = useLocation();

    return (
        <nav className="mobile-bottom-nav" aria-label="Navegação principal">
            {PARLAMENTAR_BOTTOM_NAV.map((item) => {
                const active = isActivePath(pathname, item);
                const pair = SIDEBAR_ICONS[item.icon];
                const Icon = active ? pair.iconActive : pair.icon;
                return (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={`mobile-bottom-nav__item${active ? ' is-active' : ''}`}
                        aria-current={active ? 'page' : undefined}
                    >
                        <Icon className="mobile-bottom-nav__icon" aria-hidden />
                        <span className="mobile-bottom-nav__label">{item.label}</span>
                    </NavLink>
                );
            })}
            <button
                type="button"
                className="mobile-bottom-nav__item"
                aria-label="Mais opções"
                onClick={onOpenMore}
            >
                <span className="mobile-bottom-nav__icon pi pi-ellipsis-h" aria-hidden />
                <span className="mobile-bottom-nav__label">Mais</span>
            </button>
        </nav>
    );
}
