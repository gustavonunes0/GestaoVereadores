import { PoliticalPartyEntity } from '../../domain/entities/political-party.entity';

export type PoliticalPartyHttp = {
    id: string;
    name: string;
    acronym: string;
    ideology?: string;
    flagUrl?: string;
    createdAt: Date;
    updatedAt: Date;
};

export class PoliticalPartyViewModel {
    static toHttp(entity: PoliticalPartyEntity): PoliticalPartyHttp {
        const p = entity.toPrimitives();
        return {
            id: p.id,
            name: p.name,
            acronym: p.acronym,
            ...(p.ideology ? { ideology: p.ideology } : {}),
            ...(p.flagUrl ? { flagUrl: p.flagUrl } : {}),
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        };
    }
}
