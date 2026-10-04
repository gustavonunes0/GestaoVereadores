import { Inject, Injectable } from '@nestjs/common';
import {
    AcaoSubstituicaoHistorico,
    StatusSubstituicao,
} from '../../domain/enums/substituicao.enums';
import { SubstituicaoRepository } from '../../domain/repositories/substituicao.repository';
import {
    dataCivilDoInstante,
    planejarEncerramento,
} from '../../domain/services/exercicio-mandato';
import { SUBSTITUICAO_REPOSITORY } from '../../substituicoes.tokens';
import {
    SubstituicaoNaoEditavelError,
    SubstituicaoNotFoundError,
} from '../errors/substituicao.errors';
import { SubstituicaoViewModel } from '../view-models/substituicao.view-model';

@Injectable()
export class EncerrarSubstituicaoUseCase {
    agora = () => new Date();

    constructor(
        @Inject(SUBSTITUICAO_REPOSITORY)
        private readonly repository: SubstituicaoRepository,
    ) {}

    async execute(tenantId: string, id: string, responsavelId?: string) {
        const atual = await this.repository.findById(tenantId, id);
        if (!atual) throw new SubstituicaoNotFoundError();
        if (atual.status !== StatusSubstituicao.ATIVA) {
            throw new SubstituicaoNaoEditavelError();
        }

        const agora = this.agora();
        const hoje = dataCivilDoInstante(agora);
        const plano = planejarEncerramento(atual, hoje);

        const saved = await this.repository.update(
            tenantId,
            id,
            {
                status: plano.status,
                dataFim: plano.dataFim,
                encerradaEm: agora,
                encerradoPorId: responsavelId ?? null,
            },
            {
                acao:
                    plano.status === StatusSubstituicao.CANCELADA
                        ? AcaoSubstituicaoHistorico.CANCELADA
                        : AcaoSubstituicaoHistorico.ENCERRADA,
                responsavelId: responsavelId ?? null,
                alteracoes: {
                    status: { antes: atual.status, depois: plano.status },
                    dataFim: { antes: atual.dataFim, depois: plano.dataFim },
                },
            },
        );
        return SubstituicaoViewModel.toHttp(saved, hoje);
    }
}
