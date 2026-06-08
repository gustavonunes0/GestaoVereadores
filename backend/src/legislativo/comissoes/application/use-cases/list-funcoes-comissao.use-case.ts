import { Injectable } from '@nestjs/common';
import {
    COMMITTEE_MEMBER_ROLE_LABELS,
    CommitteeMemberRole,
} from '../../domain/enums/committee-member-role.enum';

@Injectable()
export class ListFuncoesComissaoUseCase {
    execute() {
        return Object.values(CommitteeMemberRole).map((role) => ({
            value: role,
            label: COMMITTEE_MEMBER_ROLE_LABELS[role],
        }));
    }
}
