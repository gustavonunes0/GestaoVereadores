import { Injectable, Logger } from '@nestjs/common';
import { Prisma, TipoEventoSessaoHistorico as PrismaTipoEvento } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { SessaoHistoricoEntity } from '../../domain/entities/sessao-historico.entity';
import { TipoEventoSessaoHistorico } from '../../domain/enums/tipo-evento-sessao-historico.enum';
import {
    ListSessaoHistoricoParams,
    RegistrarHistoricoDados,
    SessaoHistoricoRepository,
} from '../../domain/repositories/sessao-historico.repository';

type RawSessaoHistorico = {
    id: string;
    sessaoId: string;
    tipoEvento: PrismaTipoEvento;
    dataHora: Date;
    responsavelId: string | null;
    descricao: string | null;
    metadataJson: Prisma.JsonValue;
    responsavel?: { user?: { firstName?: string | null; lastName?: string | null } | null } | null;
};

function toEntity(raw: RawSessaoHistorico): SessaoHistoricoEntity {
    const entity = new SessaoHistoricoEntity();
    entity.id = raw.id;
    entity.sessaoId = raw.sessaoId;
    entity.tipoEvento = raw.tipoEvento as unknown as TipoEventoSessaoHistorico;
    entity.dataHora = raw.dataHora;
    entity.responsavelId = raw.responsavelId;
    entity.responsavelNome = raw.responsavel?.user
        ? `${raw.responsavel.user.firstName ?? ''} ${raw.responsavel.user.lastName ?? ''}`.trim() || null
        : null;
    entity.descricao = raw.descricao;
    entity.metadata = (raw.metadataJson as Record<string, unknown> | null) ?? null;
    return entity;
}

@Injectable()
export class PrismaSessaoHistoricoRepository extends SessaoHistoricoRepository {
    private readonly logger = new Logger(PrismaSessaoHistoricoRepository.name);

    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async registrar(dados: RegistrarHistoricoDados): Promise<void> {
        try {
            await this.prisma.sessaoHistorico.create({
                data: {
                    sessaoId: dados.sessaoId,
                    tipoEvento: dados.tipoEvento as unknown as PrismaTipoEvento,
                    responsavelId: dados.responsavelId ?? undefined,
                    descricao: dados.descricao,
                    metadataJson: dados.metadata
                        ? (dados.metadata as Prisma.InputJsonValue)
                        : undefined,
                },
            });
        } catch (error) {
            // Log de auditoria é melhor-esforço — nunca deve derrubar a operação de negócio
            // que o originou (abrir sessão, encerrar votação etc.).
            this.logger.warn(
                `Falha ao registrar histórico da sessão ${dados.sessaoId} (${dados.tipoEvento}): ${
                    error instanceof Error ? error.message : error
                }`,
            );
        }
    }

    async findMany(
        sessaoId: string,
        tenantId: string,
        params: ListSessaoHistoricoParams,
    ): Promise<{ data: SessaoHistoricoEntity[]; total: number }> {
        const page = Math.max(params.page ?? 1, 1);
        const limit = Math.min(Math.max(params.limit ?? 20, 1), 100);
        const skip = (page - 1) * limit;

        const where: Prisma.SessaoHistoricoWhereInput = {
            sessaoId,
            sessao: { tenantId },
        };
        if (params.tipoEvento) {
            where.tipoEvento = params.tipoEvento as unknown as PrismaTipoEvento;
        }

        const [total, rows] = await Promise.all([
            this.prisma.sessaoHistorico.count({ where }),
            this.prisma.sessaoHistorico.findMany({
                where,
                include: {
                    responsavel: {
                        include: { user: { select: { firstName: true, lastName: true } } },
                    },
                },
                orderBy: { dataHora: 'desc' },
                skip,
                take: limit,
            }),
        ]);

        return { data: rows.map(toEntity), total };
    }
}
