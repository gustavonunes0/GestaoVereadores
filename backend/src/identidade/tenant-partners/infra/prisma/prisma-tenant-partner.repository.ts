import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { paginatedQuery } from '../../../../common/prisma/paginate';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
    TenantPartnerEntity,
    TenantPartnerPrimitives,
    TipoAutorData,
} from '../../domain/entities/tenant-partner.entity';
import { TenantPartnerRepository } from '../../domain/repositories/tenant-partner.repository';

/** idNegocio 10 = Sociedade — tipo genérico para parceiros sem classificação explícita */
const DEFAULT_PARTNER_TIPO_AUTOR_ID_NEGOCIO = 10;

@Injectable()
export class PrismaTenantPartnerRepository extends TenantPartnerRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async findDefaultTipoAutorId(): Promise<string | null> {
        const tipo = await this.prisma.tipoAutor.findFirst({
            where: {
                tenantId: null,
                idNegocio: DEFAULT_PARTNER_TIPO_AUTOR_ID_NEGOCIO,
            },
            select: { id: true },
        });
        return tipo?.id ?? null;
    }

    private static readonly TIPO_AUTOR_SELECT = {
        id: true,
        nome: true,
        idNegocio: true,
    } as const;

    async create(partner: TenantPartnerEntity): Promise<TenantPartnerEntity> {
        const data = partner.toPrimitives();
        const row = await this.prisma.tenantPartner.create({
            data,
            include: { tipoAutor: { select: PrismaTenantPartnerRepository.TIPO_AUTOR_SELECT } },
        });
        return this.toEntity(row);
    }

    async findMany(
        tenantId: string,
        query: { nome?: string; page?: number; limit?: number },
    ) {
        const where: Prisma.TenantPartnerWhereInput = {
            tenantId,
            isRemoved: false,
        };
        if (query.nome?.trim()) {
            where.nome = { contains: query.nome.trim(), mode: 'insensitive' };
        }

        return paginatedQuery(
            () => this.prisma.tenantPartner.count({ where }),
            (skip, take) =>
                this.prisma.tenantPartner
                    .findMany({
                        where,
                        include: {
                            tipoAutor: {
                                select: PrismaTenantPartnerRepository.TIPO_AUTOR_SELECT,
                            },
                        },
                        orderBy: { nome: 'asc' },
                        skip,
                        take,
                    })
                    .then((rows) => rows.map((row) => this.toEntity(row))),
            { page: query.page, limit: query.limit },
        );
    }

    async findById(tenantId: string, id: string): Promise<TenantPartnerEntity | null> {
        const row = await this.prisma.tenantPartner.findFirst({
            where: { id, tenantId, isRemoved: false },
            include: { tipoAutor: { select: PrismaTenantPartnerRepository.TIPO_AUTOR_SELECT } },
        });
        return row ? this.toEntity(row) : null;
    }

    async update(partner: TenantPartnerEntity): Promise<TenantPartnerEntity> {
        const data = partner.toPrimitives();
        const row = await this.prisma.tenantPartner.update({
            where: { id: data.id },
            data: {
                tipoAutorId: data.tipoAutorId,
                nome: data.nome,
                cargo: data.cargo,
                instituicao: data.instituicao,
                cpf: data.cpf,
                email: data.email,
                telefone: data.telefone,
                registro: data.registro,
                partido: data.partido,
                uf: data.uf,
                updatedAt: data.updatedAt,
            },
            include: { tipoAutor: { select: PrismaTenantPartnerRepository.TIPO_AUTOR_SELECT } },
        });
        return this.toEntity(row);
    }

    async remove(tenantId: string, id: string): Promise<void> {
        const now = new Date();
        await this.prisma.tenantPartner.update({
            where: { id },
            data: { isRemoved: true, removedAt: now, updatedAt: now },
        });
    }

    private toEntity(row: TenantPartnerPrimitives & { tipoAutor?: TipoAutorData | null }): TenantPartnerEntity {
        return TenantPartnerEntity.restore({
            ...row,
            tipoAutor: row.tipoAutor ?? undefined,
        });
    }
}
