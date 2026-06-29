import { PaginatedResult } from '../../../../common/dto/pagination.dto';
import { ParliamentarianStatus } from '../enums/parliamentarian-status.enum';
import { ParliamentarianEntity } from '../entities/parliamentarian.entity';

export type ParliamentarianUserSummary = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    cpf: string | null;
    politicalParty?: ParliamentarianPartySummary | null;
};

export type ParliamentarianPartySummary = {
    id: string;
    name: string;
    acronym: string;
    flagUrl: string | null;
};

export type ParliamentarianCommitteeSummary = {
    id: string;
    name: string;
    acronym: string | null;
};

export type ParliamentarianWithRelations = {
    entity: ParliamentarianEntity;
    /** Dados do User resolvidos via ParlamentarianUser (opcional — parlamentar pode não ter acesso). */
    user?: ParliamentarianUserSummary;
    /** Status do vínculo ParlamentarianUser (ACTIVE, INACTIVE, …). */
    accessStatus?: string;
    activeMandatesCount?: number;
    stats?: {
        authoredMattersCount: number;
        coauthoredMattersCount: number;
        committeeMembersCount: number;
        sessionVotesCount: number;
    };
    activeMandate?: {
        id: string;
        status: string;
    } | null;
    committees?: ParliamentarianCommitteeSummary[];
};

export type CreateParliamentarianRepositoryInput = {
    tenantId: string;
    parliamentaryName: string;
    officeNumber?: string | null;
    photoUrl?: string | null;
    biography?: string | null;
};

export type UpdateParliamentarianRepositoryInput = {
    parliamentaryName?: string;
    officeNumber?: string | null;
    photoUrl?: string | null;
    biography?: string | null;
    status?: ParliamentarianStatus;
};

export type ListParliamentariansRepositoryQuery = {
    search?: string;
    status?: ParliamentarianStatus;
    politicalPartyId?: string;
    page?: number;
    limit?: number;
};

export abstract class ParliamentarianRepository {
    abstract create(
        data: CreateParliamentarianRepositoryInput,
    ): Promise<ParliamentarianWithRelations>;
    abstract findMany(
        tenantId: string,
        query: ListParliamentariansRepositoryQuery,
    ): Promise<PaginatedResult<ParliamentarianWithRelations>>;
    abstract findById(
        tenantId: string,
        id: string,
    ): Promise<ParliamentarianWithRelations | null>;
    abstract update(
        tenantId: string,
        id: string,
        data: UpdateParliamentarianRepositoryInput,
    ): Promise<ParliamentarianWithRelations>;
    abstract softDelete(tenantId: string, id: string): Promise<void>;

    abstract findProfileById(
        tenantId: string,
        id: string,
    ): Promise<Record<string, unknown> | null>;
}
