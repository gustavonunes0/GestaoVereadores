/** Rotas da API — fonte única de verdade. Espelham os controllers do backend NestJS. */
export const API_PATHS = {
    // ── Auth ──────────────────────────────────────────────────────────────
    authLogin:   '/auth/login',
    authMe:      '/auth/me',

    // ── Domínios (lookups) ────────────────────────────────────────────────
    dominios:    '/dominios',

    // ── Identidade ────────────────────────────────────────────────────────
    usuarios:           '/identidade/usuarios',
    autoresExternos:    '/identidade/autores-externos',

    // ── Legislativo — base ────────────────────────────────────────────────
    legislaturas:       '/legislative/legislaturas',
    parlamentares:      '/legislative/parlamentares',
    partidosPoliticos:  '/legislative/partidos-politicos',
    comissoes:          '/legislative/comissoes',
    frentes:            '/legislative/frentes-parlamentares',
    mesaDiretora:       '/legislative/mesa-diretora',

    // ── Matérias ──────────────────────────────────────────────────────────
    materias:            '/legislative/materias',
    materiasOpcoesAutor: '/legislative/materias/opcoes-autor',
    materiasAutoresExternos: '/legislative/materias/autores-externos',
    materiasTextoOriginal: (id: string) => `/legislative/materias/${id}/texto-original`,
    materiasAutoria:     (id: string) => `/legislative/materias/${id}/autoria`,
    materiasAutoriaParlamentar: (id: string) => `/legislative/materias/${id}/autoria/autor-parlamentar`,
    materiasAutoriaExterno: (id: string) => `/legislative/materias/${id}/autoria/autor-externo`,
    materiasTramitar:    (id: string) => `/legislative/materias/${id}/tramitar`,
    materiasAutores:     (id: string) => `/legislative/materias/${id}/autores`,
    materiasAutor:       (id: string, autorId: string) => `/legislative/materias/${id}/autores/${autorId}`,
    materiasPublicacoes: (id: string) => `/legislative/materias/${id}/publicacoes`,
    materiasTramitacao:  (id: string) => `/legislative/materias/${id}/tramitacao`,

    // ── Sessões Plenárias ─────────────────────────────────────────────────
    sessoes:             '/legislative/sessoes-plenarias',
    sessoesAbrir:        (id: string) => `/legislative/sessoes-plenarias/${id}/abrir`,
    sessoesSuspender:    (id: string) => `/legislative/sessoes-plenarias/${id}/suspender`,
    sessoesEncerrar:     (id: string) => `/legislative/sessoes-plenarias/${id}/encerrar`,
    sessoesCancelar:     (id: string) => `/legislative/sessoes-plenarias/${id}/cancelar`,
    sessoesQuorum:       (id: string) => `/legislative/sessoes-plenarias/${id}/quorum`,
    sessoesPauta:        (id: string) => `/legislative/sessoes-plenarias/${id}/pauta`,
    sessoesPautaPublicar:(id: string) => `/legislative/sessoes-plenarias/${id}/pauta/publicar`,
    sessoesPresencas:    (id: string) => `/legislative/sessoes-plenarias/${id}/presencas`,

    // ── Votações ──────────────────────────────────────────────────────────
    votacoes:            '/legislative/votacoes',
    votacoesVotos:       (id: string) => `/legislative/votacoes/${id}/votos`,
    votacoesEncerrar:    (id: string) => `/legislative/votacoes/${id}/encerrar`,

    // ── Agenda ────────────────────────────────────────────────────────────
    agenda:              '/legislative/agenda-legislativa',
    agendaVincularSessao:(id: string) => `/legislative/agenda-legislativa/${id}/vincular-sessao`,

    // ── Normas Jurídicas (controller: controle-juridico/normas → /api/normas) ──
    normas:              '/normas',
    normaPublica:        '/normas/public',
    normasSancao:        (id: string) => `/normas/${id}/sancao`,
    normasVeto:          (id: string) => `/normas/${id}/veto`,
    normasPromulgacao:   (id: string) => `/normas/${id}/promulgacao`,
    normasPublicacao:    (id: string) => `/normas/${id}/publicacao`,
    normasRevogar:       (id: string) => `/normas/${id}/revogacao`,

    // ── Atos Administrativos ─────────────────────────────────────────────
    atos:               '/atos',

    // ── Relatórios ────────────────────────────────────────────────────────
    relatorioAtividade: '/relatorios/atividade-legislativa/completo',
    relatorioPresenca:  '/relatorios/presenca',

    // ── Público (sem auth) ────────────────────────────────────────────────
    publicAgenda:       '/public/agenda',
    publicNormas:       '/normas/public',
} as const;
