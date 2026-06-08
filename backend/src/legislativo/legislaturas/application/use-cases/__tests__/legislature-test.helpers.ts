import { LegislatureEntity } from '../../../domain/entities/legislature.entity';

export function buildLegislatureEntity(
    overrides: Partial<ReturnType<LegislatureEntity['toPrimitives']>> = {},
) {
    return LegislatureEntity.restore({
        id: 'leg-1',
        tenantId: 'tenant-1',
        number: 20,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2028-12-31'),
        isCurrent: false,
        isRemoved: false,
        removedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    });
}

export function buildLegislatureRepositoryMock() {
    return {
        create: jest.fn(),
        findMany: jest.fn(),
        findById: jest.fn(),
        existsByNumber: jest.fn(),
        findCurrent: jest.fn(),
        clearCurrentExcept: jest.fn(),
        update: jest.fn(),
        softDelete: jest.fn(),
        countCurrentLegislatures: jest.fn(),
        countActiveMandates: jest.fn(),
    };
}
