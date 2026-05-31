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
  relatorios: '/relatorios',
  /** Módulo 1 — documentos com força normativa (legislativo). */
  normasJuridicas: '/normas-juridicas',
  /** Módulo 2 — gestão administrativa interna. */
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

/** Total de etapas no pipeline principal (sidebar e badges de página). */
export const WORKFLOW_PIPELINE_TOTAL = 6;

/** Itens do fluxo principal (sidebar — seção Fluxo). */
export const WORKFLOW_NAV = [
  {
    to: ROUTES.dashboard,
    label: 'Painel',
    icon: MODULE_ICONS.dashboard,
    end: true as const,
    pipelineStep: 1,
    match: (path: string) => path === ROUTES.dashboard,
  },
  {
    to: ROUTES.materias,
    label: 'Matérias',
    icon: MODULE_ICONS.materias,
    pipelineStep: 2,
    match: (path: string) => path.startsWith(ROUTES.materias),
  },
  {
    to: ROUTES.sessoes,
    label: 'Sessões',
    icon: MODULE_ICONS.sessoes,
    pipelineStep: 3,
    match: (path: string) => path.startsWith(ROUTES.sessoes),
  },
  {
    to: ROUTES.normasJuridicas,
    label: 'Normas jurídicas',
    icon: MODULE_ICONS.normas,
    pipelineStep: 4,
    pipelineBridge: 'Documentos oficiais',
    match: (path: string) => path.startsWith(ROUTES.normasJuridicas),
  },
  {
    to: ROUTES.atosAdministrativos,
    label: 'Atos administrativos',
    icon: MODULE_ICONS.atos,
    pipelineStep: 5,
    match: (path: string) => path.startsWith(ROUTES.atosAdministrativos),
  },
  {
    to: ROUTES.relatorios,
    label: 'Relatórios',
    icon: MODULE_ICONS.relatorios,
    pipelineStep: 6,
    pipelineBridge: 'Consolidação',
    match: (path: string) => path.startsWith(ROUTES.relatorios),
  },
] as const;

/** Estrutura institucional da câmara (sidebar — seção Institucional). */
export const INSTITUTIONAL_NAV = [
  {
    to: ROUTES.camara.parlamentares,
    label: 'Estrutura da Câmara',
    icon: MODULE_ICONS.camara,
    match: (path: string) => path.startsWith(ROUTES.camara.root),
  },
] as const;

/** Administração da plataforma SIGL (sidebar — somente MASTER). */
export const ADMIN_NAV = [
  {
    to: ROUTES.usuarios,
    label: 'Usuários SIGL',
    icon: MODULE_ICONS.usuarios,
    match: (path: string) => path.startsWith(ROUTES.usuarios),
  },
] as const;

export const CAMARA_TABS = [
  { to: ROUTES.camara.parlamentares, label: 'Parlamentares', icon: MODULE_ICONS.parlamentares },
  { to: ROUTES.camara.comissoes, label: 'Comissões', icon: MODULE_ICONS.comissoes },
  { to: ROUTES.camara.frentes, label: 'Frentes', icon: MODULE_ICONS.frentes },
  { to: ROUTES.camara.mesaDiretora, label: 'Mesa diretora', icon: MODULE_ICONS.mesaDiretora },
  { to: ROUTES.camara.autores, label: 'Autores', icon: MODULE_ICONS.autores },
  { to: ROUTES.camara.legislaturas, label: 'Legislaturas', icon: MODULE_ICONS.legislaturas },
] as const;

/** Redirects de rotas legadas (manter ao renomear). */
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
