import { ParliamentarianEntity } from '../../../domain/entities/parliamentarian.entity';
import { ParliamentarianStatus } from '../../../domain/enums/parliamentarian-status.enum';
import { ParliamentarianWithRelations } from '../../../domain/repositories/parliamentarian.repository';

export function buildParliamentarianWithRelations(
    overrides: Partial<ParliamentarianWithRelations> = {},
): ParliamentarianWithRelations {
    const entity = ParliamentarianEntity.restore({
        id: 'parl-1',
        tenantId: 'tenant-1',
        politicalPartyId: 'party-1',
        parliamentaryName: 'Vereador Teste',
        officeNumber: '101',
        photoUrl: null,
        biography: null,
        status: ParliamentarianStatus.ACTIVE,
        isRemoved: false,
        removedAt: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    });

    return {
        entity,
        user: {
            id: 'user-1',
            firstName: 'João',
            lastName: 'Silva',
            email: 'parlamentar.52998224725@interno.sigl.local',
        },
        politicalParty: {
            id: 'party-1',
            name: 'Partido Teste',
            acronym: 'PT',
            flagUrl: null,
        },
        activeMandatesCount: 0,
        ...overrides,
    };
}

export function buildParliamentarianRepositoryMock() {
    return {
        create: jest.fn(),
        findMany: jest.fn(),
        findById: jest.fn(),
        findProfileById: jest.fn(),
        update: jest.fn(),
        softDelete: jest.fn(),
    };
}

export function buildParlamentarianUserRepositoryMock() {
    return {
        create: jest.fn(),
        findActiveByParliamentarianId: jest.fn().mockResolvedValue(null),
        findActiveByUserId: jest.fn().mockResolvedValue(null),
        deactivate: jest.fn(),
    };
}

export function buildPoliticalPartyRepositoryMock() {
    return {
        findById: jest.fn(),
        findAnyById: jest.fn(),
    };
}
