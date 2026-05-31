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



export type ModuleIconKey = keyof typeof MODULE_ICONS;



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

  },

  usuarios: '/usuarios',

} as const;



export const WORKFLOW_PIPELINE_TOTAL = 6;



export type NavItem = {

  to: string;

  label: string;

  icon: string;

  end?: boolean;

  match: (path: string) => boolean;

};



export type NavGroup = {

  id: string;

  label: string;

  /** Grupo aberto por padrão no primeiro acesso */

  defaultOpen?: boolean;

  items: readonly NavItem[];

};



/** Painel inicial. */

export const DASHBOARD_NAV: NavItem = {

  to: ROUTES.dashboard,

  label: 'Painel',

  icon: MODULE_ICONS.dashboard,

  end: true,

  match: (path) => path === ROUTES.dashboard,

};



/** Menu lateral agrupado — menos itens visíveis de uma vez. */

export const SIDEBAR_NAV_GROUPS: readonly NavGroup[] = [

  {

    id: 'atividade',

    label: 'Atividade legislativa',

    defaultOpen: true,

    items: [

      {

        to: ROUTES.materias,

        label: 'Matérias',

        icon: MODULE_ICONS.materias,

        match: (p) => p.startsWith(ROUTES.materias),

      },

      {

        to: ROUTES.sessoes,

        label: 'Sessões',

        icon: MODULE_ICONS.sessoes,

        match: (p) => p.startsWith(ROUTES.sessoes),

      },

      {

        to: ROUTES.agenda,

        label: 'Agenda',

        icon: MODULE_ICONS.agenda,

        match: (p) => p.startsWith(ROUTES.agenda),

      },

      {

        to: ROUTES.normasJuridicas,

        label: 'Normas',

        icon: MODULE_ICONS.normas,

        match: (p) => p.startsWith(ROUTES.normasJuridicas),

      },

      {

        to: ROUTES.relatorios,

        label: 'Relatórios',

        icon: MODULE_ICONS.relatorios,

        match: (p) => p.startsWith(ROUTES.relatorios),

      },

    ],

  },

  {

    id: 'camara',

    label: 'Estrutura da Câmara',

    defaultOpen: false,

    items: [

      {

        to: ROUTES.camara.legislaturas,

        label: 'Legislaturas',

        icon: MODULE_ICONS.legislaturas,

        match: (p) => p.startsWith(ROUTES.camara.legislaturas),

      },

      {

        to: ROUTES.camara.parlamentares,

        label: 'Parlamentares',

        icon: MODULE_ICONS.parlamentares,

        match: (p) => p.startsWith(ROUTES.camara.parlamentares),

      },

      {

        to: ROUTES.camara.comissoes,

        label: 'Comissões',

        icon: MODULE_ICONS.comissoes,

        match: (p) => p.startsWith(ROUTES.camara.comissoes),

      },

      {

        to: ROUTES.camara.frentes,

        label: 'Frentes',

        icon: MODULE_ICONS.frentes,

        match: (p) => p.startsWith(ROUTES.camara.frentes),

      },

      {

        to: ROUTES.camara.mesaDiretora,

        label: 'Mesa diretora',

        icon: MODULE_ICONS.mesaDiretora,

        match: (p) => p.startsWith(ROUTES.camara.mesaDiretora),

      },

      {

        to: ROUTES.camara.autores,

        label: 'Autores',

        icon: MODULE_ICONS.autores,

        match: (p) => p.startsWith(ROUTES.camara.autores),

      },

    ],

  },

] as const;



/** @deprecated Lista plana — preferir SIDEBAR_NAV_GROUPS */

export const LEGISLATIVO_NAV = SIDEBAR_NAV_GROUPS.flatMap((g) => g.items);



export const ADMINISTRATIVO_NAV: readonly NavItem[] = [

  {

    to: ROUTES.atosAdministrativos,

    label: 'Atos administrativos',

    icon: MODULE_ICONS.atos,

    match: (path) => path.startsWith(ROUTES.atosAdministrativos),

  },

];



export const WORKFLOW_NAV = [

  { ...DASHBOARD_NAV, pipelineStep: 1 },

  {

    to: ROUTES.materias,

    label: 'Matérias',

    icon: MODULE_ICONS.materias,

    pipelineStep: 2,

    match: (p: string) => p.startsWith(ROUTES.materias),

  },

  {

    to: ROUTES.sessoes,

    label: 'Sessões',

    icon: MODULE_ICONS.sessoes,

    pipelineStep: 3,

    match: (p: string) => p.startsWith(ROUTES.sessoes),

  },

  {

    to: ROUTES.normasJuridicas,

    label: 'Normas jurídicas',

    icon: MODULE_ICONS.normas,

    pipelineStep: 4,

    pipelineBridge: 'Documentos oficiais',

    match: (p: string) => p.startsWith(ROUTES.normasJuridicas),

  },

  {

    to: ROUTES.atosAdministrativos,

    label: 'Atos administrativos',

    icon: MODULE_ICONS.atos,

    pipelineStep: 5,

    match: (p: string) => p.startsWith(ROUTES.atosAdministrativos),

  },

  {

    to: ROUTES.relatorios,

    label: 'Relatórios',

    icon: MODULE_ICONS.relatorios,

    pipelineStep: 6,

    pipelineBridge: 'Consolidação',

    match: (p: string) => p.startsWith(ROUTES.relatorios),

  },

] as const;



export const INSTITUTIONAL_NAV = [

  {

    to: ROUTES.camara.legislaturas,

    label: 'Estrutura da Câmara',

    icon: MODULE_ICONS.camara,

    match: (path: string) => path.startsWith(ROUTES.camara.root),

  },

] as const;



export const ADMIN_NAV = [

  {

    to: ROUTES.usuarios,

    label: 'Usuários SIGL',

    icon: MODULE_ICONS.usuarios,

    match: (path: string) => path.startsWith(ROUTES.usuarios),

  },

] as const;



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


