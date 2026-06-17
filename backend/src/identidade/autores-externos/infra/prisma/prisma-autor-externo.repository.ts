import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginatedResult } from '../../../../common/dto/pagination.dto';
import { paginatedQuery } from '../../../../common/prisma/paginate';
import { tenantWhere } from '../../../../common/prisma/tenant-scope';
import { assertTenantScopedUpdate } from '../../../../common/prisma/tenant-scoped-update';
import { PrismaService } from '../../../../prisma/prisma.service';
import { AutorExternoEntity } from '../../domain/entities/autor-externo.entity';
import {
    AutorExternoMateriaListItem,
    AutorExternoRepository,
    AutorExternoWithTipo,
    ListAutoresExternosRepositoryQuery,
} from '../../domain/repositories/autor-externo.repository';
import { CreateAutorExternoParams, UpdateAutorExternoParams } from '../../domain/entities/autor-externo.entity';

type AutorExternoRow = Prisma.AutorExternoGetPayload<{
    include: { tipoAutor: true };
}>;

@Injectable()
export class PrismaAutorExternoRepository extends AutorExternoRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async create(data: CreateAutorExternoParams): Promise<AutorExternoWithTipo> {
        const entity = AutorExternoEntity.create(data);
        const p = entity.toPrimitives();

        const row = await this.prisma.autorExterno.create({
            data: {
                id: p.id,
                tenantId: p.tenantId,
                tipoAutorId: p.tipoAutorId,
                nome: p.nome,
                cargo: p.cargo,
                instituicao: p.instituicao,
                cpf: p.cpf,
                email: p.email,
                telefone: p.telefone,
                registro: p.registro,
                partido: p.partido,
                uf: p.uf,
            },
            include: { tipoAutor: true },
        });

        return this.toWithTipo(row);
    }

    async findMany(
        tenantId: string,
        query: ListAutoresExternosRepositoryQuery,
    ): Promise<PaginatedResult<AutorExternoWithTipo>> {
        const where: Prisma.AutorExternoWhereInput = {
            ...tenantWhere(tenantId),
        };

        if (query.tipoAutorId) where.tipoAutorId = query.tipoAutorId;
        if (query.nome?.trim()) {
            where.nome = { contains: query.nome.trim(), mode: 'insensitive' };
        }
        if (query.cargo?.trim()) {
            where.cargo = { contains: query.cargo.trim(), mode: 'insensitive' };
        }
        if (query.instituicao?.trim()) {
            where.instituicao = {
                contains: query.instituicao.trim(),
                mode: 'insensitive',
            };
        }

        return paginatedQuery<AutorExternoWithTipo>(
            () => this.prisma.autorExterno.count({ where }),
            (skip, take) =>
                this.prisma.autorExterno
                    .findMany({
                        where,
                        include: { tipoAutor: true },
                        orderBy: { nome: 'asc' },
                        skip,
                        take,
                    })
                    .then((rows) => rows.map((row) => this.toWithTipo(row))),
            { page: query.page, limit: query.limit },
        );
    }

    async findById(
        tenantId: string,
        id: string,
    ): Promise<AutorExternoWithTipo | null> {
        const row = await this.prisma.autorExterno.findFirst({
            where: { id, ...tenantWhere(tenantId) },
            include: { tipoAutor: true },
        });
        return row ? this.toWithTipo(row) : null;
    }

    async update(
        tenantId: string,
        id: string,
        data: UpdateAutorExternoParams,
    ): Promise<AutorExternoWithTipo> {
        const result = await this.prisma.autorExterno.updateMany({
            where: { id, ...tenantWhere(tenantId) },
            data: {
                ...(data.tipoAutorId !== undefined
                    ? { tipoAutorId: data.tipoAutorId }
                    : {}),
                ...(data.nome !== undefined ? { nome: data.nome.trim() } : {}),
                ...(data.cargo !== undefined
                    ? { cargo: data.cargo?.trim() || null }
                    : {}),
                ...(data.instituicao !== undefined
                    ? { instituicao: data.instituicao?.trim() || null }
                    : {}),
                ...(data.cpf !== undefined
                    ? {
                          cpf: data.cpf
                              ? data.cpf.replace(/\D/g, '') || null
                              : null,
                      }
                    : {}),
                ...(data.email !== undefined
                    ? { email: data.email?.trim() || null }
                    : {}),
                ...(data.telefone !== undefined
                    ? { telefone: data.telefone?.trim() || null }
                    : {}),
                ...(data.registro !== undefined
                    ? { registro: data.registro?.trim() || null }
                    : {}),
                ...(data.partido !== undefined
                    ? { partido: data.partido?.trim() || null }
                    : {}),
                ...(data.uf !== undefined
                    ? { uf: data.uf?.trim() || null }
                    : {}),
            },
        });
        assertTenantScopedUpdate(result.count, 'Autor externo não encontrado');

        const updated = await this.findById(tenantId, id);
        if (!updated) {
            throw new Error('Autor externo não encontrado');
        }
        return updated;
    }

    async softDelete(tenantId: string, id: string): Promise<void> {
        const result = await this.prisma.autorExterno.updateMany({
            where: { id, ...tenantWhere(tenantId) },
            data: { isRemoved: true, removedAt: new Date() },
        });
        assertTenantScopedUpdate(result.count, 'Autor externo não encontrado');
    }

    async listMaterias(
        tenantId: string,
        autorExternoId: string,
    ): Promise<AutorExternoMateriaListItem[]> {
        const rows = await this.prisma.materia.findMany({
            where: {
                ...tenantWhere(tenantId),
                autor: { autorExternoId, isRemoved: false },
            },
            include: { tipo: true, ano: true },
            orderBy: { createdAt: 'desc' },
        });

        return rows.map((row) => ({
            id: row.id,
            identificacao: this.formatIdentificacao(row),
            status: row.status,
        }));
    }

    async existsTipoAutor(tipoAutorId: string): Promise<boolean> {
        const row = await this.prisma.tipoAutor.findFirst({
            where: { id: tipoAutorId },
            select: { id: true },
        });
        return Boolean(row);
    }

    private formatIdentificacao(row: {
        tipo: { nome: string };
        numero: number | null;
        ano: { valor: number } | null;
    }): string {
        const parts = [row.tipo.nome];
        if (row.numero != null) parts.push(String(row.numero));
        if (row.ano) parts.push(String(row.ano.valor));
        return parts.join(' ');
    }

    private toWithTipo(row: AutorExternoRow): AutorExternoWithTipo {
        return {
            entity: AutorExternoEntity.restore({
                id: row.id,
                tenantId: row.tenantId,
                tipoAutorId: row.tipoAutorId,
                nome: row.nome,
                cargo: row.cargo,
                instituicao: row.instituicao,
                cpf: row.cpf,
                email: row.email,
                telefone: row.telefone,
                registro: row.registro,
                partido: row.partido,
                uf: row.uf,
                isRemoved: row.isRemoved,
                removedAt: row.removedAt,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt,
            }),
            tipoAutor: {
                id: row.tipoAutor.id,
                nome: row.tipoAutor.nome,
                idNegocio: row.tipoAutor.idNegocio,
            },
        };
    }
}
