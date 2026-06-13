/** Rotas da API — espelham os controllers do backend NestJS. */
export const API_PATHS = {
    auth: {
        login: '/auth/login',
        loginCamara: '/auth/login-camara',
        me: '/auth/me',
    },
    dominios: '/dominios',
    usuarios: '/usuarios',
    normas: '/normas',
    atos: '/atos',
    guestUsers: '/guest-users',
    relatorios: {
        atividadeCompleto: '/relatorios/atividade-legislativa/completo',
        presenca: '/relatorios/presenca',
    },
    legislative: {
        legislaturas: '/legislative/legislaturas',
        parlamentares: '/legislative/parlamentares',
        partidos: '/legislative/partidos-politicos',
        comissoes: '/legislative/comissoes',
        frentes: '/legislative/frentes-parlamentares',
        mesaDiretora: '/legislative/mesa-diretora',
        materias: '/legislative/materias',
        sessoes: '/legislative/sessoes-plenarias',
        agenda: '/legislative/agenda-legislativa',
    },
} as const;
