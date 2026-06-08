import { PoliticalPartyEntity } from '../../../domain/entities/political-party.entity';

export function buildPoliticalPartyEntity(
    overrides: Partial<ReturnType<PoliticalPartyEntity['toPrimitives']>> = {},
) {
    return PoliticalPartyEntity.restore({
        id: 'party-1',
        tenantId: 'tenant-1',
        name: 'Partido Teste',
        acronym: 'PT',
        ideology: 'Centro',
        flagUrl: 'https://example.com/flag.png',
        isRemoved: false,
        removedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    });
}

export function buildPoliticalPartyRepositoryMock() {
    return {
        create: jest.fn(),
        findMany: jest.fn(),
        findById: jest.fn(),
        findAnyById: jest.fn(),
        existsByAcronym: jest.fn(),
        existsByName: jest.fn(),
        findRemovedByAcronym: jest.fn(),
        reactivate: jest.fn(),
        update: jest.fn(),
        softDelete: jest.fn(),
        countActiveParliamentarians: jest.fn(),
    };
}
