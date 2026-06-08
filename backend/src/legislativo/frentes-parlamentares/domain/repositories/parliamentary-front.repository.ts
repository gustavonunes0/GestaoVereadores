import { PaginatedResult } from '../../../../common/dto/pagination.dto';
import { ParliamentaryFrontEntity } from '../entities/parliamentary-front.entity';
import { ParliamentaryFrontStatus } from '../enums/parliamentary-front-status.enum';

export type ParliamentarianFrontPartySummary = {
    id: string;
    name: string;
    acronym: string;
};

export type ParliamentarianFrontSummary = {
    id: string;
    parliamentaryName: string;
    officeNumber: string | null;
    politicalParty: ParliamentarianFrontPartySummary | null;
};

export type ParliamentaryFrontMemberWithRelations = {
    id: string;
    parliamentarian: ParliamentarianFrontSummary;
    createdAt: Date;
};

export type TenantUserFrontSummary = {
    id: string;
    userId: string;
};

export type ParliamentaryFrontWithRelations = {
    entity: ParliamentaryFrontEntity;
    coordinator: ParliamentarianFrontSummary | null;
    createdBy: TenantUserFrontSummary | null;
    members: ParliamentaryFrontMemberWithRelations[];
};

export type CreateParliamentaryFrontRepositoryInput = {
    tenantId: string;
    name: string;
    theme: string;
    description?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
    status?: ParliamentaryFrontStatus;
    coordinatorParliamentarianId?: string | null;
    createdByTenantUserId?: string | null;
};

export type UpdateParliamentaryFrontRepositoryInput = {
    name?: string;
    theme?: string;
    description?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
    status?: ParliamentaryFrontStatus;
    coordinatorParliamentarianId?: string | null;
};

export type ListParliamentaryFrontsRepositoryQuery = {
    search?: string;
    theme?: string;
    status?: ParliamentaryFrontStatus;
    page?: number;
    limit?: number;
};

export type AddParliamentaryFrontMemberRepositoryInput = {
    tenantId: string;
    frontId: string;
    parliamentarianId: string;
};

export abstract class ParliamentaryFrontRepository {
    abstract create(
        data: CreateParliamentaryFrontRepositoryInput,
    ): Promise<ParliamentaryFrontWithRelations>;
    abstract findMany(
        tenantId: string,
        query: ListParliamentaryFrontsRepositoryQuery,
    ): Promise<PaginatedResult<ParliamentaryFrontWithRelations>>;
    abstract findById(
        tenantId: string,
        id: string,
    ): Promise<ParliamentaryFrontWithRelations | null>;
    abstract update(
        tenantId: string,
        id: string,
        data: UpdateParliamentaryFrontRepositoryInput,
    ): Promise<ParliamentaryFrontWithRelations>;
    abstract softDelete(tenantId: string, id: string): Promise<void>;
    abstract existsMemberByParliamentarian(
        tenantId: string,
        frontId: string,
        parliamentarianId: string,
    ): Promise<boolean>;
    abstract addMember(
        data: AddParliamentaryFrontMemberRepositoryInput,
    ): Promise<ParliamentaryFrontMemberWithRelations>;
    abstract removeMember(
        tenantId: string,
        frontId: string,
        memberId: string,
    ): Promise<void>;
}
