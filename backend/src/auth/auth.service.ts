import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { paginatedQuery } from '../common/prisma/paginate';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import {
  ChangePasswordDto,
  CreateUsuarioDto,
  UpdateUsuarioDto,
} from './dto/usuario.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
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
    const payload = { sub: user.id, username: user.username, role: user.role };
    return {
      access_token: this.jwt.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        nome: user.nome,
        role: user.role,
      },
    };
  }

  async me(userId: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: { id: true, username: true, nome: true, role: true, ativo: true },
    });
    if (!user) throw new UnauthorizedException();
    return user;
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
    const user = await this.prisma.usuario.create({
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
    return user;
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
}
