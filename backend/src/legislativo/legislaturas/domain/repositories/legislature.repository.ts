import { PaginatedResult } from '../../../../common/dto/pagination.dto';
import { LegislatureEntity } from '../entities/legislature.entity';

export type CreateLegislatureRepositoryInput = {
    tenantId: string;
    number: number;
    startDate: Date;
    endDate?: Date | null;
    isCurrent?: boolean;
};

export type UpdateLegislatureRepositoryInput = {
    number?: number;
    startDate?: Date;
    endDate?: Date | null;
    isCurrent?: boolean;
};

export type ListLegislaturesRepositoryQuery = {
    search?: string;
    isCurrent?: boolean;
    page?: number;
    limit?: number;
};

export abstract class LegislatureRepository {
    abstract create(
        data: CreateLegislatureRepositoryInput,
    ): Promise<LegislatureEntity>;
    abstract findMany(
        tenantId: string,
        query: ListLegislaturesRepositoryQuery,
    ): Promise<PaginatedResult<LegislatureEntity>>;
    abstract findById(
        tenantId: string,
        id: string,
    ): Promise<LegislatureEntity | null>;
    abstract existsByNumber(
        tenantId: string,
        number: number,
        ignoreId?: string,
    ): Promise<boolean>;
    abstract findCurrent(tenantId: string): Promise<LegislatureEntity | null>;
    abstract clearCurrentExcept(
        tenantId: string,
        exceptId?: string,
    ): Promise<void>;
    abstract update(
        tenantId: string,
        id: string,
        data: UpdateLegislatureRepositoryInput,
    ): Promise<LegislatureEntity>;
    abstract softDelete(tenantId: string, id: string): Promise<void>;
    abstract countCurrentLegislatures(
        tenantId: string,
        exceptId?: string,
    ): Promise<number>;
    abstract countActiveMandates(
        tenantId: string,
        legislatureId: string,
    ): Promise<number>;
}
