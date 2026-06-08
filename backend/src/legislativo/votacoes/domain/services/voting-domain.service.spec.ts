import { ResultadoPauta, ResultadoVotacao, TipoVotacao, Voto } from '@prisma/client';
import { VotingDomainService } from './voting-domain.service';

describe('VotingDomainService', () => {
    const service = new VotingDomainService();

    it('impede segunda votação no mesmo item de pauta', () => {
        expect(() => service.assertNoExistingVoteForAgendaItem(true)).toThrow(
            'votação principal',
        );
    });

    it('exige totais na votação simbólica', () => {
        expect(() =>
            service.assertSymbolicTotalsProvided(TipoVotacao.SIMBOLICA),
        ).toThrow('votosSim e votosNao');
    });

    it('identifica tipos que aceitam voto individual', () => {
        expect(service.acceptsIndividualVotes(TipoVotacao.NOMINAL)).toBe(
            true,
        );
        expect(service.acceptsIndividualVotes(TipoVotacao.SIMBOLICA)).toBe(
            false,
        );
        expect(service.hidesIndividualVotes(TipoVotacao.SECRETA)).toBe(true);
    });

    it('calcula resultado e mapeia empatado para ADIADO na pauta', () => {
        const outcome = service.buildResultOutcome(5, 5, 2);
        expect(outcome.resultado).toBe(ResultadoVotacao.EMPATADO);
        expect(outcome.resultadoPauta).toBe(ResultadoPauta.ADIADO);
        expect(outcome.atualizaMateria).toBe(false);
        expect(outcome.atualizaPauta).toBe(true);
    });

    it('impede totais manuais em votação nominal', () => {
        expect(() =>
            service.assertManualTotalsNotAllowed(
                TipoVotacao.NOMINAL,
                10,
                5,
            ),
        ).toThrow('calcula totais automaticamente');
    });

    it('resolve totais automaticamente para votação nominal', () => {
        const totals = service.resolveFinalizationTotals(
            TipoVotacao.NOMINAL,
            {},
            [Voto.SIM, Voto.NAO, Voto.ABSTENCAO],
        );
        expect(totals).toEqual({
            votosSim: 1,
            votosNao: 1,
            abstencoes: 1,
            calculadoAutomaticamente: true,
        });
    });
});
