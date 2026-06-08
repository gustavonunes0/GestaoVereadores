import { Injectable } from '@nestjs/common';
import { AgendaLegislativa as PrismaAgenda, Prisma } from '@prisma/client';
import { paginatedQuery } from '../../../../common/prisma/paginate';
import { assertTenantScopedUpdate } from '../../../../common/prisma/tenant-scoped-update';
import { tenantWhere } from '../../../../common/prisma/tenant-scope';
import { PrismaService } from '../../../../prisma/prisma.service';
import { AgendaEventType } from '../../domain/enums/agenda-event-type.enum';
import {
    AgendaLegislativaEntity,
    AgendaLegislativaPrimitives,
} from '../../domain/entities/agenda-legislativa.entity';
import {
    AgendaLegislativaRepository,
    CreateAgendaLegislativaInput,
    ListAgendasLegislativasQuery,
    UpdateAgendaLegislativaInput,
} from '../../domain/repositories/agenda-legislativa.repository';

@Injectable()
export class PrismaAgendaLegislativaRepository extends AgendaLegislativaRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async create(data: CreateAgendaLegislativaInput) {
        const row = await this.prisma.agendaLegislativa.create({
            data: {
                tenantId: data.tenantId,
                tipo: data.tipo ?? undefined,
                numero: data.numero ?? null,
                titulo: data.titulo ?? null,
                mensagem: data.mensagem ?? null,
                dataInicio: data.dataInicio ?? null,
                dataFim: data.dataFim ?? null,
            },
        });
        return this.toEntity(row);
    }

    findAll(tenantId: string, query: ListAgendasLegislativasQuery) {
        const where: Prisma.AgendaLegislativaWhereInput = {
            ...tenantWhere(tenantId),
        };

        if (query.tipo) {
            where.tipo = query.tipo;
        }

        if (query.dataInicioDe || query.dataInicioAte) {
            where.dataInicio = {};
            if (query.dataInicioDe) {
                where.dataInicio.gte = query.dataInicioDe;
            }
            if (query.dataInicioAte) {
                where.dataInicio.lte = query.dataInicioAte;
            }
        }

        return paginatedQuery(
            () => this.prisma.agendaLegislativa.count({ where }),
            (skip, take) =>
                this.prisma.agendaLegislativa
                    .findMany({
                        where,
                        orderBy: [{ dataInicio: 'asc' }, { createdAt: 'desc' }],
                        skip,
                        take,
                    })
                    .then((rows) => rows.map((row) => this.toEntity(row))),
            query,
        );
    }

    async findOne(tenantId: string, id: string) {
        const row = await this.prisma.agendaLegislativa.findFirst({
            where: { id, ...tenantWhere(tenantId) },
        });
        return row ? this.toEntity(row) : null;
    }

    async update(
        tenantId: string,
        id: string,
        data: UpdateAgendaLegislativaInput,
    ) {
        const result = await this.prisma.agendaLegislativa.updateMany({
            where: { id, ...tenantWhere(tenantId) },
            data: {
                ...(data.tipo !== undefined ? { tipo: data.tipo } : {}),
                ...(data.numero !== undefined ? { numero: data.numero } : {}),
                ...(data.titulo !== undefined ? { titulo: data.titulo } : {}),
                ...(data.mensagem !== undefined
                    ? { mensagem: data.mensagem }
                    : {}),
                ...(data.dataInicio !== undefined
                    ? { dataInicio: data.dataInicio }
                    : {}),
                ...(data.dataFim !== undefined ? { dataFim: data.dataFim } : {}),
            },
        });
        assertTenantScopedUpdate(result.count, 'Agenda não encontrada');
        const updated = await this.findOne(tenantId, id);
        if (!updated) {
            throw new Error('Agenda não encontrada');
        }
        return updated;
    }

    async remove(tenantId: string, id: string) {
        const existing = await this.findOne(tenantId, id);
        if (!existing) {
            throw new Error('Agenda não encontrada');
        }

        const result = await this.prisma.agendaLegislativa.updateMany({
            where: { id, ...tenantWhere(tenantId) },
            data: { isRemoved: true },
        });
        assertTenantScopedUpdate(result.count, 'Agenda não encontrada');

        return AgendaLegislativaEntity.restore({
            ...existing.toPrimitives(),
            isRemoved: true,
        });
    }

    private toEntity(row: PrismaAgenda): AgendaLegislativaEntity {
        const primitives: AgendaLegislativaPrimitives = {
            id: row.id,
            tenantId: row.tenantId,
            tipo: row.tipo as AgendaEventType | null,
            numero: row.numero,
            titulo: row.titulo,
            dataInicio: row.dataInicio,
            dataFim: row.dataFim,
            mensagem: row.mensagem,
            isRemoved: row.isRemoved,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        };
        return AgendaLegislativaEntity.restore(primitives);
    }
}
