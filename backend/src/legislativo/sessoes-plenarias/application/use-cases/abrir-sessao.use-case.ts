import { BadRequestException, Inject, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { SESSAO_PLENARIA_REPOSITORY } from '../../sessoes-plenarias.tokens';
import { SessaoPlenariaRepository } from '../../domain/repositories/sessao-plenaria.repository';
import { StatusSessao } from '../../domain/enums/status-sessao.enum';
import { FaseSessao } from '../../domain/enums/fase-sessao.enum';
import { AbrirSessaoDto } from '../dto/abrir-sessao.dto';
import { QuorumService } from '../../domain/services/quorum.service';

const QUORUM_MINIMO_SESSAO_TESTE = 1;

@Injectable()
export class AbrirSessaoUseCase {
    private readonly quorumService = new QuorumService();

    constructor(
        @Inject(SESSAO_PLENARIA_REPOSITORY)
        private readonly repository: SessaoPlenariaRepository,
    ) {}

    async execute(
        tenantId: string,
        sessaoId: string,
        dto: AbrirSessaoDto,
        responsavelId?: string,
    ): Promise<{ statusSessao: StatusSessao; quorumPresente: number | null; modoTeste: boolean }> {
        const sessao = await this.repository.findSessaoById(sessaoId, tenantId);
        if (!sessao) throw new NotFoundException('Sessão plenária não encontrada');

        if (!sessao.podeTransicionarPara(StatusSessao.ABERTA)) {
            throw new BadRequestException(
                `Transição inválida: ${sessao.statusSessao} → ${StatusSessao.ABERTA}`,
            );
        }

        const modoTeste = dto.modoTeste === true;
        const quorumInfo = await this.repository.calcularQuorum(sessaoId, tenantId);
        const quorumPresente = dto.quorumPresente ?? quorumInfo.quorumPresente;

        if (!modoTeste) {
            const infoAtual = this.quorumService.verificarAtual(
                quorumPresente,
                quorumInfo.quorumMinimo,
            );

            if (!infoAtual.temQuorum) {
                throw new UnprocessableEntityException(
                    `Quórum insuficiente: ${quorumPresente} presentes, mínimo ${quorumInfo.quorumMinimo}`,
                );
            }
        } else if (quorumPresente < QUORUM_MINIMO_SESSAO_TESTE) {
            throw new UnprocessableEntityException(
                'Sessão de teste exige ao menos 1 parlamentar presente',
            );
        }

        await this.repository.transicionarStatus(sessaoId, tenantId, {
            novoStatus: StatusSessao.ABERTA,
            responsavelId,
            observacao: dto.observacao,
            quorumPresente,
            quorumMinimo: modoTeste ? QUORUM_MINIMO_SESSAO_TESTE : quorumInfo.quorumMinimo,
            modoTeste,
        });

        // RN-SPL-02: ao abrir, fase vai automaticamente para EXPEDIENTE
        await this.repository.setFase(sessaoId, tenantId, FaseSessao.EXPEDIENTE);

        return { statusSessao: StatusSessao.ABERTA, quorumPresente, modoTeste };
    }
}
