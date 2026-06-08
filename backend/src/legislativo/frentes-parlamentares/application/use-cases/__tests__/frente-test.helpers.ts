import { ParliamentaryFrontEntity } from '../../../domain/entities/parliamentary-front.entity';
import { ParliamentaryFrontStatus } from '../../../domain/enums/parliamentary-front-status.enum';
import { ParliamentaryFrontWithRelations } from '../../../domain/repositories/parliamentary-front.repository';

export function buildParliamentaryFrontEntity(
    overrides: Partial<
        ReturnType<ParliamentaryFrontEntity['toPrimitives']>
    > = {},
) {
    return ParliamentaryFrontEntity.restore({
        id: 'front-1',
        tenantId: 'tenant-1',
        name: 'Frente Parlamentar da Educação',
        theme: 'Educação',
        description: 'Grupo suprapartidário em defesa da educação pública.',
        startDate: new Date('2025-01-01'),
        endDate: null,
        status: ParliamentaryFrontStatus.ACTIVE,
        coordinatorParliamentarianId: null,
        createdByTenantUserId: null,
        isRemoved: false,
        removedAt: null,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        ...overrides,
    });
}

export function buildFrontMember(options: {
    id?: string;
    parliamentarianId?: string;
    partyAcronym?: string;
} = {}) {
    const parliamentarianId = options.parliamentarianId ?? 'parl-1';
    const acronym = options.partyAcronym ?? 'PT';
    return {
        id: options.id ?? `member-${parliamentarianId}`,
        parliamentarian: {
            id: parliamentarianId,
            parliamentaryName: `Parlamentar ${parliamentarianId}`,
            officeNumber: '101',
            politicalParty: {
                id: `party-${acronym.toLowerCase()}`,
                name: `Partido ${acronym}`,
                acronym,
            },
        },
        createdAt: new Date('2025-01-01'),
    };
}

export function buildParliamentaryFrontWithRelations(
    overrides: Partial<ParliamentaryFrontWithRelations> = {},
): ParliamentaryFrontWithRelations {
    return {
        entity: buildParliamentaryFrontEntity(),
        coordinator: null,
        createdBy: null,
        members: [],
        ...overrides,
    };
}

export function buildParliamentaryFrontRepositoryMock() {
    return {
        create: jest.fn(),
        findMany: jest.fn(),
        findById: jest.fn(),
        update: jest.fn(),
        softDelete: jest.fn(),
        existsMemberByParliamentarian: jest.fn(),
        addMember: jest.fn(),
        removeMember: jest.fn(),
    };
}
