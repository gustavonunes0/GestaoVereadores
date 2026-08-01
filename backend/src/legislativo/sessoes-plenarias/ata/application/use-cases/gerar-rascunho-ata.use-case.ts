import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { ATA_REPOSITORY, SESSAO_PLENARIA_REPOSITORY } from '../../../sessoes-plenarias.tokens';
import { SessaoPlenariaRepository } from '../../../domain/repositories/sessao-plenaria.repository';
import { StatusSessao } from '../../../domain/enums/status-sessao.enum';
import { AtaRepository } from '../../domain/repositories/ata.repository';
import { AtaTemplateService } from '../../domain/services/ata-template.service';
import { AtaSessaoNaoEncerradaError, AtaJaExisteError } from '../errors/ata.errors';
import { AtaViewModel } from '../view-models/ata.view-model';
import { SessaoHistoricoRepository } from '../../../../sessao-historico/domain/repositories/sessao-historico.repository';
import { TipoEventoSessaoHistorico } from '../../../../sessao-historico/domain/enums/tipo-evento-sessao-historico.enum';

@Injectable()
export class GerarRascunhoAtaUseCase {
    private readonly templateService = new AtaTemplateService();

    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly sessaoRepository: SessaoPlenariaRepository,
        @Inject(ATA_REPOSITORY)
        private readonly ataRepository: AtaRepository,
        private readonly prisma: PrismaService,
        private readonly historicoRepository: SessaoHistoricoRepository,
    ) {}

    async execute(tenantId: string, sessaoId: string) {
        const sessao = await this.sessaoRepository.findSessaoById(sessaoId, tenantId);
        if (!sessao) throw new NotFoundException('Sessão plenária não encontrada');

        if (sessao.statusSessao !== StatusSessao.ENCERRADA) {
            throw new AtaSessaoNaoEncerradaError();
        }

        const existente = await this.ataRepository.findBySessaoId(sessaoId, tenantId);
        if (existente) throw new AtaJaExisteError();

        const dadosSessao = await this.prisma.sessaoPlenaria.findFirst({
            where: { id: sessaoId, tenantId },
            include: {
                tipoSessao: { select: { nome: true } },
                responsavelAbertura: {
                    select: { user: { select: { firstName: true, lastName: true } } },
                },
                presencas: {
                    include: {
                        parlamentar: { include: { pessoa: true } },
                        parliamentarian: {
                            include: {
                                parliamentarianUser: { include: { politicalParty: true } },
                            },
                        },
                    },
                },
                pautaItens: {
                    where: { isRemoved: false },
                    orderBy: { ordem: 'asc' },
                    include: { materia: { include: { tipo: true } } },
                },
            },
        });
        if (!dadosSessao) throw new NotFoundException('Sessão plenária não encontrada');

        const presencas = dadosSessao.presencas.map((p) => {
            const nomeParlamentar =
                p.parliamentarian?.parliamentaryName ??
                p.parlamentar?.pessoa?.nomeParlamentar ??
                p.parlamentar?.pessoa?.nome ??
                'Parlamentar';
            const partido = p.parliamentarian?.parliamentarianUser?.politicalParty?.acronym ?? null;
            return { nome: nomeParlamentar, partido, situacao: p.situacao };
        });

        const materias = dadosSessao.pautaItens
            .filter((item) => item.materia)
            .map((item) => ({
                identificacao: `${item.materia!.sigla ?? item.materia!.tipo?.nome ?? 'Matéria'} nº ${
                    item.materia!.numero ?? '—'
                }`,
                ementa: item.materia!.ementa,
                resultado: item.resultado,
            }));

        const presidenteNome = dadosSessao.responsavelAbertura?.user
            ? `${dadosSessao.responsavelAbertura.user.firstName} ${dadosSessao.responsavelAbertura.user.lastName}`.trim()
            : null;

        const conteudo = this.templateService.montar({
            tipoSessaoNome: dadosSessao.tipoSessao?.nome ?? 'Sessão Plenária',
            dataInicio: dadosSessao.dataInicio,
            dataAbertura: dadosSessao.dataAbertura,
            dataEncerramento: dadosSessao.dataEncerramento,
            presidenteNome,
            presencas,
            materias,
        });

        const ata = await this.ataRepository.create({
            tenantId,
            sessaoPlenariaId: sessaoId,
            conteudo,
            geradaAutomaticamente: true,
        });

        await this.historicoRepository.registrar({
            sessaoId,
            tipoEvento: TipoEventoSessaoHistorico.ATA_GERADA,
            descricao: 'Rascunho da ata gerado automaticamente',
        });

        return AtaViewModel.toHttp(ata);
    }
}
