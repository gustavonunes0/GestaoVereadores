import { StatusMateria } from '@prisma/client';
import {
    MATTER_STATUS_LABELS,
    MatterStatus,
} from '../../domain/enums/matter-status.enum';
import { getMatterWorkflowCapabilities } from '../../domain/services/materia-workflow';
import { MatterTramitationEntry } from '../../domain/types/matter-workflow.types';

type ParlamentarResumo = {
    id: string;
    pessoa?: { nomeParlamentar?: string | null; nome?: string | null };
};

type ParliamentarianSummary = {
    id: string;
    parliamentaryName: string;
    officeNumber: string | null;
    photoUrl?: string | null;
    parliamentarianUser?: {
        politicalParty?: { id: string; name: string; acronym: string } | null;
    } | null;
};

function mapParlamentar(parlamentar: ParlamentarResumo | null | undefined) {
    if (!parlamentar) return null;
    return {
        id: parlamentar.id,
        nome:
            parlamentar.pessoa?.nomeParlamentar ??
            parlamentar.pessoa?.nome ??
            null,
    };
}

function mapParliamentarianSummary(
    parliamentarian: ParliamentarianSummary | null | undefined,
) {
    if (!parliamentarian) return null;
    const politicalParty =
        parliamentarian.parliamentarianUser?.politicalParty ?? null;
    return {
        id: parliamentarian.id,
        parliamentaryName: parliamentarian.parliamentaryName,
        officeNumber: parliamentarian.officeNumber,
        photoUrl: parliamentarian.photoUrl ?? null,
        ...(politicalParty ? { politicalParty } : {}),
    };
}

function parseTramitacaoHistory(
    tramitacaoJson: unknown,
): MatterTramitationEntry[] {
    if (!Array.isArray(tramitacaoJson)) return [];
    return tramitacaoJson as MatterTramitationEntry[];
}

function buildIdentificacao(data: MateriaPrismaPayload): string {
    const sigla = data.sigla ?? data.tipo?.sigla ?? null;
    const tipoLabel = sigla ?? data.tipo?.nome ?? 'Matéria';
    const anoValor = data.ano?.valor;

    if (data.numero != null) {
        return `${tipoLabel} nº ${data.numero}/${anoValor ?? '?'}`;
    }

    if (data.numeroProtocolo != null) {
        return anoValor != null
            ? `${tipoLabel} Prot. nº ${data.numeroProtocolo}/${anoValor}`
            : `${tipoLabel} Prot. nº ${data.numeroProtocolo}`;
    }

    return tipoLabel;
}

function mapAutorPrincipal(data: MateriaPrismaPayload) {
    if (data.authorParliamentarian) {
        return {
            id: data.authorParliamentarian.id,
            tipo: 'parlamentar' as const,
            nome: data.authorParliamentarian.parliamentaryName,
            parlamentarId: data.authorParliamentarian.id,
            photoUrl: data.authorParliamentarian.photoUrl ?? null,
            subtitulo: data.authorParliamentarian.officeNumber
                ? `Gabinete ${data.authorParliamentarian.officeNumber}`
                : null,
        };
    }

    const externo = data.autor?.autorExterno;
    if (externo?.nome) {
        const subtitulo = [externo.cargo, externo.instituicao]
            .filter(Boolean)
            .join(' — ');
        return {
            id: externo.id,
            tipo: 'externo' as const,
            nome: externo.nome,
            photoUrl: null,
            subtitulo: subtitulo || null,
        };
    }

    if (data.autor?.nome) {
        return {
            id: data.autor.id,
            tipo: 'externo' as const,
            nome: data.autor.nome,
            photoUrl: null,
            subtitulo: null,
        };
    }

    if (data.autorId) {
        return { id: data.autorId, tipo: 'externo' as const, nome: '—' };
    }

    return null;
}

function mapRelatorPrincipal(data: MateriaPrismaPayload) {
    if (data.rapporteurParliamentarian) {
        return {
            id: data.rapporteurParliamentarian.id,
            nome: data.rapporteurParliamentarian.parliamentaryName,
            parlamentarId: data.rapporteurParliamentarian.id,
        };
    }

    const legado = mapParlamentar(data.relator);
    if (!legado?.nome) return null;

    return {
        id: legado.id,
        nome: legado.nome,
        parlamentarId: legado.id,
    };
}

