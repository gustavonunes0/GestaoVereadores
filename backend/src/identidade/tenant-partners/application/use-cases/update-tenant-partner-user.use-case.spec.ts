import { ConflictException } from '@nestjs/common';
import { UpdateTenantPartnerUserUseCase } from './update-tenant-partner-user.use-case';
import { TenantPartnerEntity } from '../../domain/entities/tenant-partner.entity';
import { TenantPartnerUserEntity } from '../../domain/entities/tenant-partner-user.entity';
import { UserEntity } from '../../../users/domain/user.entity';
import { TenantPartnerRepository } from '../../domain/repositories/tenant-partner.repository';
import { TenantPartnerUserRepository } from '../../domain/repositories/tenant-partner-user.repository';
import { UserRepository } from '../../../users/domain/user.repository';

const TENANT_ID = 'a0000000-0000-4000-8000-000000000001';
const PARTNER_ID = 'b0000000-0000-4000-8000-000000000002';
const USER_ID = 'c0000000-0000-4000-8000-000000000003';

function buildUser(): UserEntity {
    return UserEntity.create({
        id: USER_ID,
        firstName: 'Maria',
        lastName: 'Santos',
        cpf: '12345678909',
        email: 'partner@test.local',
        passwordHash: 'hash',
    });
}

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

    const user = buildUser();

    const partnerRepo = {
        findById: jest.fn().mockResolvedValue(partner),
    } as unknown as jest.Mocked<TenantPartnerRepository>;

    const partnerUserRepo = {
        findByPartnerId: jest.fn().mockResolvedValue(link),
    } as unknown as jest.Mocked<TenantPartnerUserRepository>;

    const userRepo = {
        findById: jest.fn().mockResolvedValue(user),
        findByCpf: jest.fn().mockResolvedValue(null),
        update: jest.fn().mockImplementation((u) => Promise.resolve(u)),
    } as unknown as jest.Mocked<UserRepository>;

    return { partnerRepo, partnerUserRepo, userRepo, user };
}

describe('UpdateTenantPartnerUserUseCase', () => {
    let partnerRepo: jest.Mocked<TenantPartnerRepository>;
    let partnerUserRepo: jest.Mocked<TenantPartnerUserRepository>;
    let userRepo: jest.Mocked<UserRepository>;
    let useCase: UpdateTenantPartnerUserUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        const mocks = buildMocks();
        partnerRepo = mocks.partnerRepo;
        partnerUserRepo = mocks.partnerUserRepo;
        userRepo = mocks.userRepo;
        useCase = new UpdateTenantPartnerUserUseCase(
            partnerRepo,
            partnerUserRepo,
            userRepo,
        );
    });

    it('atualiza nome e CPF do usuário vinculado', async () => {
        const result = await useCase.execute(TENANT_ID, PARTNER_ID, {
            nome: 'João Silva',
            cpf: '98765432100',
        });

        expect(userRepo.update).toHaveBeenCalledTimes(1);
        expect(result.usuario?.nome).toBe('João Silva');
        expect(result.usuario?.cpf).toBe('98765432100');
        expect(result.usuarioVinculado).toBe(true);
    });

    it('rejeita CPF já em uso por outro usuário', async () => {
        userRepo.findByCpf.mockResolvedValue({ id: 'other-user' } as never);

        await expect(
            useCase.execute(TENANT_ID, PARTNER_ID, { cpf: '98765432100' }),
        ).rejects.toBeInstanceOf(ConflictException);
    });
});
