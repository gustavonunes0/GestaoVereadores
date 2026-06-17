import { ParliamentarianHttp } from '../../../legislativo/parlamentares/application/view-models/parliamentarian.view-model';
import { ParliamentarianProfileHttp } from '../../../legislativo/parlamentares/application/view-models/parliamentarian-profile.view-model';

export type PublicParliamentarianListItemHttp = {
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

export type PublicParliamentarianDetailHttp = {
    id: string;
    parliamentaryName: string;
    officeNumber?: string;
    photoUrl?: string;
    biography?: string;
    status: string;
    nomeCompleto?: string;
    partido?: {
        id: string;
        nome: string;
        sigla: string;
        flagUrl?: string;
    };
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

export class PublicParliamentarianViewModel {
    static toListItem(row: ParliamentarianHttp): PublicParliamentarianListItemHttp {
        const party = row.user?.politicalParty;
        return {
            id: row.id,
            parliamentaryName: row.parliamentaryName,
            status: row.status,
            ...(row.officeNumber ? { officeNumber: row.officeNumber } : {}),
            ...(row.photoUrl ? { photoUrl: row.photoUrl } : {}),
            ...(party
                ? {
                      partido: {
                          id: party.id,
                          nome: party.name,
                          sigla: party.acronym,
                          ...(party.flagUrl ? { flagUrl: party.flagUrl } : {}),
                      },
                  }
                : {}),
        };
    }

    static toDetail(
        row: ParliamentarianProfileHttp,
    ): PublicParliamentarianDetailHttp {
        return {
            id: row.id,
            parliamentaryName: row.parliamentaryName,
            status: row.status,
            ...(row.officeNumber ? { officeNumber: row.officeNumber } : {}),
            ...(row.photoUrl ? { photoUrl: row.photoUrl } : {}),
            ...(row.biography ? { biography: row.biography } : {}),
            ...(row.nomeCompleto ? { nomeCompleto: row.nomeCompleto } : {}),
            ...(row.partido ? { partido: row.partido } : {}),
            mandatos: row.mandatos,
            comissoes: row.comissoes,
            frentes: row.frentes,
        };
    }
}
