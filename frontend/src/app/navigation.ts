/**
 * Rotas e menu alinhados ao fluxo legislativo SIGL.
 * Matéria → Tramitação → Sessão (pauta, presença, votação) → Publicação (normas / atos).
 */

export const ROUTES = {
  login: '/login',
  dashboard: '/',
  materias: '/materias',
  sessoes: '/sessoes',
  relatorios: '/relatorios',
  camara: {
    root: '/camara',
    parlamentares: '/camara/parlamentares',
    comissoes: '/camara/comissoes',
    frentes: '/camara/frentes',
    mesaDiretora: '/camara/mesa-diretora',
    autores: '/camara/autores',
    legislaturas: '/camara/legislaturas',
  },
  publicacao: {
    root: '/publicacao',
    normas: '/publicacao/normas',
    atos: '/publicacao/atos',
  },
  usuarios: '/usuarios',
} as const;

/** Itens do fluxo principal (sidebar — seção Fluxo). */
export const WORKFLOW_NAV = [
  {
    to: ROUTES.dashboard,
    label: 'Painel',
    end: true as const,
    match: (path: string) => path === ROUTES.dashboard,
  },
  {
    to: ROUTES.materias,
    label: 'Matérias',
    match: (path: string) => path.startsWith(ROUTES.materias),
  },
  {
    to: ROUTES.sessoes,
    label: 'Sessões',
    match: (path: string) => path.startsWith(ROUTES.sessoes),
  },
  {
    to: ROUTES.publicacao.normas,
    label: 'Publicação',
    match: (path: string) => path.startsWith(ROUTES.publicacao.root),
  },
  {
    to: ROUTES.relatorios,
    label: 'Relatórios',
    match: (path: string) => path.startsWith(ROUTES.relatorios),
  },
] as const;

/** Estrutura institucional da câmara (sidebar — seção Institucional). */
export const INSTITUTIONAL_NAV = [
  {
    to: ROUTES.camara.parlamentares,
    label: 'Estrutura da Câmara',
    match: (path: string) => path.startsWith(ROUTES.camara.root),
  },
] as const;

export const CAMARA_TABS = [
  { to: ROUTES.camara.parlamentares, label: 'Parlamentares' },
  { to: ROUTES.camara.comissoes, label: 'Comissões' },
  { to: ROUTES.camara.frentes, label: 'Frentes' },
  { to: ROUTES.camara.mesaDiretora, label: 'Mesa diretora' },
  { to: ROUTES.camara.autores, label: 'Autores' },
  { to: ROUTES.camara.legislaturas, label: 'Legislaturas' },
] as const;

export const PUBLICACAO_TABS = [
  { to: ROUTES.publicacao.normas, label: 'Normas jurídicas', end: true as const },
  { to: ROUTES.publicacao.atos, label: 'Atos administrativos' },
] as const;

/** Redirects de rotas legadas (manter ao renomear). */
export const LEGACY_REDIRECTS: { from: string; to: string }[] = [
  { from: 'parlamentares', to: ROUTES.camara.parlamentares },
  { from: 'comissoes', to: ROUTES.camara.comissoes },
  { from: 'frentes', to: ROUTES.camara.frentes },
  { from: 'mesa-diretora', to: ROUTES.camara.mesaDiretora },
  { from: 'autores', to: ROUTES.camara.autores },
  { from: 'legislaturas', to: ROUTES.camara.legislaturas },
  { from: 'normas', to: ROUTES.publicacao.normas },
  { from: 'atos', to: ROUTES.publicacao.atos },
];
