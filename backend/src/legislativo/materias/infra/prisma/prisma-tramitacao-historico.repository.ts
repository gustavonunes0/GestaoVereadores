import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { TramitacaoHistorico } from '../../domain/entities/tramitacao-historico.entity';
import { MatterStatus } from '../../domain/enums/matter-status.enum';
import { TramitacaoHistoricoRepository } from '../../domain/repositories/tramitacao-historico.repository';

@Injectable()
export class PrismaTramitacaoHistoricoRepository
    implements TramitacaoHistoricoRepository
{
    constructor(private readonly prisma: PrismaService) {}

    async findByMateriaId(
        materiaId: string,
        tenantId: string,
    ): Promise<TramitacaoHistorico[]> {
        const materia = await this.prisma.materia.findFirst({
            where: { id: materiaId, tenantId, isRemoved: false },
        });
        if (!materia) throw new NotFoundException('Matéria não encontrada');

        const rows = await this.prisma.tramitacaoHistorico.findMany({
            where: { materiaId },
            orderBy: { dataHora: 'desc' },
        });

        return rows.map(
            (r) =>
                new TramitacaoHistorico({
                    id: r.id,
                    materiaId: r.materiaId,
                    dataHora: r.dataHora,
                    statusAnterior: (r.statusAnterior as MatterStatus) ?? null,
                    statusNovo: r.statusNovo as MatterStatus,
                    responsavelId: r.responsavelId,
                    despacho: r.despacho,
                    observacao: r.observacao,
                    unidadeOrigemId: r.unidadeOrigemId,
                    unidadeDestinoId: r.unidadeDestinoId,
                }),
        );
    }
}
