/**
 * Rotas e menu alinhados ao fluxo legislativo SIGL.
 * Matéria → Sessão → (1) Normas jurídicas | (2) Atos administrativos
 */

import type { SidebarIconKey } from './sidebar-icons';

/** Ícones PrimeIcons por módulo (reutilizar em menu, abas e PageHeader). */
export const MODULE_ICONS = {
    dashboard: 'pi pi-th-large',
    materias: 'pi pi-file-edit',
    sessoes: 'pi pi-calendar',
    relatorios: 'pi pi-chart-bar',
    agenda: 'pi pi-calendar-plus',
    camara: 'pi pi-sitemap',
    parlamentares: 'pi pi-users',
    comissoes: 'pi pi-briefcase',
    frentes: 'pi pi-flag',
    mesaDiretora: 'pi pi-id-card',
    autores: 'pi pi-user-edit',
    legislaturas: 'pi pi-history',
    normas: 'pi pi-file',
    atos: 'pi pi-inbox',
    usuarios: 'pi pi-shield',
} as const;

export const ROUTES = {
    login: '/login',
    dashboard: '/',
    materias: '/materias',
    sessoes: '/sessoes',
    agenda: '/agenda',
    relatorios: '/relatorios',
    normasJuridicas: '/normas-juridicas',
    atosAdministrativos: '/atos-administrativos',
    camara: {
        root: '/camara',
        parlamentares: '/camara/parlamentares',
        comissoes: '/camara/comissoes',
        frentes: '/camara/frentes',
        mesaDiretora: '/camara/mesa-diretora',
        autores: '/camara/autores',
        legislaturas: '/camara/legislaturas',
        portal: '/camara/portal',
    },
    usuarios: '/usuarios',
    parlamentar: {
        root: '/parlamentar',
        perfil: '/parlamentar/perfil',
        biografia: '/parlamentar/biografia',
        dashboard: '/parlamentar/dashboard',
        materias: '/parlamentar/materias',
        comissoes: '/parlamentar/comissoes',
        mandato: '/parlamentar/mandato',
        filiacao: '/parlamentar/filiacao',
    },
} as const;

export const WORKFLOW_PIPELINE_TOTAL = 6;

/** Item de navegação — route é undefined para grupos accordion. */
export interface NavItemDef {
    label: string;
    /** Chave do par de ícones MUI (sidebar staff). */
    sidebarIcon?: SidebarIconKey;
    /** Sufixo PrimeIcons sem prefixo pi (layout parlamentar). */
    icon?: string;
    route?: string;
    adminOnly?: boolean;
    children?: NavItemDef[];
}

/** Grupo de itens no menu lateral (label + itens). */
export interface NavGroupDef {
    label: string;
    items: NavItemDef[];
}

/**
 * Menu lateral Staff — agrupado por domínio.
 * Apenas "Câmara Gestão" é accordion.
 */
