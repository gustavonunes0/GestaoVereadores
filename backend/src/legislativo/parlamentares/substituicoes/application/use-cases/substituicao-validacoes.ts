import { SubstituicaoRepository } from '../../domain/repositories/substituicao.repository';
import {
    DataCivil,
    periodoValido,
    periodosSobrepoem,
} from '../../domain/services/exercicio-mandato';
import {
    SubstituicaoPeriodoInvalidoError,
    SuplenteJaEmExercicioNoPeriodoError,
    TitularJaSubstituidoNoPeriodoError,
} from '../errors/substituicao.errors';

export async function assertPeriodoDisponivel(
    repository: SubstituicaoRepository,
    params: {
        tenantId: string;
        titularId: string;
        suplenteId: string;
        dataInicio: DataCivil;
        dataFim: DataCivil | null;
        excetoId?: string;
    },
): Promise<void> {
    if (!periodoValido(params.dataInicio, params.dataFim)) {
        throw new SubstituicaoPeriodoInvalidoError();
    }

    const existentes = await repository.listNaoCanceladasEnvolvendo(
        params.tenantId,
        params.titularId,
        params.suplenteId,
        params.excetoId,
    );
    const sobrepostas = existentes.filter((s) => periodosSobrepoem(s, params));

    if (sobrepostas.some((s) => s.titularId === params.titularId)) {
        throw new TitularJaSubstituidoNoPeriodoError();
    }
    if (sobrepostas.some((s) => s.suplenteId === params.suplenteId)) {
        throw new SuplenteJaEmExercicioNoPeriodoError();
    }
}
