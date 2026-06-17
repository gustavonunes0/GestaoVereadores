export type ParliamentarianProfileHttp = {
    id: string;
    parliamentaryName: string;
    officeNumber?: string;
    photoUrl?: string;
    biography?: string;
    status: string;
    nomeCompleto?: string;
    email?: string;
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

type ProfileRow = {
    id: string;
    parliamentaryName: string;
    officeNumber: string | null;
    photoUrl: string | null;
    biography: string | null;
    status: string;
    parliamentarianUser: {
        user: {
            firstName: string;
            lastName: string;
            email: string;
        };
        politicalParty: {
            id: string;
            name: string;
            acronym: string;
            flagUrl: string | null;
        } | null;
    } | null;
    mandates: Array<{
        id: string;
        startedAt: Date;
        endedAt: Date | null;
        status: string;
        legislature: { id: string; number: number };
    }>;
    committeeMembers: Array<{
        committee: { id: string; name: string; acronym: string | null };
    }>;
    parliamentaryFrontMembers: Array<{
        front: { id: string; name: string };
    }>;
};

export class ParliamentarianProfileViewModel {
    static toHttp(row: ProfileRow): ParliamentarianProfileHttp {
        const parlUser = row.parliamentarianUser;
        const user = parlUser?.user;
        const party = parlUser?.politicalParty;
        return {
            id: row.id,
            parliamentaryName: row.parliamentaryName,
            status: row.status,
            ...(row.officeNumber ? { officeNumber: row.officeNumber } : {}),
            ...(row.photoUrl ? { photoUrl: row.photoUrl } : {}),
            ...(row.biography ? { biography: row.biography } : {}),
            ...(user
                ? {
                      nomeCompleto: `${user.firstName} ${user.lastName}`.trim(),
                      email: user.email,
                  }
                : {}),
            ...(party
                ? {
                      partido: {
                          id: party.id,
                          nome: party.name,
                          sigla: party.acronym,
                          ...(party.flagUrl
                              ? { flagUrl: party.flagUrl }
                              : {}),
                      },
                  }
                : {}),
            mandatos: row.mandates.map((m) => ({
                id: m.id,
                legislaturaNumero: m.legislature.number,
                startedAt: m.startedAt.toISOString(),
                ...(m.endedAt ? { endedAt: m.endedAt.toISOString() } : {}),
                status: m.status,
            })),
            comissoes: row.committeeMembers.map((c) => ({
                id: c.committee.id,
                nome: c.committee.name,
                ...(c.committee.acronym ? { sigla: c.committee.acronym } : {}),
            })),
            frentes: row.parliamentaryFrontMembers.map((f) => ({
                id: f.front.id,
                nome: f.front.name,
            })),
        };
    }
}
