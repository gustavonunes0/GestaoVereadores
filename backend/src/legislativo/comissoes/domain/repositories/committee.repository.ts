import { PaginatedResult } from '../../../../common/dto/pagination.dto';
import { CommitteeEntity } from '../entities/committee.entity';
import { CommitteeMemberRole } from '../enums/committee-member-role.enum';
import { CommitteeStatus } from '../enums/committee-status.enum';
import { CommitteeType } from '../enums/committee-type.enum';

export type ParliamentarianCommitteeSummary = {
    id: string;
    parliamentaryName: string;
    officeNumber: string | null;
};

export type CommitteeMemberWithRelations = {
    id: string;
    role: CommitteeMemberRole;
    parliamentarian: ParliamentarianCommitteeSummary;
    createdAt: Date;
};

export type CommitteeWithRelations = {
    entity: CommitteeEntity;
    members: CommitteeMemberWithRelations[];
};

export type CreateCommitteeRepositoryInput = {
    tenantId: string;
    name: string;
    acronym?: string | null;
    type: CommitteeType;
    purpose: string;
    startDate?: Date | null;
    endDate?: Date | null;
    status?: CommitteeStatus;
    notes?: string | null;
};

export type UpdateCommitteeRepositoryInput = {
    name?: string;
    acronym?: string | null;
    type?: CommitteeType;
    purpose?: string;
    startDate?: Date | null;
    endDate?: Date | null;
    status?: CommitteeStatus;
    notes?: string | null;
};

export type ListCommitteesRepositoryQuery = {
    search?: string;
    type?: CommitteeType;
    status?: CommitteeStatus;
    page?: number;
    limit?: number;
};

export type AddCommitteeMemberRepositoryInput = {
    tenantId: string;
    committeeId: string;
    parliamentarianId: string;
    role: CommitteeMemberRole;
};

export abstract class CommitteeRepository {
    abstract create(
        data: CreateCommitteeRepositoryInput,
    ): Promise<CommitteeWithRelations>;
    abstract findMany(
        tenantId: string,
        query: ListCommitteesRepositoryQuery,
    ): Promise<PaginatedResult<CommitteeWithRelations>>;
    abstract findById(
        tenantId: string,
        id: string,
    ): Promise<CommitteeWithRelations | null>;
    abstract update(
        tenantId: string,
        id: string,
        data: UpdateCommitteeRepositoryInput,
    ): Promise<CommitteeWithRelations>;
    abstract softDelete(tenantId: string, id: string): Promise<void>;
    abstract existsByAcronym(
        tenantId: string,
        acronym: string,
        ignoreId?: string,
    ): Promise<boolean>;
    abstract existsMemberByParliamentarian(
        tenantId: string,
        committeeId: string,
        parliamentarianId: string,
    ): Promise<boolean>;
    abstract existsMemberByExclusiveRole(
        tenantId: string,
        committeeId: string,
        role: CommitteeMemberRole,
    ): Promise<boolean>;
    abstract addMember(
        data: AddCommitteeMemberRepositoryInput,
    ): Promise<CommitteeMemberWithRelations>;
    abstract removeMember(
        tenantId: string,
        committeeId: string,
        memberId: string,
    ): Promise<void>;
}
