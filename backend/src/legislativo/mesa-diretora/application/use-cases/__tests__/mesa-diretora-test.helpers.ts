import { BoardStatus } from '../../../domain/enums/board-status.enum';
import { BoardEntity } from '../../../domain/entities/board.entity';
import { BoardWithRelations } from '../../../domain/repositories/board.repository';

export function buildBoardWithRelations(
    overrides: Partial<BoardWithRelations> = {},
): BoardWithRelations {
    const entity = BoardEntity.create({
        tenantId: 'tenant-1',
        legislatureId: 'leg-1',
        name: 'Mesa 2025-2026',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2026-12-31'),
        status: BoardStatus.ACTIVE,
    });

    return {
        entity,
        legislature: {
            id: 'leg-1',
            number: 20,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2028-12-31'),
            isCurrent: true,
        },
        members: [],
        ...overrides,
    };
}

export function buildBoardRepositoryMock() {
    return {
        create: jest.fn(),
        findMany: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        softDelete: jest.fn(),
        existsMemberByRole: jest.fn(),
        existsMemberByParliamentarian: jest.fn(),
        addMember: jest.fn(),
        removeMember: jest.fn(),
        createRole: jest.fn(),
        findRoles: jest.fn(),
        findRoleById: jest.fn(),
        existsRoleByName: jest.fn(),
        ensureDefaultRoles: jest.fn(),
    };
}
