import { BoardWithRelations } from '../../domain/repositories/board.repository';

export class MesaDiretoraViewModel {
    static toHttp(data: BoardWithRelations) {
        const p = data.entity.toPrimitives();
        return {
            id: p.id,
            name: p.name,
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
            startDate: p.startDate,
            ...(p.endDate ? { endDate: p.endDate } : {}),
            status: p.status,
            ...(p.notes ? { notes: p.notes } : {}),
            members: data.members.map((member) => ({
                id: member.id,
                parliamentarian: member.parliamentarian,
                boardRole: member.boardRole,
                createdAt: member.createdAt,
            })),
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        };
    }
}
