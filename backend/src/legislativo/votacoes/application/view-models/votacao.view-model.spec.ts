import { VotacaoViewModel } from './votacao.view-model';
import { buildVotacaoPlacarPayload } from '../../../sessoes-plenarias/realtime/votacao-realtime.mapper';

describe('VotacaoViewModel parliamentarianIdsQueVotaram', () => {
    it('expõe IDs mesmo em votação SECRETA sem revelar votos[]', () => {
        const http = VotacaoViewModel.toHttp({
            id: 'vot-1',
            pautaItemId: 'pauta-1',
            tipoVotacao: 'SECRETA',
            exigePresenca: true,
            votosSim: 2,
            votosNao: 1,
            abstencoes: 0,
            resultado: null,
            realizadaAt: null,
            createdAt: new Date('2026-01-01T00:00:00Z'),
            votos: [
                {
                    id: 'v1',
                    parliamentarianId: 'parl-a',
                    voto: 'SIM',
                },
                {
                    id: 'v2',
                    parliamentarianId: 'parl-b',
                    voto: 'SIM',
                },
                {
                    id: 'v3',
                    parliamentarianId: 'parl-c',
                    voto: 'NAO',
                },
            ],
        });

        expect(http.ocultaVotosIndividuais).toBe(true);
        expect(http.votos).toBeUndefined();
        expect(http.parliamentarianIdsQueVotaram).toEqual([
            'parl-a',
            'parl-b',
            'parl-c',
        ]);
        expect(http.totalRegistrados).toBe(3);
    });

    it('em NOMINAL mantém votos e IDs sincronizados com totais', () => {
        const http = VotacaoViewModel.toHttp({
            id: 'vot-2',
            pautaItemId: 'pauta-2',
            tipoVotacao: 'NOMINAL',
            exigePresenca: true,
            votosSim: 1,
            votosNao: 0,
            abstencoes: 1,
            resultado: null,
            realizadaAt: null,
            createdAt: new Date('2026-01-01T00:00:00Z'),
            votos: [
                {
                    id: 'v1',
                    parliamentarianId: 'parl-a',
                    voto: 'SIM',
                },
                {
                    id: 'v2',
                    parliamentarianId: 'parl-b',
                    voto: 'ABSTENCAO',
                },
            ],
        });

        expect(http.votos).toHaveLength(2);
        expect(http.parliamentarianIdsQueVotaram).toEqual(['parl-a', 'parl-b']);
        expect(http.totalRegistrados).toBe(2);

        const placar = buildVotacaoPlacarPayload(http);
        expect(placar).toEqual({
            votacaoId: 'vot-2',
            votosSim: 1,
            votosNao: 0,
            abstencoes: 1,
            totalRegistrados: 2,
            parliamentarianIdsQueVotaram: ['parl-a', 'parl-b'],
        });
    });
});
