import { ParliamentaryFrontWithRelations } from '../../domain/repositories/parliamentary-front.repository';

function mapParliamentarian(
    parliamentarian: ParliamentaryFrontWithRelations['members'][number]['parliamentarian'],
) {
    return {
        id: parliamentarian.id,
        parliamentaryName: parliamentarian.parliamentaryName,
        officeNumber: parliamentarian.officeNumber,
        ...(parliamentarian.politicalParty
            ? { politicalParty: parliamentarian.politicalParty }
            : {}),
    };
}

export class FrenteViewModel {
    static toHttp(data: ParliamentaryFrontWithRelations) {
        const p = data.entity.toPrimitives();
        const coordinatorId = p.coordinatorParliamentarianId;
        return {
            id: p.id,
            name: p.name,
            theme: p.theme,
            ...(p.description ? { description: p.description } : {}),
            ...(p.startDate ? { startDate: p.startDate } : {}),
            ...(p.endDate ? { endDate: p.endDate } : {}),
            status: p.status,
            ...(data.coordinator
                ? { coordinator: mapParliamentarian(data.coordinator) }
                : {}),
            ...(data.createdBy ? { createdBy: data.createdBy } : {}),
            members: data.members.map((member) => ({
                id: member.id,
                isCoordinator: coordinatorId === member.parliamentarian.id,
                parliamentarian: mapParliamentarian(member.parliamentarian),
                createdAt: member.createdAt,
            })),
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        };
    }
}
