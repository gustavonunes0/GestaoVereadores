import {
    MATTER_AUTHOR_TYPE_LABELS,
    MatterAuthorType,
} from '../../domain/enums/matter-author-type.enum';
import { MateriaPrismaPayload } from './matter.view-model';

type ParliamentarianAuthorshipSummary = {
    id: string;
    parliamentaryName: string;
    officeNumber: string | null;
    politicalParty?: { id: string; name: string; acronym: string } | null;
};

function mapParliamentarian(
    row: ParliamentarianAuthorshipSummary | null | undefined,
) {
    if (!row) return null;
    return {
        id: row.id,
        parliamentaryName: row.parliamentaryName,
        officeNumber: row.officeNumber,
        ...(row.politicalParty ? { politicalParty: row.politicalParty } : {}),
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
        parliamentarian?: ParliamentarianAuthorshipSummary | null;
    } | null;
};

export class MatterAuthorshipViewModel {
    static toHttp(data: MatterAuthorshipPayload) {
        const parliamentaryAuthor = mapParliamentarian(
            data.authorParliamentarian,
        );
        const externalAuthor = data.autor?.guestUser
            ? {
                  type: MatterAuthorType.EXTERNAL,
                  label: MATTER_AUTHOR_TYPE_LABELS[MatterAuthorType.EXTERNAL],
                  autorId: data.autor.id,
                  guestUser: {
                      id: data.autor.guestUser.id,
                      fullName: data.autor.guestUser.fullName,
                      guestType: data.autor.guestUser.type,
                  },
              }
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
