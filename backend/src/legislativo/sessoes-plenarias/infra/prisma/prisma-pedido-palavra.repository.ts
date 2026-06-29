import { Injectable } from '@nestjs/common';
import { StatusPedidoPalavra as PrismaStatus } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { PedidoPalavraEntity, StatusPedidoPalavra } from '../../domain/entities/pedido-palavra.entity';
import {
    CreatePedidoPalavraData,
    PedidoPalavraRepository,
    UpdatePedidoData,
} from '../../domain/repositories/pedido-palavra.repository';

function toEntity(raw: {
    id: string;
    sessaoId: string;
    parliamentarianId: string;
    status: PrismaStatus;
    criadoEm: Date;
    respondidoEm: Date | null;
    encerradoEm: Date | null;
    duracaoSegundos: number | null;
}): PedidoPalavraEntity {
    const entity = new PedidoPalavraEntity();
    entity.id = raw.id;
    entity.sessaoId = raw.sessaoId;
    entity.parliamentarianId = raw.parliamentarianId;
    entity.status = raw.status as StatusPedidoPalavra;
    entity.criadoEm = raw.criadoEm;
    if (raw.respondidoEm) entity.respondidoEm = raw.respondidoEm;
    if (raw.encerradoEm) entity.encerradoEm = raw.encerradoEm;
    if (raw.duracaoSegundos !== null) entity.duracaoSegundos = raw.duracaoSegundos;
    return entity;
}

@Injectable()
export class PrismaPedidoPalavraRepository extends PedidoPalavraRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async create(dados: CreatePedidoPalavraData): Promise<PedidoPalavraEntity> {
        const raw = await this.prisma.pedidoPalavra.create({
            data: {
                sessaoId: dados.sessaoId,
                parliamentarianId: dados.parliamentarianId,
            },
        });
        return toEntity(raw);
    }

    async findById(id: string, tenantId: string): Promise<PedidoPalavraEntity | null> {
        const raw = await this.prisma.pedidoPalavra.findFirst({
            where: { id, sessao: { tenantId } },
        });
        return raw ? toEntity(raw) : null;
    }

    async findAtivo(sessaoId: string, parliamentarianId: string): Promise<PedidoPalavraEntity | null> {
        const raw = await this.prisma.pedidoPalavra.findFirst({
            where: {
                sessaoId,
                parliamentarianId,
                status: { in: ['AGUARDANDO', 'CONCEDIDO'] },
            },
        });
        return raw ? toEntity(raw) : null;
    }

    async findFila(sessaoId: string, tenantId: string): Promise<PedidoPalavraEntity[]> {
        const rows = await this.prisma.pedidoPalavra.findMany({
            where: { sessaoId, sessao: { tenantId } },
            orderBy: { criadoEm: 'asc' },
        });
        return rows.map(toEntity);
    }

    async updateStatus(id: string, status: StatusPedidoPalavra, dados?: UpdatePedidoData): Promise<PedidoPalavraEntity> {
        const raw = await this.prisma.pedidoPalavra.update({
            where: { id },
            data: {
                status: status as PrismaStatus,
                ...(dados?.respondidoEm && { respondidoEm: dados.respondidoEm }),
                ...(dados?.encerradoEm && { encerradoEm: dados.encerradoEm }),
                ...(dados?.duracaoSegundos !== undefined && { duracaoSegundos: dados.duracaoSegundos }),
            },
        });
        return toEntity(raw);
    }
}
