import { BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { CondicaoMandato } from '../../../mandatos/domain/enums/condicao-mandato.enum';
import { StatusSubstituicao } from '../enums/substituicao.enums';
import {
    assertPodeExercerMandato,
    dataCivilDoInstante,
    MSG_SUPLENTE_SEM_EXERCICIO,
    MSG_TITULAR_SUBSTITUIDO,
    PeriodoSubstituicao,
    periodosSobrepoem,
    planejarEncerramento,
    resolverVagas,
    situacaoNaData,
} from './exercicio-mandato';

const substituicao = (over: Partial<PeriodoSubstituicao> = {}): PeriodoSubstituicao => ({
    id: 'sub-1',
    titularId: 'titular-1',
    suplenteId: 'suplente-1',
    dataInicio: '2026-10-01',
    dataFim: '2026-10-31',
    status: StatusSubstituicao.ATIVA,
    ...over,
});

describe('exercicio-mandato', () => {
    describe('resolverVagas', () => {
        it('suplente ocupa a vaga do titular durante o período', () => {
            const vagas = resolverVagas(['titular-1', 'titular-2'], [substituicao()], '2026-10-15');
            expect(vagas).toEqual([
                { titularId: 'titular-1', emExercicioId: 'suplente-1', substituicaoId: 'sub-1' },
                { titularId: 'titular-2', emExercicioId: 'titular-2', substituicaoId: null },
            ]);
        });

        it('conta cada vaga uma única vez', () => {
            const vagas = resolverVagas(['titular-1', 'titular-2'], [substituicao()], '2026-10-15');
            expect(vagas).toHaveLength(2);
        });

        it('fora do período o titular volta automaticamente', () => {
            const antes = resolverVagas(['titular-1'], [substituicao()], '2026-09-30');
            const depois = resolverVagas(['titular-1'], [substituicao()], '2026-11-01');
            expect(antes[0].emExercicioId).toBe('titular-1');
            expect(depois[0].emExercicioId).toBe('titular-1');
        });

        it('datas de início e fim são inclusivas', () => {
            expect(resolverVagas(['titular-1'], [substituicao()], '2026-10-01')[0].emExercicioId).toBe(
                'suplente-1',
            );
            expect(resolverVagas(['titular-1'], [substituicao()], '2026-10-31')[0].emExercicioId).toBe(
                'suplente-1',
            );
        });

        it('sem data fim, a substituição segue vigente', () => {
            const vagas = resolverVagas(['titular-1'], [substituicao({ dataFim: null })], '2030-01-01');
            expect(vagas[0].emExercicioId).toBe('suplente-1');
        });

        it('substituição cancelada é ignorada', () => {
            const vagas = resolverVagas(
                ['titular-1'],
                [substituicao({ status: StatusSubstituicao.CANCELADA })],
                '2026-10-15',
            );
            expect(vagas[0].emExercicioId).toBe('titular-1');
        });

        it('substituição encerrada continua valendo para datas do período já cumprido', () => {
            const encerrada = substituicao({
                status: StatusSubstituicao.ENCERRADA,
                dataFim: '2026-10-10',
            });
            expect(resolverVagas(['titular-1'], [encerrada], '2026-10-05')[0].emExercicioId).toBe(
                'suplente-1',
            );
            expect(resolverVagas(['titular-1'], [encerrada], '2026-10-11')[0].emExercicioId).toBe(
                'titular-1',
            );
        });
    });

    describe('assertPodeExercerMandato', () => {
        const vagas = resolverVagas(['titular-1', 'titular-2'], [substituicao()], '2026-10-15');

        it('titular substituído não pode registrar presença nem votar', () => {
            expect(() =>
                assertPodeExercerMandato('titular-1', vagas, CondicaoMandato.TITULAR),
            ).toThrow(new UnprocessableEntityException(MSG_TITULAR_SUBSTITUIDO));
        });

        it('suplente vinculado pode registrar presença e votar', () => {
            expect(() =>
                assertPodeExercerMandato('suplente-1', vagas, CondicaoMandato.SUPLENTE),
            ).not.toThrow();
        });

        it('titular sem substituição exerce normalmente', () => {
            expect(() =>
                assertPodeExercerMandato('titular-2', vagas, CondicaoMandato.TITULAR),
            ).not.toThrow();
        });

        it('suplente não vinculado não pode registrar presença nem votar', () => {
            expect(() =>
                assertPodeExercerMandato('suplente-2', vagas, CondicaoMandato.SUPLENTE),
            ).toThrow(new UnprocessableEntityException(MSG_SUPLENTE_SEM_EXERCICIO));
        });

        it('parlamentar sem mandato na legislatura é recusado', () => {
            expect(() => assertPodeExercerMandato('outro', vagas, null)).toThrow(
                BadRequestException,
            );
        });

        it('titular e suplente nunca exercem ao mesmo tempo', () => {
            const podem = ['titular-1', 'suplente-1'].filter((id) => {
                try {
                    assertPodeExercerMandato(id, vagas, null);
                    return true;
                } catch {
                    return false;
                }
            });
            expect(podem).toEqual(['suplente-1']);
        });
    });

    describe('periodosSobrepoem', () => {
        it('detecta sobreposição parcial', () => {
            expect(
                periodosSobrepoem(
                    { dataInicio: '2026-10-01', dataFim: '2026-10-31' },
                    { dataInicio: '2026-10-31', dataFim: '2026-11-15' },
                ),
            ).toBe(true);
        });

        it('períodos consecutivos não se sobrepõem', () => {
            expect(
                periodosSobrepoem(
                    { dataInicio: '2026-10-01', dataFim: '2026-10-31' },
                    { dataInicio: '2026-11-01', dataFim: null },
                ),
            ).toBe(false);
        });

        it('período sem fim sobrepõe qualquer período posterior', () => {
            expect(
                periodosSobrepoem(
                    { dataInicio: '2026-10-01', dataFim: null },
                    { dataInicio: '2027-05-01', dataFim: '2027-05-02' },
                ),
            ).toBe(true);
        });
    });

    describe('planejarEncerramento', () => {
        it('encerra com último dia do suplente ontem (titular volta hoje)', () => {
            expect(planejarEncerramento(substituicao({ dataFim: null }), '2026-10-15')).toEqual({
                status: StatusSubstituicao.ENCERRADA,
                dataFim: '2026-10-14',
            });
        });

        it('mantém data fim já passada', () => {
            expect(
                planejarEncerramento(substituicao({ dataFim: '2026-10-05' }), '2026-10-15'),
            ).toEqual({ status: StatusSubstituicao.ENCERRADA, dataFim: '2026-10-05' });
        });

        it('cancela substituição que começa hoje ou no futuro', () => {
            expect(planejarEncerramento(substituicao(), '2026-10-01').status).toBe(
                StatusSubstituicao.CANCELADA,
            );
            expect(planejarEncerramento(substituicao(), '2026-09-20').status).toBe(
                StatusSubstituicao.CANCELADA,
            );
        });
    });

    it('situacaoNaData classifica agendada, em exercício e finalizada', () => {
        expect(situacaoNaData(substituicao(), '2026-09-30')).toBe('AGENDADA');
        expect(situacaoNaData(substituicao(), '2026-10-15')).toBe('EM_EXERCICIO');
        expect(situacaoNaData(substituicao(), '2026-11-01')).toBe('FINALIZADA');
    });

    it('dataCivilDoInstante usa o fuso da câmara', () => {
        expect(dataCivilDoInstante(new Date('2026-10-02T01:30:00.000Z'))).toBe('2026-10-01');
    });
});
