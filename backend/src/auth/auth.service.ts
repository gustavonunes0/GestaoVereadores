import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  RoleUsuario,
  TenantStatus,
  TenantUserStatus,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { paginatedQuery } from '../common/prisma/paginate';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordHasher } from '../users/application/contracts/password-hasher';
import { PASSWORD_HASHER } from '../users/users.tokens';
import { LoginCamaraDto } from './dto/login-camara.dto';
import { LoginDto } from './dto/login.dto';
import {
  ChangePasswordDto,
  CreateUsuarioDto,
  UpdateUsuarioDto,
} from './dto/usuario.dto';
import { JwtPayload } from './jwt-payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.usuario.findUnique({
      where: { username: dto.username },
    });
    if (!user || !user.ativo) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const tid = await this.resolveTenantId(dto.tenantId);

    const payload: JwtPayload = {
      sub: user.id,
      authType: 'sigl',
      username: user.username,
      role: user.role,
      tid,
    };

    return {
      access_token: this.jwt.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        nome: user.nome,
        role: user.role,
        tenantId: tid,
        authType: 'sigl' as const,
      },
    };
  }

  async loginCamara(dto: LoginCamaraDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: { email, isRemoved: false },
    });
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const valid = await this.passwordHasher.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const tenant = await this.resolveTenantForCamara(dto.tenantId, dto.tenantCnpj);

    const tenantUser = await this.prisma.tenantUser.findFirst({
      where: {
        userId: user.id,
        tenantId: tenant.id,
        isRemoved: false,
        status: TenantUserStatus.ACTIVE,
      },
    });
    if (!tenantUser) {
      throw new UnauthorizedException('Usuário sem vínculo ativo nesta câmara');
    }

    const payload: JwtPayload = {
      sub: user.id,
      authType: 'camara',
      tid: tenant.id,
      tenantRole: tenantUser.role,
      isAdmin: tenantUser.isAdmin,
    };

    await this.prisma.tenantUser.update({
      where: { id: tenantUser.id },
      data: { lastAccessAt: new Date() },
    });

    return {
      access_token: this.jwt.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nome: `${user.firstName} ${user.lastName}`.trim(),
        tenantId: tenant.id,
        tenantName: tenant.name,
        role: tenantUser.role,
        isAdmin: tenantUser.isAdmin,
        authType: 'camara' as const,
      },
    };
  }

  async me(user: { id: string; authType?: string }) {
    if (user.authType === 'camara') {
      const record = await this.prisma.user.findFirst({
        where: { id: user.id, isRemoved: false },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      });
      if (!record) throw new UnauthorizedException();
      return {
        id: record.id,
        email: record.email,
        nome: `${record.firstName} ${record.lastName}`.trim(),
        authType: 'camara' as const,
      };
    }

    const record = await this.prisma.usuario.findUnique({
      where: { id: user.id },
      select: { id: true, username: true, nome: true, role: true, ativo: true },
    });
    if (!record) throw new UnauthorizedException();
    return { ...record, authType: 'sigl' as const };
  }

  async listUsers(query: PaginationQueryDto) {
    return paginatedQuery(
      () => this.prisma.usuario.count(),
      (skip, take) =>
        this.prisma.usuario.findMany({
          skip,
          take,
          orderBy: { username: 'asc' },
          select: {
            id: true,
            username: true,
            nome: true,
            role: true,
            ativo: true,
            createdAt: true,
          },
        }),
      query,
    );
  }

  async createUser(dto: CreateUsuarioDto) {
    const exists = await this.prisma.usuario.findUnique({
      where: { username: dto.username },
    });
    if (exists) {
      throw new ConflictException('Nome de usuário já existe');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.usuario.create({
      data: {
        username: dto.username,
        passwordHash,
        nome: dto.nome,
        role: dto.role,
      },
      select: {
        id: true,
        username: true,
        nome: true,
        role: true,
        ativo: true,
      },
    });
  }

  async updateUser(id: string, dto: UpdateUsuarioDto) {
    const user = await this.prisma.usuario.findUnique({ where: { id } });
    if (!user) throw new UnauthorizedException('Usuário não encontrado');
    return this.prisma.usuario.update({
      where: { id },
      data: {
        nome: dto.nome,
        role: dto.role,
        ativo: dto.ativo,
      },
      select: {
        id: true,
        username: true,
        nome: true,
        role: true,
        ativo: true,
      },
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.usuario.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) {
      throw new BadRequestException('Senha atual incorreta');
    }
    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.usuario.update({
      where: { id: userId },
      data: { passwordHash },
    });
    return { message: 'Senha alterada com sucesso' };
  }

  private async resolveTenantId(tenantId?: string): Promise<string | undefined> {
    if (tenantId) {
      const tenant = await this.prisma.tenant.findFirst({
        where: {
          id: tenantId,
          isRemoved: false,
          status: TenantStatus.ACTIVE,
        },
      });
      if (!tenant) {
        throw new BadRequestException('Câmara inválida ou inativa');
      }
      return tenant.id;
    }

    const defaultTenant = await this.prisma.tenant.findFirst({
      where: { isRemoved: false, status: TenantStatus.ACTIVE },
      orderBy: { createdAt: 'asc' },
    });
    return defaultTenant?.id;
  }

  private async resolveTenantForCamara(tenantId?: string, tenantCnpj?: string) {
    if (tenantId) {
      const tenant = await this.prisma.tenant.findFirst({
        where: {
          id: tenantId,
          isRemoved: false,
          status: TenantStatus.ACTIVE,
        },
      });
      if (!tenant) {
        throw new BadRequestException('Câmara inválida ou inativa');
      }
      return tenant;
    }

    if (tenantCnpj) {
      const cnpj = tenantCnpj.replace(/\D/g, '');
      const tenant = await this.prisma.tenant.findFirst({
        where: { cnpj, isRemoved: false, status: TenantStatus.ACTIVE },
      });
      if (!tenant) {
        throw new BadRequestException('Câmara não encontrada para o CNPJ informado');
      }
      return tenant;
    }

    throw new BadRequestException('Informe tenantId ou tenantCnpj');
  }
}
