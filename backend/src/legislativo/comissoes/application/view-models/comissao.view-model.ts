import {
    COMMITTEE_MEMBER_ROLE_LABELS,
    CommitteeMemberRole,
} from '../../domain/enums/committee-member-role.enum';
import { CommitteeWithRelations } from '../../domain/repositories/committee.repository';

export class ComissaoViewModel {
    static toHttp(data: CommitteeWithRelations) {
        const p = data.entity.toPrimitives();
        return {
            id: p.id,
            name: p.name,
            ...(p.acronym ? { acronym: p.acronym } : {}),
            type: p.type,
            purpose: p.purpose,
            ...(p.startDate ? { startDate: p.startDate } : {}),
            ...(p.endDate ? { endDate: p.endDate } : {}),
            status: p.status,
            ...(p.notes ? { notes: p.notes } : {}),
            members: data.members.map((member) => ({
                id: member.id,
                role: member.role,
                roleLabel: COMMITTEE_MEMBER_ROLE_LABELS[member.role],
                parliamentarian: member.parliamentarian,
                createdAt: member.createdAt,
            })),
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        };
    }
}
