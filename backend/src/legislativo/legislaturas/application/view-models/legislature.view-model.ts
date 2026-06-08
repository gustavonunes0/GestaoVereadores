import { LegislatureEntity } from '../../domain/entities/legislature.entity';

export class LegislatureViewModel {
    static toHttp(entity: LegislatureEntity) {
        const p = entity.toPrimitives();
        return {
            id: p.id,
            number: p.number,
            startDate: p.startDate,
            ...(p.endDate ? { endDate: p.endDate } : {}),
            isCurrent: p.isCurrent,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        };
    }
}
