import { CommitteeEntity } from '../../../domain/entities/committee.entity';
import { CommitteeStatus } from '../../../domain/enums/committee-status.enum';
import { CommitteeType } from '../../../domain/enums/committee-type.enum';
import { CommitteeWithRelations } from '../../../domain/repositories/committee.repository';

export function buildCommitteeEntity(
    overrides: Partial<ReturnType<CommitteeEntity['toPrimitives']>> = {},
) {
    return CommitteeEntity.restore({
        id: 'committee-1',
        tenantId: 'tenant-1',
        name: 'Comissão de Finanças',
        acronym: 'CFO',
        type: CommitteeType.PERMANENT,
        purpose: 'Analisar matérias financeiras e orçamentárias.',
        startDate: null,
        endDate: null,
        status: CommitteeStatus.ACTIVE,
        notes: null,
        isRemoved: false,
        removedAt: null,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        ...overrides,
    });
}

export function buildCommitteeWithRelations(
    overrides: Partial<CommitteeWithRelations> = {},
): CommitteeWithRelations {
    return {
        entity: buildCommitteeEntity(),
        members: [],
        ...overrides,
    };
}

export function buildCommitteeRepositoryMock() {
    return {
        create: jest.fn(),
        findMany: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        softDelete: jest.fn(),
        existsByAcronym: jest.fn(),
        existsMemberByParliamentarian: jest.fn(),
        existsMemberByExclusiveRole: jest.fn(),
        addMember: jest.fn(),
        removeMember: jest.fn(),
    };
}
