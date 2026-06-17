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

    portalHome: lazy(() => import('../../pages/portal/PortalHomePage').then((m) => ({ default: m.PortalHomePage }))),
    portalVereadores: lazy(() => import('../../pages/portal/PortalVereadoresPage').then((m) => ({ default: m.PortalVereadoresPage }))),
    portalVereadorDetail: lazy(() => import('../../pages/portal/PortalVereadorDetailPage').then((m) => ({ default: m.PortalVereadorDetailPage }))),
    portalMesaDiretora: lazy(() => import('../../pages/portal/PortalMesaDiretoraPage').then((m) => ({ default: m.PortalMesaDiretoraPage }))),
    portalComissoes: lazy(() => import('../../pages/portal/PortalComissoesPage').then((m) => ({ default: m.PortalComissoesPage }))),
    portalComissaoDetail: lazy(() => import('../../pages/portal/PortalComissaoDetailPage').then((m) => ({ default: m.PortalComissaoDetailPage }))),
    portalAgenda: lazy(() => import('../../pages/portal/PortalAgendaPage').then((m) => ({ default: m.PortalAgendaPage }))),
    portalNormas: lazy(() => import('../../pages/portal/PortalNormasPage').then((m) => ({ default: m.PortalNormasPage }))),
    portalContato: lazy(() => import('../../pages/portal/PortalContatoPage').then((m) => ({ default: m.PortalContatoPage }))),
    usuarios: lazy(() => import('../../pages/UsuariosPage').then((m) => ({ default: m.UsuariosPage }))),

    parlamentarPerfil: lazy(() => import('../../pages/parlamentar/ParlamentarPerfilPage').then((m) => ({ default: m.ParlamentarPerfilPage }))),
    parlamentarBiografia: lazy(() => import('../../pages/parlamentar/ParlamentarBiografiaPage').then((m) => ({ default: m.ParlamentarBiografiaPage }))),
    parlamentarDashboard: lazy(() => import('../../pages/parlamentar/ParlamentarDashboardPage').then((m) => ({ default: m.ParlamentarDashboardPage }))),
    parlamentarMaterias: lazy(() => import('../../pages/parlamentar/ParlamentarMateriasPage').then((m) => ({ default: m.ParlamentarMateriasPage }))),
    parlamentarComissoes: lazy(() => import('../../pages/parlamentar/ParlamentarComissoesPage').then((m) => ({ default: m.ParlamentarComissoesPage }))),
    parlamentarMandato: lazy(() => import('../../pages/parlamentar/ParlamentarMandatoPage').then((m) => ({ default: m.ParlamentarMandatoPage }))),
    parlamentarFiliacao: lazy(() => import('../../pages/parlamentar/ParlamentarFiliacaoPage').then((m) => ({ default: m.ParlamentarFiliacaoPage }))),
} as const;
