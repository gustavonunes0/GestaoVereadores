import { RemoveTenantPartnerUserUseCase } from './remove-tenant-partner-user.use-case';
import { TenantPartnerEntity } from '../../domain/entities/tenant-partner.entity';
import { TenantPartnerUserEntity } from '../../domain/entities/tenant-partner-user.entity';
import { TenantPartnerRepository } from '../../domain/repositories/tenant-partner.repository';
import { TenantPartnerUserRepository } from '../../domain/repositories/tenant-partner-user.repository';
import { UserRepository } from '../../../users/domain/user.repository';

const TENANT_ID = 'a0000000-0000-4000-8000-000000000001';
const PARTNER_ID = 'b0000000-0000-4000-8000-000000000002';
const USER_ID = 'c0000000-0000-4000-8000-000000000003';

function buildMocks() {
    const partner = TenantPartnerEntity.create({
        tenantId: TENANT_ID,
        nome: 'Prefeitura Municipal',
        tipoAutorId: 'd0000000-0000-4000-8000-000000000004',
    });
    Object.defineProperty(partner, 'id', { value: PARTNER_ID });

    const link = TenantPartnerUserEntity.create({
        tenantId: TENANT_ID,
        tenantPartnerId: PARTNER_ID,
        userId: USER_ID,
    });

    const partnerRepo = {
        findById: jest.fn().mockResolvedValue(partner),
    } as unknown as jest.Mocked<TenantPartnerRepository>;

    const partnerUserRepo = {
        findByPartnerId: jest.fn().mockResolvedValue(link),
        removeByPartnerId: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<TenantPartnerUserRepository>;

    const userRepo = {
        remove: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<UserRepository>;

    return { partnerRepo, partnerUserRepo, userRepo };
}

describe('RemoveTenantPartnerUserUseCase', () => {
    let partnerRepo: jest.Mocked<TenantPartnerRepository>;
    let partnerUserRepo: jest.Mocked<TenantPartnerUserRepository>;
    let userRepo: jest.Mocked<UserRepository>;
    let useCase: RemoveTenantPartnerUserUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        const mocks = buildMocks();
        partnerRepo = mocks.partnerRepo;
        partnerUserRepo = mocks.partnerUserRepo;
        userRepo = mocks.userRepo;
        useCase = new RemoveTenantPartnerUserUseCase(
            partnerRepo,
            partnerUserRepo,
            userRepo,
        );
    });

    it('remove vínculo e usuário interno', async () => {
        const result = await useCase.execute(TENANT_ID, PARTNER_ID);

        expect(partnerUserRepo.removeByPartnerId).toHaveBeenCalledWith(PARTNER_ID);
        expect(userRepo.remove).toHaveBeenCalledWith(USER_ID);
        expect(result.usuarioVinculado).toBe(false);
        expect(result.usuario).toBeNull();
    });
});
