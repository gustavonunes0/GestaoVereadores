import * as bcrypt from 'bcryptjs';
import { SiglUserEntity } from '../../domain/entities/sigl-user.entity';
import { TokenIssuer } from '../../domain/contracts/token-issuer';
import { SiglPasswordHasher } from '../../domain/contracts/sigl-password.hasher';
import { SiglUserRepository } from '../../domain/repositories/sigl-user.repository';
import { TenantAuthRepository } from '../../domain/repositories/tenant-auth.repository';
import { InvalidCredentialsError } from '../errors/auth.errors';
import { LoginSiglUseCase } from './login-sigl.use-case';

describe('LoginSiglUseCase', () => {
    const siglUsers = {
        findByUsername: jest.fn(),
    } as unknown as jest.Mocked<SiglUserRepository>;

    const tenants = {
        findFirstActive: jest.fn(),
        findActiveById: jest.fn(),
    } as unknown as jest.Mocked<TenantAuthRepository>;

    const passwordHasher = {
        hash: jest.fn(),
        compare: jest.fn(),
    } as unknown as jest.Mocked<SiglPasswordHasher>;

    const tokenIssuer = {
        sign: jest.fn().mockReturnValue('token'),
    } as unknown as jest.Mocked<TokenIssuer>;

    let useCase: LoginSiglUseCase;

    beforeEach(() => {
        jest.clearAllMocks();
        tenants.findFirstActive.mockResolvedValue({
            id: 'a0000000-0000-4000-8000-000000000001',
            name: 'Demo',
            cnpj: '00000000000191',
            status: 'ACTIVE',
        } as never);
        useCase = new LoginSiglUseCase(
            siglUsers,
            tenants,
            passwordHasher,
            tokenIssuer,
        );
    });

    it('rejeita usuário inexistente', async () => {
        siglUsers.findByUsername.mockResolvedValue(null);
        await expect(
            useCase.execute({ username: 'x', password: 'y' }),
        ).rejects.toBeInstanceOf(InvalidCredentialsError);
    });

    it('retorna token para credenciais válidas', async () => {
        const hash = await bcrypt.hash('admin', 10);
        siglUsers.findByUsername.mockResolvedValue(
            new SiglUserEntity({
                id: 'u1',
                username: 'admin',
                passwordHash: hash,
                nome: 'Admin',
                role: 'MASTER',
                ativo: true,
            }),
        );
        passwordHasher.compare.mockResolvedValue(true);

        const result = await useCase.execute({
            username: 'admin',
            password: 'admin',
        });

        expect(result.access_token).toBe('token');
        expect(result.user.username).toBe('admin');
        expect(result.user.tenantId).toBeDefined();
    });
});
