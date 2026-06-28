/** Rotas da API — fonte única de verdade. Espelham os controllers do backend NestJS. */
export const API_PATHS = {
    // ── Auth ──────────────────────────────────────────────────────────────
    authLogin:   '/auth/login',
    authMe:      '/auth/me',

    // ── Domínios (lookups) ────────────────────────────────────────────────
    dominios:    '/dominios',

    // ── Identidade ────────────────────────────────────────────────────────
    usuarios:           '/identidade/usuarios',
    tenantPartners:     '/identidade/tenant-partners',
    tenantPartnerUsuario: (id: string) => `/identidade/tenant-partners/${id}/usuario`,

    // ── Legislativo — base ────────────────────────────────────────────────
    legislaturas:            '/legislative/legislaturas',
    parlamentares:           '/legislative/parlamentares',
    parlamentarianUsersAtivos: '/legislative/parlamentares/usuarios/ativos',
    parlamentarById:         (id: string) => `/legislative/parlamentares/${id}`,
    parlamentarUsers:        (id: string) => `/legislative/parlamentares/${id}/usuarios`,
    parlamentarUserById:     (pid: string, uid: string) => `/legislative/parlamentares/${pid}/usuarios/${uid}`,
    parlamentarMe:           '/legislative/parlamentares/me/perfil',
    parlamentarMeBiografia:  '/legislative/parlamentares/me/biografia',
    parlamentarMandatos:     (id: string) => `/legislative/parlamentares/${id}/mandatos`,
    parlamentarAcesso:       (id: string) => `/legislative/parlamentares/${id}/acesso`,
    usuariosBusca:           '/identidade/usuarios',
    partidosPoliticos:       '/legislative/partidos-politicos',
    comissoes:          '/legislative/comissoes',
    frentes:            '/legislative/frentes-parlamentares',
    mesaDiretora:       '/legislative/mesa-diretora',

    // ── Matérias ──────────────────────────────────────────────────────────
    materias:            '/legislative/materias',
    materiasMinhas:      '/legislative/materias/minhas',
    materiasOpcoesAutor: '/legislative/materias/opcoes-autor',
    materiasListarTenantPartners: '/legislative/materias/tenant-partners',
    materiasListarPartners: '/legislative/materias/tenant-partners',
    materiaById:         (id: string) => `/legislative/materias/${id}`,
    materiasTextoOriginal: (id: string) => `/legislative/materias/${id}/texto-original`,
    materiaTextoOriginal: (id: string) => `/legislative/materias/${id}/texto-original`,
    materiasAutoria:     (id: string) => `/legislative/materias/${id}/autoria`,
    materiaAutoria:      (id: string) => `/legislative/materias/${id}/autoria`,
    materiasAutoriaParlamentar: (id: string) => `/legislative/materias/${id}/autoria/autor-parlamentar`,
    materiasAutoriaExterno: (id: string) => `/legislative/materias/${id}/autoria/autor-externo`,
    materiasTramitar:    (id: string) => `/legislative/materias/${id}/tramitar`,
    materiaTramitar:     (id: string) => `/legislative/materias/${id}/tramitar`,
    materiasTramitacao:  (id: string) => `/legislative/materias/${id}/tramitacao`,
    materiaTramitacao:   (id: string) => `/legislative/materias/${id}/tramitacao`,
    materiasAutores:     (id: string) => `/legislative/materias/${id}/autores`,
    materiasAutor:       (id: string, autorId: string) => `/legislative/materias/${id}/autores/${autorId}`,
    materiaCoautores:    (id: string) => `/legislative/materias/${id}/autoria/coautores`,
    materiaCoautorById:  (mid: string, cid: string) =>
        `/legislative/materias/${mid}/autoria/coautores/${cid}`,
    materiasPublicacoes: (id: string) => `/legislative/materias/${id}/publicacoes`,

    // ── Domínios extras ───────────────────────────────────────────────────
    tiposMateria:            '/dominios/tipos-materia',
    integracoesMicrofone:    '/dominios/integracoes-microfone',

    // ── Sessões Plenárias ─────────────────────────────────────────────────
    sessoes:             '/legislative/sessoes-plenarias',
    sessoesContextoLegislatura: '/legislative/sessoes-plenarias/contexto-legislatura',
    sessaoById:          (id: string) => `/legislative/sessoes-plenarias/${id}`,
    sessoesAbrir:        (id: string) => `/legislative/sessoes-plenarias/${id}/abrir`,
    sessoesSuspender:    (id: string) => `/legislative/sessoes-plenarias/${id}/suspender`,
    sessoesEncerrar:     (id: string) => `/legislative/sessoes-plenarias/${id}/encerrar`,
    sessoesCancelar:     (id: string) => `/legislative/sessoes-plenarias/${id}/cancelar`,
    sessoesQuorum:       (id: string) => `/legislative/sessoes-plenarias/${id}/quorum`,
    sessaoJitsiToken:    (id: string) => `/legislative/sessoes-plenarias/${id}/jitsi-token`,
    sessoesPauta:        (id: string) => `/legislative/sessoes-plenarias/${id}/pauta`,
    sessoesPautaItem:    (sid: string, iid: string) => `/legislative/sessoes-plenarias/${sid}/pauta/${iid}`,
    sessoesPautaPublicar:(id: string) => `/legislative/sessoes-plenarias/${id}/pauta/publicar`,
    sessoesPresencas:        (id: string) => `/legislative/sessoes-plenarias/${id}/presencas`,
    sessaoPresencaToggle:    (id: string, presencaId: string) =>
                                 `/legislative/sessoes-plenarias/${id}/presencas/${presencaId}`,
    tiposSessao:             '/dominios/tipos-sessao',

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
