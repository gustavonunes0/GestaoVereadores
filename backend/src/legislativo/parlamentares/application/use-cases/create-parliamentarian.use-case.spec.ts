import { TenantUserEntity, TenantUserStatus } from '../../../../identidade/tenant-users/domain/entities/tenant-user.entity';
import { CreateParliamentarianUseCase } from './create-parliamentarian.use-case';
import {
    ParliamentarianAlreadyExistsError,
    PoliticalPartyNotFoundForParliamentarianError,
    PoliticalPartyRemovedForParliamentarianError,
    TenantUserNotParliamentarianError,
} from '../errors/parliamentarian.errors';
import { PoliticalPartyEntity } from '../../../partidos-politicos/domain/entities/political-party.entity';
import {
    buildParliamentarianRepositoryMock,
    buildParliamentarianWithRelations,
    buildPoliticalPartyRepositoryMock,
    buildTenantUserRepositoryMock,
} from './__tests__/parliamentarian-test.helpers';

describe('CreateParliamentarianUseCase', () => {
    const tenantUser = TenantUserEntity.restore({
        id: 'tu-1',
        tenantId: 'tenant-1',
        userId: 'user-1',
        isTenantAdmin: false,
        isTenantStaff: false,
        isParliamentarian: true,
        status: TenantUserStatus.ACTIVE,
        permissions: [],
        lastAccessAt: null,
        removedAt: null,
        createdAt: new Date(),
        createdBy: null,
        modifiedAt: new Date(),
        modifiedBy: null,
        isRemoved: false,
    });

    const dto = {
        tenantUserId: 'tu-1',
        parliamentaryName: 'Vereador Teste',
    };

    it('cria parlamentar para TenantUser com isParliamentarian true', async () => {
        const parliamentarianRepository = buildParliamentarianRepositoryMock();
        const tenantUserRepository = buildTenantUserRepositoryMock();
        parliamentarianRepository.existsByTenantUserId.mockResolvedValue(false);
        parliamentarianRepository.findRemovedByTenantUserId.mockResolvedValue(null);
        parliamentarianRepository.create.mockResolvedValue(
            buildParliamentarianWithRelations(),
        );
        tenantUserRepository.findByIdForTenant.mockResolvedValue(tenantUser);

        const useCase = new CreateParliamentarianUseCase(
            parliamentarianRepository as never,
            tenantUserRepository as never,
            buildPoliticalPartyRepositoryMock() as never,
        );

        const result = await useCase.execute('tenant-1', dto);
        expect(result.tenantUserId).toBe('tu-1');
        expect(result.user.email).toBe('joao@camara.local');
    });

    it('bloqueia TenantUser sem isParliamentarian', async () => {
        const tenantUserRepository = buildTenantUserRepositoryMock();
        tenantUserRepository.findByIdForTenant.mockResolvedValue(
            TenantUserEntity.restore({
                ...tenantUser.toPrimitives(),
                isParliamentarian: false,
            }),
        );

        const useCase = new CreateParliamentarianUseCase(
            buildParliamentarianRepositoryMock() as never,
            tenantUserRepository as never,
            buildPoliticalPartyRepositoryMock() as never,
        );

        await expect(useCase.execute('tenant-1', dto)).rejects.toBeInstanceOf(
            TenantUserNotParliamentarianError,
        );
    });

    it('bloqueia duplicidade para o mesmo tenantUserId', async () => {
        const parliamentarianRepository = buildParliamentarianRepositoryMock();
        const tenantUserRepository = buildTenantUserRepositoryMock();
        tenantUserRepository.findByIdForTenant.mockResolvedValue(tenantUser);
        parliamentarianRepository.existsByTenantUserId.mockResolvedValue(true);

        const useCase = new CreateParliamentarianUseCase(
            parliamentarianRepository as never,
            tenantUserRepository as never,
            buildPoliticalPartyRepositoryMock() as never,
        );

        await expect(useCase.execute('tenant-1', dto)).rejects.toBeInstanceOf(
            ParliamentarianAlreadyExistsError,
        );
    });

    it('bloqueia partido removido', async () => {
        const parliamentarianRepository = buildParliamentarianRepositoryMock();
        const tenantUserRepository = buildTenantUserRepositoryMock();
        const politicalPartyRepository = buildPoliticalPartyRepositoryMock();
        tenantUserRepository.findByIdForTenant.mockResolvedValue(tenantUser);
        parliamentarianRepository.existsByTenantUserId.mockResolvedValue(false);
        politicalPartyRepository.findAnyById.mockResolvedValue(
            PoliticalPartyEntity.restore({
                id: 'party-1',
                tenantId: 'tenant-1',
                name: 'Partido',
                acronym: 'P',
                ideology: null,
                flagUrl: null,
                isRemoved: true,
                removedAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            }),
        );

        const useCase = new CreateParliamentarianUseCase(
            parliamentarianRepository as never,
            tenantUserRepository as never,
            politicalPartyRepository as never,
        );

        await expect(
            useCase.execute('tenant-1', { ...dto, politicalPartyId: 'party-1' }),
        ).rejects.toBeInstanceOf(PoliticalPartyRemovedForParliamentarianError);
    });

    it('bloqueia partido de outro tenant', async () => {
        const politicalPartyRepository = buildPoliticalPartyRepositoryMock();
        const tenantUserRepository = buildTenantUserRepositoryMock();
        tenantUserRepository.findByIdForTenant.mockResolvedValue(tenantUser);
        politicalPartyRepository.findAnyById.mockResolvedValue(null);

        const useCase = new CreateParliamentarianUseCase(
            buildParliamentarianRepositoryMock() as never,
            tenantUserRepository as never,
            politicalPartyRepository as never,
        );

        await expect(
            useCase.execute('tenant-1', { ...dto, politicalPartyId: 'party-2' }),
        ).rejects.toBeInstanceOf(PoliticalPartyNotFoundForParliamentarianError);
    });
});
