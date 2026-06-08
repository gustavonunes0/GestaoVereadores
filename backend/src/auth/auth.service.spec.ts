import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';

describe('AuthService', () => {
    const prisma = {
        usuario: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        tenant: {
            findFirst: jest.fn(),
        },
    };
    const jwt = {
        sign: jest.fn().mockReturnValue('token'),
    } as unknown as JwtService;
    const passwordHasher = {
        hash: jest.fn(),
        compare: jest.fn(),
    };
    let service: AuthService;

    beforeEach(() => {
        jest.clearAllMocks();
        prisma.tenant.findFirst.mockResolvedValue({
            id: 'a0000000-0000-4000-8000-000000000001',
        });
        service = new AuthService(
            prisma as never,
            jwt,
            passwordHasher as never,
        );
    });

    it('login rejeita usuário inexistente', async () => {
        prisma.usuario.findUnique.mockResolvedValue(null);
        await expect(
            service.login({ username: 'x', password: 'y' }),
        ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('login retorna token para credenciais válidas', async () => {
        const hash = await bcrypt.hash('admin', 10);
        prisma.usuario.findUnique.mockResolvedValue({
            id: 'u1',
            username: 'admin',
            passwordHash: hash,
            nome: 'Admin',
            role: 'MASTER',
            ativo: true,
        });
        const result = await service.login({
            username: 'admin',
            password: 'admin',
        });
        expect(result.access_token).toBe('token');
        expect(result.user.username).toBe('admin');
        expect(result.user.tenantId).toBeDefined();
    });
});
