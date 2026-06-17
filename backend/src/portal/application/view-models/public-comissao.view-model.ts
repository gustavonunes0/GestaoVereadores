import {
    COMMITTEE_MEMBER_ROLE_LABELS,
    CommitteeMemberRole,
} from '../../../legislativo/comissoes/domain/enums/committee-member-role.enum';
import { CommitteeWithRelations } from '../../../legislativo/comissoes/domain/repositories/committee.repository';

export type PublicComissaoListItemHttp = {
    id: string;
    nome: string;
    sigla?: string;
    tipo: string;
    finalidade: string;
    presidente?: {
        id: string;
        parliamentaryName: string;
    };
    totalMembros: number;
};

export type PublicComissaoMembroHttp = {
    id: string;
    papel: string;
    papelLabel: string;
    parlamentar: {
        id: string;
        parliamentaryName: string;
        officeNumber?: string;
    };
};

export type PublicComissaoDetailHttp = {
    id: string;
    nome: string;
    sigla?: string;
    tipo: string;
    finalidade: string;
    membros: PublicComissaoMembroHttp[];
};

export class PublicComissaoViewModel {
    static toListItem(data: CommitteeWithRelations): PublicComissaoListItemHttp {
        const p = data.entity.toPrimitives();
        const presidente = data.members.find(
            (m) => m.role === CommitteeMemberRole.PRESIDENT,
        );
        return {
            id: p.id,
            nome: p.name,
            tipo: p.type,
            finalidade: p.purpose,
            totalMembros: data.members.length,
            ...(p.acronym ? { sigla: p.acronym } : {}),
            ...(presidente
                ? {
                      presidente: {
                          id: presidente.parliamentarian.id,
                          parliamentaryName:
                              presidente.parliamentarian.parliamentaryName,
                      },
                  }
                : {}),
        };
    }

    static toDetail(data: CommitteeWithRelations): PublicComissaoDetailHttp {
        const p = data.entity.toPrimitives();
        return {
            id: p.id,
            nome: p.name,
            tipo: p.type,
            finalidade: p.purpose,
            ...(p.acronym ? { sigla: p.acronym } : {}),
            membros: data.members.map((member) => ({
                id: member.id,
                papel: member.role,
                papelLabel: COMMITTEE_MEMBER_ROLE_LABELS[member.role],
                parlamentar: {
                    id: member.parliamentarian.id,
                    parliamentaryName: member.parliamentarian.parliamentaryName,
                    ...(member.parliamentarian.officeNumber
                        ? { officeNumber: member.parliamentarian.officeNumber }
                        : {}),
                },
            })),
        };
    }
}
