import { PaginatedResult } from '../../../../common/dto/pagination.dto';
import { BoardStatus } from '../enums/board-status.enum';
import { BoardEntity } from '../entities/board.entity';
import { BoardRoleEntity } from '../entities/board-role.entity';

export type LegislatureBoardSummary = {
    id: string;
    number: number;
    startDate: Date;
    endDate: Date | null;
    isCurrent: boolean;
};

export type ParliamentarianBoardSummary = {
    id: string;
    parliamentaryName: string;
    officeNumber: string | null;
};

export type BoardRoleSummary = {
    id: string;
    name: string;
};

export type BoardMemberWithRelations = {
    id: string;
    parliamentarian: ParliamentarianBoardSummary;
    boardRole: BoardRoleSummary;
    createdAt: Date;
};

export type BoardWithRelations = {
    entity: BoardEntity;
    legislature: LegislatureBoardSummary;
    members: BoardMemberWithRelations[];
};

export type CreateBoardRepositoryInput = {
    tenantId: string;
    legislatureId: string;
    name: string;
    startDate: Date;
    endDate?: Date | null;
    status?: BoardStatus;
    notes?: string | null;
};

export type UpdateBoardRepositoryInput = {
    name?: string;
    startDate?: Date;
    endDate?: Date | null;
    status?: BoardStatus;
    notes?: string | null;
};

export type ListBoardsRepositoryQuery = {
    legislatureId?: string;
    status?: BoardStatus;
    page?: number;
    limit?: number;
};

export type CreateBoardRoleRepositoryInput = {
    tenantId: string;
    name: string;
};

export type AddBoardMemberRepositoryInput = {
    tenantId: string;
    boardId: string;
    parliamentarianId: string;
    boardRoleId: string;
};

export abstract class BoardRepository {
    abstract create(data: CreateBoardRepositoryInput): Promise<BoardWithRelations>;
    abstract findMany(
        tenantId: string,
        query: ListBoardsRepositoryQuery,
    ): Promise<PaginatedResult<BoardWithRelations>>;
    abstract findById(
        tenantId: string,
        id: string,
    ): Promise<BoardWithRelations | null>;
    abstract update(
        tenantId: string,
        id: string,
        data: UpdateBoardRepositoryInput,
    ): Promise<BoardWithRelations>;
    abstract softDelete(tenantId: string, id: string): Promise<void>;
    abstract existsMemberByRole(
        tenantId: string,
        boardId: string,
        boardRoleId: string,
    ): Promise<boolean>;
    abstract existsMemberByParliamentarian(
        tenantId: string,
        boardId: string,
        parliamentarianId: string,
    ): Promise<boolean>;
    abstract addMember(
        data: AddBoardMemberRepositoryInput,
    ): Promise<BoardMemberWithRelations>;
    abstract removeMember(
        tenantId: string,
        boardId: string,
        memberId: string,
    ): Promise<void>;
    abstract createRole(
        data: CreateBoardRoleRepositoryInput,
    ): Promise<BoardRoleEntity>;
    abstract findRoles(tenantId: string): Promise<BoardRoleEntity[]>;
    abstract findRoleById(
        tenantId: string,
        id: string,
    ): Promise<BoardRoleEntity | null>;
    abstract existsRoleByName(
        tenantId: string,
        name: string,
    ): Promise<boolean>;
    abstract ensureDefaultRoles(tenantId: string): Promise<void>;
}
