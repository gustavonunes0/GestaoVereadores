import { ConflictException } from '@nestjs/common';
import { ProvisionTenantPartnerUserUseCase } from './provision-tenant-partner-user.use-case';
import { TenantPartnerEntity } from '../../domain/entities/tenant-partner.entity';
import { TenantPartnerRepository } from '../../domain/repositories/tenant-partner.repository';
import { TenantPartnerUserRepository } from '../../domain/repositories/tenant-partner-user.repository';
import { UserRepository } from '../../../users/domain/user.repository';
import { PasswordHasher } from '../../../users/application/contracts/password-hasher';
import { TenantPartnerUserAlreadyExistsError } from '../errors/tenant-partner-user-already-exists.error';

const TENANT_ID = 'a0000000-0000-4000-8000-000000000001';
const PARTNER_ID = 'b0000000-0000-4000-8000-000000000002';

function buildPartner(): TenantPartnerEntity {
    return TenantPartnerEntity.create({
        tenantId: TENANT_ID,
        nome: 'Prefeitura Municipal',
        tipoAutorId: 'c0000000-0000-4000-8000-000000000003',
    });
}

function buildMocks() {
    const partner = buildPartner();
    Object.defineProperty(partner, 'id', { value: PARTNER_ID });

    const partnerRepo = {
        findById: jest.fn().mockResolvedValue(partner),
    } as unknown as jest.Mocked<TenantPartnerRepository>;

    const partnerUserRepo = {
        findByPartnerId: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<TenantPartnerUserRepository>;

    const userRepo = {
        findByCpf: jest.fn().mockResolvedValue(null),
        findByEmail: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation((user) => Promise.resolve(user)),
    } as unknown as jest.Mocked<UserRepository>;

    const passwordHasher = {
        hash: jest.fn().mockResolvedValue('hashed-password'),
    } as unknown as jest.Mocked<PasswordHasher>;

    return { partnerRepo, partnerUserRepo, userRepo, passwordHasher, partner };
}

describe('ProvisionTenantPartnerUserUseCase', () => {
    let partnerRepo: jest.Mocked<TenantPartnerRepository>;
    let partnerUserRepo: jest.Mocked<TenantPartnerUserRepository>;
    let userRepo: jest.Mocked<UserRepository>;
    let passwordHasher: jest.Mocked<PasswordHasher>;
    let useCase: ProvisionTenantPartnerUserUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        const mocks = buildMocks();
        partnerRepo = mocks.partnerRepo;
        partnerUserRepo = mocks.partnerUserRepo;
        userRepo = mocks.userRepo;
        passwordHasher = mocks.passwordHasher;
        useCase = new ProvisionTenantPartnerUserUseCase(
            partnerRepo,
            partnerUserRepo,
            userRepo,
            passwordHasher,
        );
    });

    it('cria usuário com nome, CPF e foto informados', async () => {
        const result = await useCase.execute(TENANT_ID, PARTNER_ID, {
            nome: 'Maria Santos',
            cpf: '12345678909',
            fotoPerfil: 'data:image/png;base64,abc',
        });

        expect(userRepo.create).toHaveBeenCalledTimes(1);
        const createdUser = userRepo.create.mock.calls[0][0];
        expect(createdUser.toPublicPrimitives().firstName).toBe('Maria');
        expect(createdUser.toPublicPrimitives().lastName).toBe('Santos');
        expect(createdUser.cpf).toBe('12345678909');
        expect(createdUser.toPublicPrimitives().profilePicture).toBe(
            'data:image/png;base64,abc',
        );
        expect(partnerUserRepo.create).toHaveBeenCalledTimes(1);
        expect(result.usuarioVinculado).toBe(true);
        expect(result.usuario).toEqual({
            nome: 'Maria Santos',
            cpf: '12345678909',
            fotoPerfil: 'data:image/png;base64,abc',
        });
    });

    it('não usa dados da instituição para criar o usuário', async () => {
        await useCase.execute(TENANT_ID, PARTNER_ID, {
            nome: 'João Representante',
            cpf: '98765432100',
        });

        const createdUser = userRepo.create.mock.calls[0][0];
        expect(createdUser.toPublicPrimitives().firstName).toBe('João');
        expect(createdUser.toPublicPrimitives().lastName).toBe('Representante');
        expect(createdUser.cpf).toBe('98765432100');
    });

    it('rejeita CPF já em uso', async () => {
        userRepo.findByCpf.mockResolvedValue({ id: 'existing' } as never);

        await expect(
            useCase.execute(TENANT_ID, PARTNER_ID, {
                nome: 'Maria Santos',
                cpf: '12345678909',
            }),
        ).rejects.toBeInstanceOf(ConflictException);
    });

    it('rejeita quando já existe vínculo', async () => {
        partnerUserRepo.findByPartnerId.mockResolvedValue({ id: 'link' } as never);

        await expect(
            useCase.execute(TENANT_ID, PARTNER_ID, {
                nome: 'Maria Santos',
                cpf: '12345678909',
            }),
        ).rejects.toBeInstanceOf(TenantPartnerUserAlreadyExistsError);
    });
});
