import { CreateTenantPartnerUseCase } from './create-tenant-partner.use-case';
import { TenantPartnerRepository } from '../../domain/repositories/tenant-partner.repository';

const TENANT_ID = 'a0000000-0000-4000-8000-000000000001';
const TIPO_AUTOR_ID = 'b0000000-0000-4000-8000-000000000002';

function buildMocks() {
    const partnerRepo = {
        create: jest.fn().mockImplementation((p) => Promise.resolve(p)),
        findDefaultTipoAutorId: jest.fn().mockResolvedValue(TIPO_AUTOR_ID),
    } as unknown as jest.Mocked<TenantPartnerRepository>;

    return { partnerRepo };
}

describe('CreateTenantPartnerUseCase', () => {
    let partnerRepo: jest.Mocked<TenantPartnerRepository>;
    let useCase: CreateTenantPartnerUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        const mocks = buildMocks();
        partnerRepo = mocks.partnerRepo;
        useCase = new CreateTenantPartnerUseCase(partnerRepo);
    });

    it('cria parceiro sem CPF com sucesso', async () => {
        const result = await useCase.execute(TENANT_ID, {
            nome: 'Prefeitura Municipal',
        });

        expect(result.id).toBeDefined();
        expect(result.nome).toBe('Prefeitura Municipal');
        expect(result.cpf).toBeNull();
        expect(result.usuarioVinculado).toBe(false);
        expect(partnerRepo.create).toHaveBeenCalledTimes(1);
    });

    it('cria parceiro com CPF com sucesso', async () => {
        const result = await useCase.execute(TENANT_ID, {
            nome: 'João Silva',
            cpf: '123.456.789-09',
        });

        expect(result.id).toBeDefined();
        expect(result.nome).toBe('João Silva');
        expect(result.cpf).toBe('12345678909');
        expect(result.usuarioVinculado).toBe(false);
        expect(partnerRepo.create).toHaveBeenCalledTimes(1);
    });

    it('não provisiona usuário na criação', async () => {
        const result = await useCase.execute(TENANT_ID, {
            nome: 'Dr. Paulo Costa',
        });

        expect(result.usuarioVinculado).toBe(false);
        expect(partnerRepo.create).toHaveBeenCalledTimes(1);
    });
});
