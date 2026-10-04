import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ExercicioMandatoService } from '../../../parlamentares/substituicoes/infra/prisma/exercicio-mandato.service';

/** Quem ocupa cada vaga na sessão — usado pela mesa e pelo app do vereador. */
@Injectable()
export class GetElencoExercicioUseCase {
    constructor(
        private readonly prisma: PrismaService,
        private readonly exercicioMandato: ExercicioMandatoService,
    ) {}

    async execute(tenantId: string, sessaoId: string) {
        const { congelado, vagas } = await this.exercicioMandato.elencoDaSessao(
            tenantId,
            sessaoId,
        );
        const ids = [...new Set(vagas.flatMap((v) => [v.titularId, v.emExercicioId]))];
        const parlamentares = await this.prisma.parliamentarian.findMany({
            where: { id: { in: ids }, tenantId },
            select: { id: true, parliamentaryName: true },
        });
        const porId = new Map(parlamentares.map((p) => [p.id, p]));
        const resumo = (id: string) => porId.get(id) ?? { id, parliamentaryName: '' };

        return {
            sessaoId,
            congelado,
            vagas: vagas.map((v) => ({
                titular: resumo(v.titularId),
                emExercicio: resumo(v.emExercicioId),
                substituicaoId: v.substituicaoId,
            })),
        };
    }
}
