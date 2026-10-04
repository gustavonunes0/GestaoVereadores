import { Inject, Injectable } from '@nestjs/common';
import { CondicaoMandato } from '../../../mandatos/domain/enums/condicao-mandato.enum';
import { SubstituicaoRepository } from '../../domain/repositories/substituicao.repository';
import { dataCivilDoInstante } from '../../domain/services/exercicio-mandato';
import { SUBSTITUICAO_REPOSITORY } from '../../substituicoes.tokens';
import {
    SubstituicaoNotFoundError,
    TitularInvalidoError,
} from '../errors/substituicao.errors';
import { SubstituicaoViewModel } from '../view-models/substituicao.view-model';

@Injectable()
export class ListSubstituicoesUseCase {
    agora = () => new Date();

    constructor(
        @Inject(SUBSTITUICAO_REPOSITORY)
        private readonly repository: SubstituicaoRepository,
    ) {}

    async execute(tenantId: string, parliamentarianId: string) {
        const hoje = dataCivilDoInstante(this.agora());
        const items = await this.repository.listByParlamentar(tenantId, parliamentarianId);
        return items.map((s) => SubstituicaoViewModel.toHttp(s, hoje));
    }
}

@Injectable()
export class ListSubstituicaoHistoricoUseCase {
    constructor(
        @Inject(SUBSTITUICAO_REPOSITORY)
        private readonly repository: SubstituicaoRepository,
    ) {}

    async execute(tenantId: string, id: string) {
        const substituicao = await this.repository.findById(tenantId, id);
        if (!substituicao) throw new SubstituicaoNotFoundError();
        const historico = await this.repository.listHistorico(tenantId, id);
        return historico.map((h) => SubstituicaoViewModel.historicoToHttp(h));
    }
}

/** Suplentes da legislatura do titular; os do mesmo partido vêm primeiro. */
@Injectable()
export class ListSuplentesElegiveisUseCase {
    constructor(
        @Inject(SUBSTITUICAO_REPOSITORY)
        private readonly repository: SubstituicaoRepository,
    ) {}

    async execute(tenantId: string, titularId: string) {
        const mandato = await this.repository.findMandatoAtivo(tenantId, titularId);
        if (!mandato || mandato.condicao !== CondicaoMandato.TITULAR) {
            throw new TitularInvalidoError();
        }
        const suplentes = await this.repository.listSuplentesElegiveis(
            tenantId,
            mandato.legislatureId,
        );
        const partido = mandato.partyAcronym?.trim().toUpperCase() || null;
        return suplentes
            .map((s) => ({
                ...s,
                mesmoPartido:
                    !!partido && s.partyAcronym?.trim().toUpperCase() === partido,
            }))
            .sort((a, b) => Number(b.mesmoPartido) - Number(a.mesmoPartido));
    }
}