export const STAFF_NAV_MENU: NavGroupDef[] = [
    {
        label: 'Geral',
        items: [
            { label: 'Dashboard', route: ROUTES.dashboard, sidebarIcon: 'dashboard' },
        ],
    },
    {
        label: 'Legislativo',
        items: [
            { label: 'Sessões Legislativas', route: ROUTES.sessoes, sidebarIcon: 'gavel' },
            { label: 'Matérias', route: ROUTES.materias, sidebarIcon: 'description' },
            { label: 'Normas Jurídicas', route: ROUTES.normasJuridicas, sidebarIcon: 'balance' },
            { label: 'Atos Administrativos', route: ROUTES.atosAdministrativos, sidebarIcon: 'task' },
        ],
    },
    {
        label: 'Pessoas',
        items: [
            { label: 'Parlamentares', route: ROUTES.camara.parlamentares, sidebarIcon: 'groups' },
            { label: 'Mesa Diretora', route: ROUTES.camara.mesaDiretora, sidebarIcon: 'recent_actors' },
            { label: 'Comissões', route: ROUTES.camara.comissoes, sidebarIcon: 'people' },
            { label: 'Frentes Parlamentares', route: ROUTES.camara.frentes, sidebarIcon: 'flag' },
            { label: 'Autor Externo', route: ROUTES.camara.autores, sidebarIcon: 'person_add' },
        ],
    },
    {
        label: 'Sistema',
        items: [
            { label: 'Agenda', route: ROUTES.agenda, sidebarIcon: 'calendar_month' },
            { label: 'Relatórios', route: ROUTES.relatorios, sidebarIcon: 'bar_chart' },
            {
                label: 'Câmara Gestão',
                sidebarIcon: 'account_balance',
                children: [
                    { label: 'Portal Institucional', route: ROUTES.camara.portal, sidebarIcon: 'public' },
                    {
                        label: 'Usuários',
                        route: ROUTES.usuarios,
                        sidebarIcon: 'manage_accounts',
                        adminOnly: true,
                    },
                ],
            },
        ],
    },
];

/** Lista plana de itens do menu staff (validação de rotas). */
export function flattenStaffNavItems(): NavItemDef[] {
    return STAFF_NAV_MENU.flatMap((group) => group.items);
}

/** @deprecated Use STAFF_NAV_MENU na sidebar; mantido para scripts de validação. */
export const STAFF_NAV_GROUPS = flattenStaffNavItems();

/** Menu lateral do portal parlamentar — mesma estrutura de grupos do staff. */
export const PARLAMENTAR_NAV_MENU: NavGroupDef[] = [
    {
        label: 'Perfil',
        items: [
            {
                label: 'Perfil Parlamentar',
                route: ROUTES.parlamentar.perfil,
                sidebarIcon: 'badge',
            },
            {
                label: 'Biografia',
                route: ROUTES.parlamentar.biografia,
                sidebarIcon: 'article',
            },
            {
                label: 'Dashboard',
                route: ROUTES.parlamentar.dashboard,
                sidebarIcon: 'dashboard',
            },
        ],
    },
    {
        label: 'Atuação',
        items: [
            {
                label: 'Matérias',
                route: ROUTES.parlamentar.materias,
                sidebarIcon: 'description',
            },
            {
                label: 'Comissões',
                route: ROUTES.parlamentar.comissoes,
                sidebarIcon: 'people',
            },
            {
                label: 'Mandato',
                route: ROUTES.parlamentar.mandato,
                sidebarIcon: 'calendar_month',
            },
            {
                label: 'Filiação',
                route: ROUTES.parlamentar.filiacao,
                sidebarIcon: 'flag',
            },
        ],
    },
];

export function flattenParlamentarNavItems(): NavItemDef[] {
    return PARLAMENTAR_NAV_MENU.flatMap((group) => group.items);
}

/** @deprecated Use PARLAMENTAR_NAV_MENU na sidebar. */
export const PARLAMENTAR_NAV_ITEMS = flattenParlamentarNavItems();

export const LEGACY_REDIRECTS: { from: string; to: string }[] = [
    { from: 'parlamentares', to: ROUTES.camara.parlamentares },
    { from: 'comissoes', to: ROUTES.camara.comissoes },
    { from: 'frentes', to: ROUTES.camara.frentes },
    { from: 'mesa-diretora', to: ROUTES.camara.mesaDiretora },
    { from: 'autores', to: ROUTES.camara.autores },
    { from: 'legislaturas', to: ROUTES.camara.legislaturas },
    { from: 'normas', to: ROUTES.normasJuridicas },
    { from: 'atos', to: ROUTES.atosAdministrativos },
    { from: 'publicacao', to: ROUTES.normasJuridicas },
    { from: 'publicacao/normas', to: ROUTES.normasJuridicas },
    { from: 'publicacao/atos', to: ROUTES.atosAdministrativos },
];
