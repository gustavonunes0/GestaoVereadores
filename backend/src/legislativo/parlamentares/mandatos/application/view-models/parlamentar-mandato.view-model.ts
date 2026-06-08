import { ParliamentarianMandateWithLegislature } from '../../domain/repositories/parliamentarian-mandate.repository';

export class ParlamentarMandatoViewModel {
    static toHttp(data: ParliamentarianMandateWithLegislature) {
        const p = data.entity.toPrimitives();
        return {
            id: p.id,
            parliamentarianId: p.parliamentarianId,
            legislatureId: p.legislatureId,
            legislature: {
                id: data.legislature.id,
                number: data.legislature.number,
                startDate: data.legislature.startDate,
                ...(data.legislature.endDate
                    ? { endDate: data.legislature.endDate }
                    : {}),
                isCurrent: data.legislature.isCurrent,
            },
            partyAcronym: p.partyAcronym,
            partyName: p.partyName,
            startedAt: p.startedAt,
            ...(p.endedAt ? { endedAt: p.endedAt } : {}),
            status: p.status,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        };
    }
}
