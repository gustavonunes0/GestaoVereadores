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
  };
  const jwt = { sign: jest.fn().mockReturnValue('token') } as unknown as JwtService;
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(prisma as never, jwt);
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
    const result = await service.login({ username: 'admin', password: 'admin' });
    expect(result.access_token).toBe('token');
    expect(result.user.username).toBe('admin');
  });
});
