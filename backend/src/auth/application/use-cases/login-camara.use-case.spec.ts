import { LoginCamaraUseCase } from './login-camara.use-case';
import { CamaraAuthRepository } from '../../domain/repositories/camara-auth.repository';
import { TenantAuthRepository } from '../../domain/repositories/tenant-auth.repository';
import { PasswordHasher } from '../../../identidade/users/application/contracts/password-hasher';
import { TokenIssuer } from '../../domain/contracts/token-issuer';
import { CamaraUserEntity } from '../../domain/entities/camara-user.entity';
import {
    TenantAuthEntity,
    TenantUserAccessEntity,
} from '../../domain/entities/tenant-access.entity';
import { InvalidCredentialsError } from '../errors/auth.errors';

const PARTNER_USER_ID = 'user-partner-001';
const TENANT_ID = 'tenant-camara-001';

function makePartnerUser() {
    return new CamaraUserEntity({
        id: PARTNER_USER_ID,
        email: 'partner-placeholder@no-access.local',
        firstName: 'Prefeito',
        lastName: 'Municipal',
        passwordHash: '$2b$10$AAAAAAAAAAAAAAAAAAAAAA.hashed',
        cpf: '12345678909',
    });
}

function makeTenant() {
    return new TenantAuthEntity({
        id: TENANT_ID,
        name: 'Câmara Demo',
        cnpj: '00000000000191',
        status: 'ACTIVE',
    });
}

describe('LoginCamaraUseCase — bloqueio de TenantPartner', () => {
    const camaraAuth = {
        findUserByEmail: jest.fn(),
        findUserByCpf: jest.fn(),
        findProfileById: jest.fn(),
        findActiveTenantUser: jest.fn(),
        findFirstActiveTenantUser: jest.fn(),
        findActiveParlamentarianUser: jest.fn(),
        findFirstActiveParlamentarianUser: jest.fn(),
        touchLastAccess: jest.fn(),
        touchParlamentarianLastAccess: jest.fn(),
        isPartnerOnlyUser: jest.fn(),
    } as unknown as jest.Mocked<CamaraAuthRepository>;

    const tenants = {
        findActiveById: jest.fn(),
        findActiveByCnpj: jest.fn(),
        findFirstActive: jest.fn(),
    } as unknown as jest.Mocked<TenantAuthRepository>;

    const passwordHasher = {
        hash: jest.fn(),
        compare: jest.fn(),
    } as unknown as jest.Mocked<PasswordHasher>;

    const tokenIssuer = {
        sign: jest.fn(),
    } as unknown as jest.Mocked<TokenIssuer>;

    let useCase: LoginCamaraUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        tokenIssuer.sign.mockReturnValue('access-token-fake');
        useCase = new LoginCamaraUseCase(camaraAuth, tenants, passwordHasher, tokenIssuer);
    });

    it('bloqueia login de TenantPartnerUser puro — lança InvalidCredentialsError', async () => {
        camaraAuth.findUserByCpf.mockResolvedValue(makePartnerUser());
        camaraAuth.isPartnerOnlyUser.mockResolvedValue(true);

        await expect(
            useCase.execute({ cpf: '123.456.789-09', password: 'qualquersenha' }),
        ).rejects.toBeInstanceOf(InvalidCredentialsError);

        expect(camaraAuth.isPartnerOnlyUser).toHaveBeenCalledWith(PARTNER_USER_ID);
        // Nunca verifica senha — bloqueio ocorre antes da comparação de hash
        expect(passwordHasher.compare).not.toHaveBeenCalled();
    });

    it('permite login de usuário que é Partner E TenantUser simultaneamente', async () => {
        const user = makePartnerUser();
        const tenant = makeTenant();
        const tenantUser = new TenantUserAccessEntity({
            id: 'tu-001',
            tenantId: TENANT_ID,
            userId: PARTNER_USER_ID,
            role: 'STAFF',
        });

        camaraAuth.findUserByCpf.mockResolvedValue(user);
        camaraAuth.isPartnerOnlyUser.mockResolvedValue(false);
        passwordHasher.compare.mockResolvedValue(true);
        tenants.findActiveById.mockResolvedValue(tenant);
        camaraAuth.findActiveParlamentarianUser.mockResolvedValue(null);
        camaraAuth.findActiveTenantUser.mockResolvedValue(tenantUser);
        camaraAuth.touchLastAccess.mockResolvedValue(undefined);

        const result = await useCase.execute({
            cpf: '123.456.789-09',
            password: 'senhaCorreta',
            tenantId: TENANT_ID,
        });

        expect(result.access_token).toBe('access-token-fake');
        expect(result.sessionType).toBe('staff');
        expect(camaraAuth.isPartnerOnlyUser).toHaveBeenCalledWith(PARTNER_USER_ID);
        expect(passwordHasher.compare).toHaveBeenCalledTimes(1);
        expect(camaraAuth.touchLastAccess).toHaveBeenCalledWith('tu-001');
    });
});
