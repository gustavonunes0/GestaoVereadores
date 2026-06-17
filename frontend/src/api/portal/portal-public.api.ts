import { publicApi, publicApiList } from '../public-api';
import { API_PATHS } from '../paths';
import type { PortalSecoes, PortalSettings } from './portal-config.api';

export type PublicPortalConfig = {
    slug: string;
    name: string;
    logo: string | null;
    titulo: string;
    subtitulo?: string;
    sobre?: string;
    endereco?: string;
    telefone?: string;
    email?: string;
    redesSociais?: PortalSettings['redesSociais'];
    cores?: PortalSettings['cores'];
    bannerUrl?: string;
    secoes: PortalSecoes;
};

export type PublicParliamentarian = {
    id: string;
    parliamentaryName: string;
    officeNumber?: string;
    photoUrl?: string;
    status: string;
    partido?: {
        id: string;
        nome: string;
        sigla: string;
        flagUrl?: string;
    };
};

export type PublicParliamentarianDetail = PublicParliamentarian & {
    biography?: string;
    nomeCompleto?: string;
    mandatos: Array<{
        id: string;
        legislaturaNumero: number;
        startedAt: string;
        endedAt?: string;
        status: string;
    }>;
    comissoes: Array<{
        id: string;
        nome: string;
        sigla?: string;
    }>;
    frentes: Array<{
        id: string;
        nome: string;
    }>;
};

export type PublicAgendaItem = {
    id: string;
    tipo?: string;
    tipoLabel?: string;
    numero?: string;
    titulo?: string;
    dataInicio?: string;
    dataFim?: string;
    mensagem?: string;
    local?: string;
    descricao?: string;
    linkTransmissao?: string;
};

export type PublicNorma = {
    id: string;
    tipo: { id: string; nome: string };
    numero: string;
    ano?: { id: string; valor: number };
    ementa: string;
    status: string;
    dataPublicacao?: string;
    textoIntegralUrl?: string;
};

export type PublicMesaMembro = {
    id: string;
    cargo: string;
    parlamentar: {
        id: string;
        parliamentaryName: string;
        photoUrl?: string;
        partido?: { sigla: string; nome: string; flagUrl?: string };
    };
};

export type PublicMesaDiretora = {
    id: string;
    name: string;
    legislaturaNumero: number;
    members: PublicMesaMembro[];
};

export type PublicComissao = {
    id: string;
    nome: string;
    sigla?: string;
    tipo: string;
    finalidade: string;
    presidente?: { id: string; parliamentaryName: string };
    totalMembros: number;
};

export type PublicComissaoDetail = {
    id: string;
    nome: string;
    sigla?: string;
    tipo: string;
    finalidade: string;
    membros: Array<{
        id: string;
        papel: string;
        papelLabel: string;
        parlamentar: {
            id: string;
            parliamentaryName: string;
            officeNumber?: string;
        };
    }>;
};

export type PublicTransmissao = {
    id: string;
    titulo: string;
    linkTransmissao: string;
    dataInicio?: string;
    dataFim?: string;
    local?: string;
    aoVivo: boolean;
};

export const portalPublicApi = {
    getConfig: (slug: string) =>
        publicApi<PublicPortalConfig>(API_PATHS.publicPortalConfig(slug)),

    listVereadores: (
        slug: string,
        params?: { search?: string; page?: number; limit?: number },
    ) =>
        publicApiList<PublicParliamentarian>(
            API_PATHS.publicPortalVereadores(slug),
            params,
        ),

    getVereador: (slug: string, id: string) =>
        publicApi<PublicParliamentarianDetail>(
            API_PATHS.publicPortalVereador(slug, id),
        ),

    listAgenda: (
        slug: string,
        params?: { page?: number; limit?: number },
    ) =>
        publicApiList<PublicAgendaItem>(
            API_PATHS.publicPortalAgenda(slug),
            params,
        ),

    listNormas: (
        slug: string,
        params?: { search?: string; page?: number; limit?: number },
    ) =>
        publicApiList<PublicNorma>(API_PATHS.publicPortalNormas(slug), params),

    getMesaDiretora: (slug: string) =>
        publicApi<{ mesa: PublicMesaDiretora | null }>(
            API_PATHS.publicPortalMesaDiretora(slug),
        ),

    listComissoes: (
        slug: string,
        params?: { search?: string; page?: number; limit?: number },
    ) =>
        publicApiList<PublicComissao>(
            API_PATHS.publicPortalComissoes(slug),
            params,
        ),

    getComissao: (slug: string, id: string) =>
        publicApi<PublicComissaoDetail>(API_PATHS.publicPortalComissao(slug, id)),

    getTransmissao: (slug: string) =>
        publicApi<{ transmissao: PublicTransmissao | null }>(
            API_PATHS.publicPortalTransmissao(slug),
        ),
};
