import { Inject, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { SituacaoPresenca } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { SESSAO_PLENARIA_REPOSITORY } from '../../sessoes-plenarias.tokens';
import { SessaoPlenariaRepository } from '../../domain/repositories/sessao-plenaria.repository';
import { StatusSessao } from '../../domain/enums/status-sessao.enum';
import { SessaoHistoricoRepository } from '../../../sessao-historico/domain/repositories/sessao-historico.repository';
import { TipoEventoSessaoHistorico } from '../../../sessao-historico/domain/enums/tipo-evento-sessao-historico.enum';
import { ExercicioMandatoService } from '../../../parlamentares/substituicoes/infra/prisma/exercicio-mandato.service';

@Injectable()
export class ChamarVereadoresUseCase {
    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly repository: SessaoPlenariaRepository,
        private readonly prisma: PrismaService,
        private readonly historicoRepository: SessaoHistoricoRepository,
        private readonly exercicioMandato: ExercicioMandatoService,
    ) {}

    async execute(tenantId: string, sessaoId: string, responsavelId?: string) {
        const sessao = await this.repository.findSessaoById(sessaoId, tenantId);
        if (!sessao) throw new NotFoundException('Sessão plenária não encontrada');

        if (sessao.statusSessao !== StatusSessao.ABERTA) {
            throw new UnprocessableEntityException(
                'A chamada dos vereadores só pode ser realizada com a sessão aberta',
            );
        }

        const emExercicio = await this.exercicioMandato.idsEmExercicioDaSessao(
            tenantId,
            sessaoId,
        );
        const parlamentares = [...emExercicio].map((id) => ({ id }));

        const existentes = await this.prisma.presencaSessao.findMany({
            where: { sessaoId, parliamentarianId: { not: null } },
            select: { parliamentarianId: true },
        });
        const jaRegistrados = new Set(existentes.map((e) => e.parliamentarianId));

        const faltantes = parlamentares.filter((p) => !jaRegistrados.has(p.id));

        if (faltantes.length > 0) {
            await this.prisma.presencaSessao.createMany({
                data: faltantes.map((p) => ({
                    sessaoId,
                    parliamentarianId: p.id,
                    presente: false,
                    situacao: SituacaoPresenca.AUSENTE,
                })),
                skipDuplicates: true,
            });
        }

        const totalPresentes = await this.prisma.presencaSessao.count({
            where: {
                sessaoId,
                situacao: SituacaoPresenca.PRESENTE,
                parliamentarianId: { in: [...emExercicio] },
            },
        });
        const totalAusentes = parlamentares.length - totalPresentes;

        await this.historicoRepository.registrar({
            sessaoId,
            tipoEvento: TipoEventoSessaoHistorico.CHAMADA_REALIZADA,
            responsavelId,
            descricao: `Chamada realizada — ${totalPresentes} presentes, ${totalAusentes} ausentes`,
            metadata: { totalPresentes, totalAusentes, totalParlamentares: parlamentares.length },
        });

        return { totalParlamentares: parlamentares.length, totalPresentes, totalAusentes };
    }
}
