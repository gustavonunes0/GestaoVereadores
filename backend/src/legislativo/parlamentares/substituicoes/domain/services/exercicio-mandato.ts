import { UnprocessableEntityException } from '@nestjs/common';
import { CondicaoMandato } from '../../../mandatos/domain/enums/condicao-mandato.enum';
import { assertParliamentarianHasActiveMandate } from '../../../mandatos/domain/services/mandate-workflow';
import { ParliamentarianStatus } from '../../../domain/enums/parliamentarian-status.enum';
import { StatusSubstituicao } from '../enums/substituicao.enums';

/** Data civil no formato YYYY-MM-DD. */
export type DataCivil = string;

export type PeriodoSubstituicao = {
    id: string;
    titularId: string;
    suplenteId: string;
    dataInicio: DataCivil;
    dataFim: DataCivil | null;
    status: StatusSubstituicao;
};

export type VagaEmExercicio = {
    titularId: string;
    emExercicioId: string;
    substituicaoId: string | null;
};

export const MSG_TITULAR_SUBSTITUIDO =
    'Parlamentar substituído por suplente no período — presença/voto não permitido.';
export const MSG_SUPLENTE_SEM_EXERCICIO =
    'Suplente sem substituição ativa no período — presença/voto não permitido.';
export const MSG_PARLAMENTAR_INATIVO = 'Parlamentar inativo — presença/voto não permitido.';

export function parlamentarInativo(status: string | null | undefined): boolean {
    return status === ParliamentarianStatus.INACTIVE;
}

export function assertParlamentarAtivo(status: string | null | undefined): void {
    if (parlamentarInativo(status)) {
        throw new UnprocessableEntityException(MSG_PARLAMENTAR_INATIVO);
    }
}

const FUSO_CAMARA = 'America/Fortaleza';
const SEM_FIM: DataCivil = '9999-12-31';

const formatoDataCivil = new Intl.DateTimeFormat('en-CA', {
    timeZone: FUSO_CAMARA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});

/** Dia civil (fuso da câmara) de um instante — ex.: início da sessão. */
export function dataCivilDoInstante(instante: Date): DataCivil {
    return formatoDataCivil.format(instante);
}

/** Colunas `@db.Date` chegam como meia-noite UTC. */
export function dataCivilDeColuna(valor: Date): DataCivil {
    return valor.toISOString().slice(0, 10);
}

export function colunaDeDataCivil(data: DataCivil): Date {
    return new Date(`${data}T00:00:00.000Z`);
}

export function somarDias(data: DataCivil, dias: number): DataCivil {
    const d = colunaDeDataCivil(data);
    d.setUTCDate(d.getUTCDate() + dias);
    return dataCivilDeColuna(d);
}

export function vigenteNaData(s: PeriodoSubstituicao, data: DataCivil): boolean {
    if (s.status === StatusSubstituicao.CANCELADA) return false;
    return s.dataInicio <= data && data <= (s.dataFim ?? SEM_FIM);
}

export function periodosSobrepoem(
    a: Pick<PeriodoSubstituicao, 'dataInicio' | 'dataFim'>,
    b: Pick<PeriodoSubstituicao, 'dataInicio' | 'dataFim'>,
): boolean {
    return a.dataInicio <= (b.dataFim ?? SEM_FIM) && b.dataInicio <= (a.dataFim ?? SEM_FIM);
}

/** Uma vaga por titular: ocupada pelo suplente vigente na data ou pelo próprio titular. */
export function resolverVagas(
    titularIds: string[],
    substituicoes: PeriodoSubstituicao[],
    data: DataCivil,
): VagaEmExercicio[] {
    return titularIds.map((titularId) => {
        const vigente = substituicoes.find(
            (s) => s.titularId === titularId && vigenteNaData(s, data),
        );
        return {
            titularId,
            emExercicioId: vigente?.suplenteId ?? titularId,
            substituicaoId: vigente?.id ?? null,
        };
    });
}

export function podeExercerMandato(parliamentarianId: string, vagas: VagaEmExercicio[]): boolean {
    return vagas.some((v) => v.emExercicioId === parliamentarianId);
}

export function assertPodeExercerMandato(
    parliamentarianId: string,
    vagas: VagaEmExercicio[],
    condicaoNaLegislatura: CondicaoMandato | null,
): void {
    if (podeExercerMandato(parliamentarianId, vagas)) return;
    if (vagas.some((v) => v.titularId === parliamentarianId)) {
        throw new UnprocessableEntityException(MSG_TITULAR_SUBSTITUIDO);
    }
    if (condicaoNaLegislatura === CondicaoMandato.SUPLENTE) {
        throw new UnprocessableEntityException(MSG_SUPLENTE_SEM_EXERCICIO);
    }
    assertParliamentarianHasActiveMandate(false);
}

export function periodoValido(dataInicio: DataCivil, dataFim: DataCivil | null): boolean {
    return !dataFim || dataFim >= dataInicio;
}

export type SituacaoSubstituicao = 'AGENDADA' | 'EM_EXERCICIO' | 'FINALIZADA' | 'CANCELADA';

export function situacaoNaData(s: PeriodoSubstituicao, data: DataCivil): SituacaoSubstituicao {
    if (s.status === StatusSubstituicao.CANCELADA) return 'CANCELADA';
    if (data < s.dataInicio) return 'AGENDADA';
    return vigenteNaData(s, data) ? 'EM_EXERCICIO' : 'FINALIZADA';
}

/**
 * Encerrar devolve o exercício ao titular no mesmo dia: o suplente fica até ontem.
 * Substituição que ainda não começou antes de hoje é cancelada.
 */
export function planejarEncerramento(
    s: Pick<PeriodoSubstituicao, 'dataInicio' | 'dataFim'>,
    hoje: DataCivil,
): { status: StatusSubstituicao; dataFim: DataCivil | null } {
    if (s.dataInicio >= hoje) {
        return { status: StatusSubstituicao.CANCELADA, dataFim: s.dataFim };
    }
    const ontem = somarDias(hoje, -1);
    return {
        status: StatusSubstituicao.ENCERRADA,
        dataFim: s.dataFim && s.dataFim < ontem ? s.dataFim : ontem,
    };
}
