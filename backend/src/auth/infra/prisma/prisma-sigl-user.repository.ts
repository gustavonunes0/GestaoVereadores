import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { SiglUserEntity } from '../../domain/entities/sigl-user.entity';
import {
    CreateSiglUserInput,
    SiglUserListItem,
    SiglUserProfile,
    SiglUserRepository,
    UpdateSiglUserInput,
} from '../../domain/repositories/sigl-user.repository';

@Injectable()
export class PrismaSiglUserRepository extends SiglUserRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async findByUsername(username: string): Promise<SiglUserEntity | null> {
        const row = await this.prisma.usuario.findUnique({
            where: { username },
        });
        return row ? this.toEntity(row) : null;
    }

    async findById(id: string): Promise<SiglUserEntity | null> {
        const row = await this.prisma.usuario.findUnique({ where: { id } });
        return row ? this.toEntity(row) : null;
    }

    async findProfileById(id: string): Promise<SiglUserProfile | null> {
        return this.prisma.usuario.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                nome: true,
                role: true,
                ativo: true,
            },
        });
    }

    async count(): Promise<number> {
        return this.prisma.usuario.count();
    }

    async findMany(skip: number, take: number): Promise<SiglUserListItem[]> {
        return this.prisma.usuario.findMany({
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
        });
    }

    async existsByUsername(username: string): Promise<boolean> {
        const count = await this.prisma.usuario.count({ where: { username } });
        return count > 0;
    }

    async create(input: CreateSiglUserInput): Promise<SiglUserListItem> {
        return this.prisma.usuario.create({
            data: {
                username: input.username,
                passwordHash: input.passwordHash,
                nome: input.nome,
                role: input.role,
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

    async update(
        id: string,
        input: UpdateSiglUserInput,
    ): Promise<SiglUserListItem> {
        return this.prisma.usuario.update({
            where: { id },
            data: {
                nome: input.nome,
                role: input.role,
                ativo: input.ativo,
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

    async updatePassword(id: string, passwordHash: string): Promise<void> {
        await this.prisma.usuario.update({
            where: { id },
            data: { passwordHash },
        });
    }

    private toEntity(row: {
        id: string;
        username: string;
        nome: string;
        role: SiglUserEntity['role'];
        ativo: boolean;
        passwordHash: string;
        createdAt?: Date;
    }): SiglUserEntity {
        return new SiglUserEntity({
            id: row.id,
            username: row.username,
            nome: row.nome,
            role: row.role,
            ativo: row.ativo,
            passwordHash: row.passwordHash,
            createdAt: row.createdAt,
        });
    }
}
