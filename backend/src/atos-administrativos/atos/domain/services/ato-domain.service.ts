import { ATO_NATUREZA } from '../types/ato-juridico.types';

export type AtoDateRangeInput = {
    dataInicio?: Date | null;
    dataFim?: Date | null;
    dataPublicacaoInicio?: Date | null;
    dataPublicacaoFim?: Date | null;
};

/**
 * Regras de negócio de Ato Administrativo (task 29).
 *
 * Registro global (sem tenantId), manifestação formal da Administração
 * com efeitos jurídicos ou administrativos imediatos.
 */
export class AtoDomainService {
    readonly natureza = ATO_NATUREZA;

    assertTipoExists(exists: boolean) {
        if (!exists) {
            throw new Error('Tipo de ato não encontrado');
        }
    }

    assertClassificacaoExists(exists: boolean) {
        if (!exists) {
            throw new Error('Classificação de ato não encontrada');
        }
    }

    assertNumeroAvailable(exists: boolean) {
        if (exists) {
            throw new Error('Já existe ato com este número');
        }
    }

    assertAtoFound(ato: unknown) {
        if (!ato) {
            throw new Error('Ato não encontrado');
        }
    }

    assertVigenciaDates(dataInicio?: Date | null, dataFim?: Date | null) {
        if (
            dataInicio &&
            dataFim &&
            dataFim.getTime() < dataInicio.getTime()
        ) {
            throw new Error('Data final não pode ser anterior à data inicial');
        }
    }

    assertPublicacaoDates(
        dataPublicacaoInicio?: Date | null,
        dataPublicacaoFim?: Date | null,
    ) {
        if (
            dataPublicacaoInicio &&
            dataPublicacaoFim &&
            dataPublicacaoFim.getTime() < dataPublicacaoInicio.getTime()
        ) {
            throw new Error(
                'Data final de publicação não pode ser anterior à data inicial de publicação',
            );
        }
    }

    assertDateRanges(dates: AtoDateRangeInput) {
        this.assertVigenciaDates(dates.dataInicio, dates.dataFim);
        this.assertPublicacaoDates(
            dates.dataPublicacaoInicio,
            dates.dataPublicacaoFim,
        );
    }
}
