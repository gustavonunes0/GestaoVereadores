import { PaginatedResult } from '../../../../common/dto/pagination.dto';
import { PoliticalPartyEntity } from '../entities/political-party.entity';

export type CreatePoliticalPartyRepositoryInput = {
    tenantId: string;
    name: string;
    acronym: string;
    ideology?: string | null;
    flagUrl?: string | null;
};

export type UpdatePoliticalPartyRepositoryInput = {
    name?: string;
    acronym?: string;
    ideology?: string | null;
    flagUrl?: string | null;
};

export type ListPoliticalPartiesRepositoryQuery = {
    search?: string;
    page?: number;
    limit?: number;
};

export abstract class PoliticalPartyRepository {
    abstract create(
        data: CreatePoliticalPartyRepositoryInput,
    ): Promise<PoliticalPartyEntity>;
    abstract findMany(
        tenantId: string,
        query: ListPoliticalPartiesRepositoryQuery,
    ): Promise<PaginatedResult<PoliticalPartyEntity>>;
    abstract findById(
        tenantId: string,
        id: string,
    ): Promise<PoliticalPartyEntity | null>;
    abstract findAnyById(
        tenantId: string,
        id: string,
    ): Promise<PoliticalPartyEntity | null>;
    abstract existsByAcronym(
        tenantId: string,
        acronym: string,
        ignoreId?: string,
    ): Promise<boolean>;
    abstract existsByName(
        tenantId: string,
        name: string,
        ignoreId?: string,
    ): Promise<boolean>;
    abstract findRemovedByAcronym(
        tenantId: string,
        acronym: string,
    ): Promise<PoliticalPartyEntity | null>;
    abstract reactivate(
        tenantId: string,
        id: string,
        data: CreatePoliticalPartyRepositoryInput,
    ): Promise<PoliticalPartyEntity>;
    abstract update(
        tenantId: string,
        id: string,
        data: UpdatePoliticalPartyRepositoryInput,
    ): Promise<PoliticalPartyEntity>;
    abstract softDelete(tenantId: string, id: string): Promise<void>;
    abstract countActiveParliamentarians(
        tenantId: string,
        politicalPartyId: string,
    ): Promise<number>;
}
