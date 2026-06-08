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
    politicalParty?: { id: string; name: string; acronym: string } | null;
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
    return {
        id: parliamentarian.id,
        parliamentaryName: parliamentarian.parliamentaryName,
        officeNumber: parliamentarian.officeNumber,
        ...(parliamentarian.politicalParty
            ? { politicalParty: parliamentarian.politicalParty }
            : {}),
    };
}

function parseTramitacaoHistory(
    tramitacaoJson: unknown,
): MatterTramitationEntry[] {
    if (!Array.isArray(tramitacaoJson)) return [];
    return tramitacaoJson as MatterTramitationEntry[];
}

/** Payload Prisma enriquecido retornado pelo repositório legado. */
export type MateriaPrismaPayload = {
    id: string;
    tenantId: string;
    tipoId: string;
    ementa: string;
    numero: number | null;
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
    tipo?: { id: string; nome: string } | null;
    ano?: { id: string; valor: number } | null;
    autor?: { id: string; nome: string } | null;
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
    pautaItens?: unknown[];
    normas?: unknown[];
};

export class MatterViewModel {
    static toHttp(data: MateriaPrismaPayload) {
        const status = data.status as MatterStatus;
        const capabilities = getMatterWorkflowCapabilities(data.status);
        const tramitacao = parseTramitacaoHistory(data.tramitacaoJson);

        return {
            id: data.id,
            tenantId: data.tenantId,
            tipo: data.tipo
                ? { id: data.tipo.id, nome: data.tipo.nome }
                : { id: data.tipoId },
            numero: data.numero,
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
            autor: data.autor
                ? { id: data.autor.id, nome: data.autor.nome }
                : data.autorId
                  ? { id: data.autorId }
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
            relator: mapParlamentar(data.relator),
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
