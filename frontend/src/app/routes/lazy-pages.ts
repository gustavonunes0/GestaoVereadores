import { lazy, type ComponentType } from 'react';
import { importWithReload } from './chunk-reload';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lazyPage<T extends ComponentType<any>>(factory: () => Promise<{ default: T }>) {
    return lazy(importWithReload(factory));
}

/** Carregamento sob demanda de todas as páginas da aplicação. */
export const Pages = {
    login: lazyPage(() => import('../../pages/LoginPage').then((m) => ({ default: m.LoginPage }))),

    dashboard: lazyPage(() => import('../../pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))),
    materias: lazyPage(() => import('../../pages/MateriasPage').then((m) => ({ default: m.MateriasPage }))),
    sessoes: lazyPage(() => import('../../pages/SessoesPage').then((m) => ({ default: m.SessoesPage }))),
    agenda: lazyPage(() => import('../../pages/AgendaPage').then((m) => ({ default: m.AgendaPage }))),
    relatorios: lazyPage(() => import('../../pages/RelatoriosPage').then((m) => ({ default: m.RelatoriosPage }))),
    normas: lazyPage(() => import('../../pages/NormasPage').then((m) => ({ default: m.NormasPage }))),
    atos: lazyPage(() => import('../../pages/AtosPage').then((m) => ({ default: m.AtosPage }))),

    camara: lazyPage(() => import('../../pages/CamaraPage').then((m) => ({ default: m.CamaraPage }))),
    parlamentares: lazyPage(() => import('../../pages/ParlamentaresPage').then((m) => ({ default: m.ParlamentaresPage }))),
    comissoes: lazyPage(() => import('../../pages/ComissoesPage').then((m) => ({ default: m.ComissoesPage }))),
    frentes: lazyPage(() => import('../../pages/FrentesPage').then((m) => ({ default: m.FrentesPage }))),
    mesaDiretora: lazyPage(() => import('../../pages/MesaDiretoraPage').then((m) => ({ default: m.MesaDiretoraPage }))),
    autores: lazyPage(() => import('../../pages/AutoresPage').then((m) => ({ default: m.AutoresPage }))),
    legislaturas: lazyPage(() => import('../../pages/LegislaturasPage').then((m) => ({ default: m.LegislaturasPage }))),
    portal: lazyPage(() => import('../../pages/PortalInstitucionalPage').then((m) => ({ default: m.PortalInstitucionalPage }))),
    usuarios: lazyPage(() => import('../../pages/UsuariosPage').then((m) => ({ default: m.UsuariosPage }))),

    sessaoDetalhe: lazyPage(() => import('../../components/sessoes/SessaoDetalhePage').then((m) => ({ default: m.SessaoDetalhePage }))),
    sessaoPainel: lazyPage(() => import('../../components/sessoes/painel/SessaoPainelPage').then((m) => ({ default: m.SessaoPainelPage }))),
    sessaoResumoPublico: lazyPage(() => import('../../pages/publico/SessaoResumoPublicoPage').then((m) => ({ default: m.SessaoResumoPublicoPage }))),

    parlamentarPerfil: lazyPage(() => import('../../pages/parlamentar/ParlamentarPerfilPage').then((m) => ({ default: m.ParlamentarPerfilPage }))),
    parlamentarBiografia: lazyPage(() => import('../../pages/parlamentar/ParlamentarBiografiaPage').then((m) => ({ default: m.ParlamentarBiografiaPage }))),
    parlamentarDashboard: lazyPage(() => import('../../pages/parlamentar/ParlamentarDashboardPage').then((m) => ({ default: m.ParlamentarDashboardPage }))),
    parlamentarMaterias: lazyPage(() => import('../../pages/parlamentar/ParlamentarMateriasPage').then((m) => ({ default: m.ParlamentarMateriasPage }))),
    parlamentarComissoes: lazyPage(() => import('../../pages/parlamentar/ParlamentarComissoesPage').then((m) => ({ default: m.ParlamentarComissoesPage }))),
    parlamentarMandato: lazyPage(() => import('../../pages/parlamentar/ParlamentarMandatoPage').then((m) => ({ default: m.ParlamentarMandatoPage }))),
    parlamentarFiliacao: lazyPage(() => import('../../pages/parlamentar/ParlamentarFiliacaoPage').then((m) => ({ default: m.ParlamentarFiliacaoPage }))),
    parlamentarSessoes: lazyPage(() => import('../../pages/parlamentar/ParlamentarSessoesPage').then((m) => ({ default: m.ParlamentarSessoesPage }))),
    parlamentarSessaoDetalhe: lazyPage(() => import('../../pages/parlamentar/ParlamentarSessaoDetalhePage').then((m) => ({ default: m.ParlamentarSessaoDetalhePage }))),

    platformTenants: lazyPage(() => import('../../pages/platform/PlatformTenantsPage').then((m) => ({ default: m.PlatformTenantsPage }))),
    platformTenantDetail: lazyPage(() => import('../../pages/platform/PlatformTenantDetailPage').then((m) => ({ default: m.PlatformTenantDetailPage }))),
} as const;