/** Payload Prisma enriquecido retornado pelo repositório legado. */
export type MateriaPrismaPayload = {
    id: string;
    tenantId: string;
    tipoId: string;
    ementa: string;
    numero: number | null;
    numeroProtocolo?: number | null;
    anoId: string | null;
    status: StatusMateria;
    emTramitacao: boolean;
    tramitacaoJson: unknown;
    autorId: string | null;
    relatorId: string | null;
    primeiroAutorId?: string | null;
    authorParliamentarianId?: string | null;
    rapporteurParliamentarianId?: string | null;
    createdAt: Date;
    updatedAt: Date;
    sigla?: string | null;
    dataProtocolo?: Date | null;
    textoOriginalUrl?: string | null;
    tipo?: { id: string; nome: string; sigla?: string | null } | null;
    ano?: { id: string; valor: number } | null;
    autor?: {
        id: string;
        nome: string;
        autorExterno?: {
            id: string;
            nome: string;
            cargo?: string | null;
            instituicao?: string | null;
        } | null;
    } | null;
    relator?: ParlamentarResumo | null;
    primeiroAutor?: ParlamentarResumo | null;
    coautores?: Array<{ parlamentar: ParlamentarResumo }>;
    matterCoauthors?: Array<{
        id: string;
        ordem: number;
        parliamentarian: ParliamentarianSummary;
    }>;
    authorParliamentarian?: ParliamentarianSummary | null;
    rapporteurParliamentarian?: ParliamentarianSummary | null;
    materiaAutores?: Array<{ id: string; ordem: number; autor: { id: string; nome: string } }>;
    statusTramitacao?: { id: string; nome: string } | null;
    unidadeTramitacaoDestino?: { id: string; nome: string } | null;
    pautaItens?: unknown[];
    normas?: unknown[];
};

export class MatterViewModel {
    static toHttp(data: MateriaPrismaPayload) {
        const status = data.status as MatterStatus;
        const capabilities = getMatterWorkflowCapabilities(data.status);
        const tramitacao = parseTramitacaoHistory(data.tramitacaoJson);
        const ultimaTramitacao =
            tramitacao.length > 0 ? tramitacao[tramitacao.length - 1] : null;
        const tipoSigla = data.sigla ?? data.tipo?.sigla ?? null;

        return {
            id: data.id,
            tenantId: data.tenantId,
            identificacao: buildIdentificacao(data),
            sigla: tipoSigla,
            tipo: data.tipo
                ? {
                      id: data.tipo.id,
                      nome: data.tipo.nome,
                      ...(tipoSigla ? { sigla: tipoSigla } : {}),
                  }
                : { id: data.tipoId },
            numero: data.numero,
            numeroProtocolo: data.numeroProtocolo ?? null,
            ano: data.ano
                ? { id: data.ano.id, valor: data.ano.valor }
                : data.anoId
                  ? { id: data.anoId }
                  : null,
            ementa: data.ementa,
            status: {
                value: status,
                label: MATTER_STATUS_LABELS[status],
            },
            emTramitacao: data.emTramitacao,
            dataProtocolo: data.dataProtocolo ?? null,
            textoOriginalUrl: data.textoOriginalUrl ?? null,
            autor: mapAutorPrincipal(data),
            relator: mapRelatorPrincipal(data),
            statusTramitacao: data.statusTramitacao
                ? { id: data.statusTramitacao.id, nome: data.statusTramitacao.nome }
                : null,
            unidadeTramitacao: data.unidadeTramitacaoDestino
                ? {
                      id: data.unidadeTramitacaoDestino.id,
                      nome: data.unidadeTramitacaoDestino.nome,
                  }
                : null,
            ultimaTramitacao: ultimaTramitacao
                ? {
                      data: ultimaTramitacao.em,
                      status: ultimaTramitacao.status,
                      observacao: ultimaTramitacao.observacao ?? null,
                  }
                : null,
            coautores: (data.coautores ?? []).map((item) => ({
                parlamentar: mapParlamentar(item.parlamentar),
            })),
            autoresAdicionais: (data.materiaAutores ?? []).map((item) => ({
                id: item.id,
                ordem: item.ordem,
                autor: { id: item.autor.id, nome: item.autor.nome },
            })),
            primeiroAutor: mapParlamentar(data.primeiroAutor),
            authorship: {
                authorParliamentarian: data.authorParliamentarian
                    ? mapParliamentarianSummary(data.authorParliamentarian)
                    : null,
                rapporteurParliamentarian: data.rapporteurParliamentarian
                    ? mapParliamentarianSummary(data.rapporteurParliamentarian)
                    : null,
                coauthors: (data.matterCoauthors ?? []).map((item) => ({
                    id: item.id,
                    ordem: item.ordem,
                    parliamentarian: mapParliamentarianSummary(
                        item.parliamentarian,
                    ),
                })),
            },
            workflow: {
                capabilities,
                tramitacao,
                pautaCount: data.pautaItens?.length ?? 0,
                normasCount: data.normas?.length ?? 0,
            },
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        };
    }
}
