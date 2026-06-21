import { ParliamentarianWithRelations } from '../../domain/repositories/parliamentarian.repository';

export type ParliamentarianHttp = {
    id: string;
    parliamentaryName: string;
    officeNumber?: string;
    photoUrl?: string;
    biography?: string;
    status: string;
    hasAccess: boolean;
    accessStatus?: string;
    user?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        cpf: string;
        politicalParty?: {
            id: string;
            name: string;
            acronym: string;
            flagUrl?: string;
        };
    };
    activeMandatesCount?: number;
    activeMandate?: {
        id: string;
        status: string;
    };
    stats?: {
        authoredMattersCount: number;
        coauthoredMattersCount: number;
        committeeMembersCount: number;
        sessionVotesCount: number;
    };
    committees?: Array<{
        id: string;
        name: string;
        acronym?: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
};

export class ParliamentarianViewModel {
    static toHttp(data: ParliamentarianWithRelations): ParliamentarianHttp {
        const p = data.entity.toPrimitives();
        const party = data.user?.politicalParty;
        const accessActive = data.accessStatus === 'ACTIVE';
        return {
            id: p.id,
            parliamentaryName: p.parliamentaryName,
            status: p.status,
            hasAccess: accessActive && !!data.user,
            ...(data.accessStatus ? { accessStatus: data.accessStatus } : {}),
            ...(data.user
                ? {
                      user: {
                          id: data.user.id,
                          firstName: data.user.firstName,
                          lastName: data.user.lastName,
                          email: data.user.email,
                          cpf: data.user.cpf ?? '',
                          ...(party
                              ? {
                                    politicalParty: {
                                        id: party.id,
                                        name: party.name,
                                        acronym: party.acronym,
                                        ...(party.flagUrl
                                            ? { flagUrl: party.flagUrl }
                                            : {}),
                                    },
                                }
                              : {}),
                      },
                  }
                : {}),
            ...(p.officeNumber ? { officeNumber: p.officeNumber } : {}),
            ...(p.photoUrl ? { photoUrl: p.photoUrl } : {}),
            ...(p.biography ? { biography: p.biography } : {}),
            ...(data.activeMandatesCount !== undefined
                ? { activeMandatesCount: data.activeMandatesCount }
                : {}),
            ...(data.activeMandate ? { activeMandate: data.activeMandate } : {}),
            ...(data.stats ? { stats: data.stats } : {}),
            ...(data.committees
                ? {
                      committees: data.committees.map((c) => ({
                          id: c.id,
                          name: c.name,
                          ...(c.acronym ? { acronym: c.acronym } : {}),
                      })),
                  }
                : {}),
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        };
    }
}
