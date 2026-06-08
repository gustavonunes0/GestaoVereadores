import { PaginatedResult } from '../../../../../common/dto/pagination.dto';
import { MandateStatus } from '../enums/mandate-status.enum';
import { ParliamentarianMandateEntity } from '../entities/parliamentarian-mandate.entity';

export type LegislatureMandateSummary = {
    id: string;
    number: number;
    startDate: Date;
    endDate: Date | null;
    isCurrent: boolean;
};

export type ParliamentarianMandateWithLegislature = {
    entity: ParliamentarianMandateEntity;
    legislature: LegislatureMandateSummary;
};

export type CreateParliamentarianMandateRepositoryInput = {
    tenantId: string;
    parliamentarianId: string;
    legislatureId: string;
    partyAcronym?: string | null;
    partyName?: string | null;
    startedAt: Date;
};

export type UpdateParliamentarianMandateRepositoryInput = {
    partyAcronym?: string | null;
    partyName?: string | null;
    startedAt?: Date;
    endedAt?: Date | null;
    status?: MandateStatus;
    isRemoved?: boolean;
    removedAt?: Date | null;
};

export type ListParliamentarianMandatesRepositoryQuery = {
    status?: MandateStatus;
    legislatureId?: string;
    page?: number;
    limit?: number;
};

export abstract class ParliamentarianMandateRepository {
    abstract create(
        data: CreateParliamentarianMandateRepositoryInput,
    ): Promise<ParliamentarianMandateWithLegislature>;
    abstract findMany(
        tenantId: string,
        parliamentarianId: string,
        query: ListParliamentarianMandatesRepositoryQuery,
    ): Promise<PaginatedResult<ParliamentarianMandateWithLegislature>>;
    abstract findById(
        tenantId: string,
        id: string,
    ): Promise<ParliamentarianMandateWithLegislature | null>;
    abstract findByParliamentarianAndLegislature(
        tenantId: string,
        parliamentarianId: string,
        legislatureId: string,
    ): Promise<ParliamentarianMandateWithLegislature | null>;
    abstract update(
        tenantId: string,
        id: string,
        data: UpdateParliamentarianMandateRepositoryInput,
    ): Promise<ParliamentarianMandateWithLegislature>;
    abstract hasActiveMandate(
        tenantId: string,
        parliamentarianId: string,
        legislatureId: string,
    ): Promise<boolean>;
}
