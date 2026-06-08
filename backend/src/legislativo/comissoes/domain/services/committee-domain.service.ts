/**
 * Comissões legislativas — base sem parecer formal (MVP).
 */
import {
    CommitteeMemberRole,
    EXCLUSIVE_COMMITTEE_MEMBER_ROLES,
} from '../enums/committee-member-role.enum';

export class CommitteeDomainService {
    assertTenantIdProvided(tenantId?: string) {
        if (!tenantId?.trim()) {
            throw new Error('Tenant é obrigatório para comissão');
        }
    }

    assertDateRange(startDate: Date | null, endDate: Date | null) {
        if (
            startDate &&
            endDate &&
            endDate.getTime() < startDate.getTime()
        ) {
            throw new Error('Data fim não pode ser anterior à data início');
        }
    }

    assertAcronymAvailable(exists: boolean) {
        if (exists) {
            throw new Error('Já existe comissão com esta sigla no tenant');
        }
    }

    assertPurposeProvided(purpose?: string) {
        if (!purpose?.trim()) {
            throw new Error('Finalidade da comissão é obrigatória');
        }
    }

    assertParliamentarianNotOnCommittee(alreadyMember: boolean) {
        if (alreadyMember) {
            throw new Error('Parlamentar já integra esta comissão');
        }
    }

    assertExclusiveRoleNotOccupied(role: CommitteeMemberRole, occupied: boolean) {
        if (
            EXCLUSIVE_COMMITTEE_MEMBER_ROLES.includes(
                role as (typeof EXCLUSIVE_COMMITTEE_MEMBER_ROLES)[number],
            ) &&
            occupied
        ) {
            throw new Error('Esta função já está ocupada nesta comissão');
        }
    }
}
