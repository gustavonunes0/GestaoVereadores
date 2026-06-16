/**
 * Rotas e menu alinhados ao fluxo legislativo SIGL.
 * Matéria → Sessão → (1) Normas jurídicas | (2) Atos administrativos
 */

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
    icon: string;
    route?: string;
    adminOnly?: boolean;
    children?: NavItemDef[];
}

/**
 * Menu lateral Staff — lista plana na ordem do documento operacional.
 * Apenas "Câmara Gestão" é um accordion.
 */
export const STAFF_NAV_GROUPS: NavItemDef[] = [
    { label: 'Dashboard',             route: ROUTES.dashboard,             icon: 'pi-home' },
    { label: 'Sessões Legislativas',  route: ROUTES.sessoes,               icon: 'pi-calendar' },
    { label: 'Matérias',              route: ROUTES.materias,              icon: 'pi-file-edit' },
    { label: 'Normas Jurídicas',      route: ROUTES.normasJuridicas,      icon: 'pi-book' },
    { label: 'Atos Administrativos',  route: ROUTES.atosAdministrativos,  icon: 'pi-briefcase' },
    { label: 'Parlamentares',         route: ROUTES.camara.parlamentares,  icon: 'pi-users' },
    { label: 'Mesa Diretora',         route: ROUTES.camara.mesaDiretora,  icon: 'pi-star' },
    { label: 'Comissões',             route: ROUTES.camara.comissoes,      icon: 'pi-sitemap' },
    { label: 'Frentes Parlamentares', route: ROUTES.camara.frentes,        icon: 'pi-flag' },
    { label: 'Autor Externo',         route: ROUTES.camara.autores,        icon: 'pi-id-card' },
    { label: 'Agenda',                route: ROUTES.agenda,                icon: 'pi-calendar-plus' },
    { label: 'Relatórios',            route: ROUTES.relatorios,            icon: 'pi-chart-bar' },
    {
        label: 'Câmara Gestão',
        icon: 'pi-building',
        children: [
            { label: 'Portal Institucional', route: ROUTES.camara.portal, icon: 'pi-globe' },
            { label: 'Usuários', route: ROUTES.usuarios, icon: 'pi-user-edit', adminOnly: true },
        ],
    },
];

/**
 * Menu lateral Parlamentar — "Perfil" é accordion expandido por padrão.
 */
export const PARLAMENTAR_NAV_ITEMS: NavItemDef[] = [
    {
        label: 'Perfil',
        icon: 'pi-user',
        children: [
            { label: 'Perfil Parlamentar', route: ROUTES.parlamentar.perfil,    icon: 'pi-id-card' },
            { label: 'Biografia',          route: ROUTES.parlamentar.biografia,  icon: 'pi-align-left' },
            { label: 'Dashboard',          route: ROUTES.parlamentar.dashboard,  icon: 'pi-home' },
        ],
    },
    { label: 'Matérias',  route: ROUTES.parlamentar.materias,  icon: 'pi-file-edit' },
    { label: 'Comissões', route: ROUTES.parlamentar.comissoes, icon: 'pi-sitemap' },
    { label: 'Mandato',   route: ROUTES.parlamentar.mandato,   icon: 'pi-calendar' },
    { label: 'Filiação',  route: ROUTES.parlamentar.filiacao,  icon: 'pi-flag' },
];

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
