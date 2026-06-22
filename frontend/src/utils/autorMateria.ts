import type {
    MatterAuthorship,
    CreateMateriaDto as ApiCreateMateriaDto,
} from '../api/legislative/materias.api';
import {
    parseNumeroAnoMateria,
    resolveAnoIdByValor,
} from './materiaIdentificacao';
import type { MateriaStatus } from '../types/legislative';
import type {
    AutorSelecionado,
    CoautorFormItem,
    TipoAutorMateria,
} from '../types/materias';

export type ParlamentarianUserAtivo = {
    parliamentarianId: string;
    parliamentaryName: string;
    userNome: string;
};

export function autorFromMatterAuthorship(
    authorship: MatterAuthorship,
): AutorSelecionado | null {
    const author = authorship.primaryAuthor;
    if (!author) return null;

    if (author.type === 'parliamentarian' && author.parliamentarian) {
        return {
            tipo: 'PARLAMENTAR',
            parlamentarianId: author.parliamentarian.id,
            parlamentarianUserNome: author.parliamentarian.parliamentaryName,
        };
    }

    if (author.type === 'external') {
        const partner = author.tenantPartner;
        if (partner?.id) {
            return {
                tipo: 'TENANT_PARTNER',
                tenantPartnerId: partner.id,
                tenantPartnerNome: partner.nome,
                tenantPartnerUserNome: author.label,
            };
        }
    }

    return null;
}

export function coautoresFromMatterAuthorship(
    authorship: MatterAuthorship,
): CoautorFormItem[] {
    return (authorship.coauthors ?? []).map((c) => ({
        localId: crypto.randomUUID(),
        tipo: 'PARLAMENTAR',
        selecionado: {
            tipo: 'PARLAMENTAR',
            parlamentarianId: c.parliamentarian.id,
            parlamentarianUserNome: c.parliamentarian.parliamentaryName,
        },
    }));
}

export function resolveAutorDisplayNome(autor: AutorSelecionado): string {
    switch (autor.tipo) {
        case 'PARLAMENTAR':
            return autor.parlamentarianUserNome ?? 'Parlamentar';
        case 'TENANT_PARTNER':
            return autor.tenantPartnerUserNome ?? autor.tenantPartnerNome ?? 'Instituição parceira';
        case 'COMISSAO':
            return autor.comissaoNome ?? 'Comissão';
        default:
            return '—';
    }
}

export function validateAutorSelecionado(autor: AutorSelecionado | null): string | null {
    if (!autor?.tipo) return 'Selecione o tipo e o autor.';
    if (autor.tipo === 'PARLAMENTAR' && !autor.parlamentarianId) {
        return 'Selecione o parlamentar autor.';
    }
    if (autor.tipo === 'TENANT_PARTNER' && !autor.tenantPartnerId) {
        return 'Selecione a instituição parceira.';
    }
    if (autor.tipo === 'COMISSAO' && !autor.comissaoId) {
        return 'Selecione a comissão.';
    }
    if (autor.tipo === 'COMISSAO') {
        return 'Autoria por comissão ainda não está disponível no backend.';
    }
    return null;
}

export function validateCoautores(coautores: CoautorFormItem[]): string | null {
    for (let i = 0; i < coautores.length; i += 1) {
        if (!coautores[i].selecionado) {
            return `Complete a seleção do coautor ${i + 1}.`;
        }
        const sel = coautores[i].selecionado!;
        if (sel.tipo !== 'PARLAMENTAR') {
            return `Coautor ${i + 1}: apenas parlamentares podem ser coautores no momento.`;
        }
        if (!sel.parlamentarianId) {
            return `Selecione o parlamentar coautor ${i + 1}.`;
        }
    }
    return null;
}

export function buildCreateMateriaApiBody(params: {
    tipoId: string;
    numeroAno: string;
    anoId: string;
    dataProtocolo?: string;
    ementa: string;
    justificativa?: string;
    status: MateriaStatus;
    autor: AutorSelecionado;
    coautores: CoautorFormItem[];
}): ApiCreateMateriaDto {
    const parsed = parseNumeroAnoMateria(params.numeroAno);
    if (!parsed.ok) {
        throw new Error(parsed.message);
    }

    const body: ApiCreateMateriaDto = {
        tipoId: params.tipoId,
        ementa: params.ementa.trim(),
        status: params.status,
        numero: parsed.numero,
        anoId: params.anoId,
    };
    if (params.dataProtocolo) {
        body.dataProtocolo = params.dataProtocolo;
    }
    if (params.justificativa?.trim()) {
        body.justificativa = params.justificativa.trim();
    }

    if (params.autor.tipo === 'PARLAMENTAR' && params.autor.parlamentarianId) {
        body.authorParliamentarianId = params.autor.parlamentarianId;
    } else if (params.autor.tipo === 'TENANT_PARTNER' && params.autor.tenantPartnerId) {
        body.tenantPartnerId = params.autor.tenantPartnerId;
    }

    const coautorIds = params.coautores
        .map((c) => c.selecionado)
        .filter(
            (sel): sel is AutorSelecionado =>
                sel != null &&
                sel.tipo === 'PARLAMENTAR' &&
                Boolean(sel.parlamentarianId),
        )
        .map((sel) => sel.parlamentarianId!);

    if (coautorIds.length > 0) {
        body.coautorIds = coautorIds;
    }

    return body;
}

export function resolveAnoIdFromNumeroAno(
    numeroAno: string,
    anos: Array<{ id: string; valor: number }>,
): { ok: true; numero: number; anoId: string; ano: number } | { ok: false; message: string } {
    const parsed = parseNumeroAnoMateria(numeroAno);
    if (!parsed.ok) return parsed;

    const anoId = resolveAnoIdByValor(anos, parsed.ano);
    if (!anoId) {
        return {
            ok: false,
            message: `Ano ${parsed.ano} não está cadastrado. Verifique os domínios da câmara.`,
        };
    }

    return { ok: true, numero: parsed.numero, anoId, ano: parsed.ano };
}

export function extractParlamentarianCoautorIds(
    coautores: CoautorFormItem[],
): string[] {
    return coautores
        .map((c) => c.selecionado)
        .filter(
            (sel): sel is AutorSelecionado =>
                sel != null &&
                sel.tipo === 'PARLAMENTAR' &&
                Boolean(sel.parlamentarianId),
        )
        .map((sel) => sel.parlamentarianId!);
}

export function autorTipoIcon(tipo: TipoAutorMateria | 'parlamentar' | 'externo'): string {
    if (tipo === 'PARLAMENTAR' || tipo === 'parlamentar') return 'pi-user';
    if (tipo === 'TENANT_PARTNER' || tipo === 'externo') return 'pi-building';
    return 'pi-users';
}

export function autorTipoTagLabel(tipo: TipoAutorMateria): string {
    switch (tipo) {
        case 'PARLAMENTAR':
            return 'Parlamentar';
        case 'TENANT_PARTNER':
            return 'Inst. Parceira';
        case 'COMISSAO':
            return 'Comissão';
        default:
            return 'Autor';
    }
}

export function autorSelectedChipText(autor: AutorSelecionado): string {
    if (autor.tipo === 'TENANT_PARTNER') {
        const user = autor.tenantPartnerUserNome ?? '';
        const inst = autor.tenantPartnerNome ?? '';
        if (user && inst) return `${user} (${inst})`;
        return user || inst || 'Instituição parceira';
    }
    return resolveAutorDisplayNome(autor);
}
