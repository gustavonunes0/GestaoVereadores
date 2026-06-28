import { lazy } from 'react';

/** Carregamento sob demanda de todas as páginas da aplicação. */
export const Pages = {
    login: lazy(() => import('../../pages/LoginPage').then((m) => ({ default: m.LoginPage }))),

    dashboard: lazy(() => import('../../pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))),
    materias: lazy(() => import('../../pages/MateriasPage').then((m) => ({ default: m.MateriasPage }))),
    sessoes: lazy(() => import('../../pages/SessoesPage').then((m) => ({ default: m.SessoesPage }))),
    agenda: lazy(() => import('../../pages/AgendaPage').then((m) => ({ default: m.AgendaPage }))),
    relatorios: lazy(() => import('../../pages/RelatoriosPage').then((m) => ({ default: m.RelatoriosPage }))),
    normas: lazy(() => import('../../pages/NormasPage').then((m) => ({ default: m.NormasPage }))),
    atos: lazy(() => import('../../pages/AtosPage').then((m) => ({ default: m.AtosPage }))),

    camara: lazy(() => import('../../pages/CamaraPage').then((m) => ({ default: m.CamaraPage }))),
    parlamentares: lazy(() => import('../../pages/ParlamentaresPage').then((m) => ({ default: m.ParlamentaresPage }))),
    comissoes: lazy(() => import('../../pages/ComissoesPage').then((m) => ({ default: m.ComissoesPage }))),
    frentes: lazy(() => import('../../pages/FrentesPage').then((m) => ({ default: m.FrentesPage }))),
    mesaDiretora: lazy(() => import('../../pages/MesaDiretoraPage').then((m) => ({ default: m.MesaDiretoraPage }))),
    autores: lazy(() => import('../../pages/AutoresPage').then((m) => ({ default: m.AutoresPage }))),
    legislaturas: lazy(() => import('../../pages/LegislaturasPage').then((m) => ({ default: m.LegislaturasPage }))),
    portal: lazy(() => import('../../pages/PortalInstitucionalPage').then((m) => ({ default: m.PortalInstitucionalPage }))),
    usuarios: lazy(() => import('../../pages/UsuariosPage').then((m) => ({ default: m.UsuariosPage }))),

    sessaoDetalhe: lazy(() => import('../../components/sessoes/SessaoDetalhePage').then((m) => ({ default: m.SessaoDetalhePage }))),
    sessaoPainel: lazy(() => import('../../components/sessoes/painel/SessaoPainelPage').then((m) => ({ default: m.SessaoPainelPage }))),

    parlamentarPerfil: lazy(() => import('../../pages/parlamentar/ParlamentarPerfilPage').then((m) => ({ default: m.ParlamentarPerfilPage }))),
    parlamentarBiografia: lazy(() => import('../../pages/parlamentar/ParlamentarBiografiaPage').then((m) => ({ default: m.ParlamentarBiografiaPage }))),
    parlamentarDashboard: lazy(() => import('../../pages/parlamentar/ParlamentarDashboardPage').then((m) => ({ default: m.ParlamentarDashboardPage }))),
    parlamentarMaterias: lazy(() => import('../../pages/parlamentar/ParlamentarMateriasPage').then((m) => ({ default: m.ParlamentarMateriasPage }))),
    parlamentarComissoes: lazy(() => import('../../pages/parlamentar/ParlamentarComissoesPage').then((m) => ({ default: m.ParlamentarComissoesPage }))),
    parlamentarMandato: lazy(() => import('../../pages/parlamentar/ParlamentarMandatoPage').then((m) => ({ default: m.ParlamentarMandatoPage }))),
    parlamentarFiliacao: lazy(() => import('../../pages/parlamentar/ParlamentarFiliacaoPage').then((m) => ({ default: m.ParlamentarFiliacaoPage }))),
} as const;
