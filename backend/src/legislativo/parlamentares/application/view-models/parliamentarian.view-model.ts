import { ParliamentarianWithRelations } from '../../domain/repositories/parliamentarian.repository';

export type ParliamentarianHttp = {
    id: string;
    tenantUserId: string;
    parliamentaryName: string;
    officeNumber?: string;
    photoUrl?: string;
    biography?: string;
    status: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    politicalParty?: {
        id: string;
        name: string;
        acronym: string;
        flagUrl?: string;
    };
    activeMandatesCount?: number;
    createdAt: Date;
    updatedAt: Date;
};

export class ParliamentarianViewModel {
    static toHttp(data: ParliamentarianWithRelations): ParliamentarianHttp {
        const p = data.entity.toPrimitives();
        return {
            id: p.id,
            tenantUserId: p.tenantUserId,
            parliamentaryName: p.parliamentaryName,
            status: p.status,
            user: data.user,
            ...(p.officeNumber ? { officeNumber: p.officeNumber } : {}),
            ...(p.photoUrl ? { photoUrl: p.photoUrl } : {}),
            ...(p.biography ? { biography: p.biography } : {}),
            ...(data.politicalParty
                ? {
                      politicalParty: {
                          id: data.politicalParty.id,
                          name: data.politicalParty.name,
                          acronym: data.politicalParty.acronym,
                          ...(data.politicalParty.flagUrl
                              ? { flagUrl: data.politicalParty.flagUrl }
                              : {}),
                      },
                  }
                : {}),
            ...(data.activeMandatesCount !== undefined
                ? { activeMandatesCount: data.activeMandatesCount }
                : {}),
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        };
    }
}
