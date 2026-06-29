import { Inject, Injectable } from '@nestjs/common';
import { SESSAO_PLENARIA_REPOSITORY } from '../../sessoes-plenarias.tokens';
import { SessaoPlenariaRepository } from '../../domain/repositories/sessao-plenaria.repository';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ParlamentarianJwtPayload } from '../../../../auth/domain/types/jwt-payload.type';
import { PresidenciaService } from '../../domain/services/presidencia.service';

@Injectable()
export class GetSessaoAtivaUseCase {
    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly repository: SessaoPlenariaRepository,
        private readonly prisma: PrismaService,
        private readonly presidenciaService: PresidenciaService,
    ) {}

    async execute(user: ParlamentarianJwtPayload) {
        const sessao = await this.repository.findAtiva(user.tenantId);
        if (!sessao) return null;

        const [minhaPresenca, votacaoAberta, euSouPresidente] = await Promise.all([
            this.prisma.presencaSessao.findUnique({
                where: {
                    sessaoId_parliamentarianId: {
                        sessaoId: sessao.id,
                        parliamentarianId: user.parliamentarianId,
                    },
                },
                select: { presente: true, situacao: true, autoRegistrado: true },
            }),
            this.prisma.votacao.findFirst({
                where: {
                    pautaItem: {
                        sessaoId: sessao.id,
                        isRemoved: false,
                    },
                    realizadaAt: null,
                },
                include: {
                    pautaItem: {
                        select: {
                            id: true,
                            ordem: true,
                            materia: { select: { id: true, ementa: true } },
                        },
                    },
                },
            }),
            this.presidenciaService.isPresidente(user.parliamentarianId, user.tenantId),
        ]);

        return {
            id: sessao.id,
            statusSessao: sessao.statusSessao,
            faseAtual: sessao.faseAtual,
            minhaPresenca: minhaPresenca
                ? { presente: minhaPresenca.presente, situacao: minhaPresenca.situacao, autoRegistrado: minhaPresenca.autoRegistrado }
                : null,
            votacaoAberta: votacaoAberta
                ? {
                      votacaoId: votacaoAberta.id,
                      tipoVotacao: votacaoAberta.tipoVotacao,
                      pautaItem: votacaoAberta.pautaItem,
                  }
                : null,
            euSouPresidente,
        };
    }
}
