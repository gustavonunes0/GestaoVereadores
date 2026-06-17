import {
    MATTER_AUTHOR_TYPE_LABELS,
    MatterAuthorType,
} from '../../domain/enums/matter-author-type.enum';
import { MateriaPrismaPayload } from './matter.view-model';

type ParliamentarianAuthorshipSummary = {
    id: string;
    parliamentaryName: string;
    officeNumber: string | null;
    parliamentarianUser?: {
        politicalParty?: { id: string; name: string; acronym: string } | null;
    } | null;
};

function mapParliamentarian(
    row: ParliamentarianAuthorshipSummary | null | undefined,
) {
    if (!row) return null;
    const politicalParty = row.parliamentarianUser?.politicalParty ?? null;
    return {
        id: row.id,
        parliamentaryName: row.parliamentaryName,
        officeNumber: row.officeNumber,
        ...(politicalParty ? { politicalParty } : {}),
    };
}

export type MatterAuthorshipPayload = MateriaPrismaPayload & {
    authorParliamentarian?: ParliamentarianAuthorshipSummary | null;
    rapporteurParliamentarian?: ParliamentarianAuthorshipSummary | null;
    matterCoauthors?: Array<{
        id: string;
        ordem: number;
        parliamentarian: ParliamentarianAuthorshipSummary;
    }>;
    autor?: {
        id: string;
        nome: string;
        guestUser?: {
            id: string;
            fullName: string;
            type: string;
        } | null;
        autorExterno?: {
            id: string;
            nome: string;
            tipoAutorId: string;
        } | null;
        parliamentarian?: ParliamentarianAuthorshipSummary | null;
    } | null;
};

function buildExternalAuthor(autor: NonNullable<MatterAuthorshipPayload['autor']>) {
    if (autor.autorExterno) {
        return {
            type: MatterAuthorType.EXTERNAL,
            label: MATTER_AUTHOR_TYPE_LABELS[MatterAuthorType.EXTERNAL],
            autorId: autor.id,
            autorExterno: {
                id: autor.autorExterno.id,
                nome: autor.autorExterno.nome,
                tipoAutorId: autor.autorExterno.tipoAutorId,
            },
        };
    }

    if (autor.guestUser) {
        return {
            type: MatterAuthorType.EXTERNAL,
            label: MATTER_AUTHOR_TYPE_LABELS[MatterAuthorType.EXTERNAL],
            autorId: autor.id,
            guestUser: {
                id: autor.guestUser.id,
                fullName: autor.guestUser.fullName,
                guestType: autor.guestUser.type,
            },
        };
    }

    return null;
}

export class MatterAuthorshipViewModel {
    static toHttp(data: MatterAuthorshipPayload) {
        const parliamentaryAuthor = mapParliamentarian(
            data.authorParliamentarian,
        );
        const externalAuthor = data.autor
            ? buildExternalAuthor(data.autor)
            : null;

        const primaryAuthor = parliamentaryAuthor
            ? {
                  type: MatterAuthorType.PARLIAMENTARIAN,
                  label: MATTER_AUTHOR_TYPE_LABELS[
                      MatterAuthorType.PARLIAMENTARIAN
                  ],
                  parliamentarian: parliamentaryAuthor,
              }
            : externalAuthor;

        return {
            matterId: data.id,
            primaryAuthor,
            coauthors: (data.matterCoauthors ?? [])
                .sort((a, b) => a.ordem - b.ordem)
                .map((item) => ({
                    id: item.id,
                    ordem: item.ordem,
                    parliamentarian: mapParliamentarian(item.parliamentarian),
                })),
            rapporteur: mapParliamentarian(data.rapporteurParliamentarian),
            legacy: {
                autorId: data.autorId,
                primeiroAutorId: data.primeiroAutorId ?? null,
                relatorId: data.relatorId,
            },
        };
    }
}
