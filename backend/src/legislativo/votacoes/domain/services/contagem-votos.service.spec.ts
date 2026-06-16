import { ContagemVotosService } from './contagem-votos.service';

describe('ContagemVotosService', () => {
    const service = new ContagemVotosService();

    it('conta corretamente SIM, NAO e ABSTENCAO', () => {
        const groupBy = [
            { voto: 'SIM', _count: { voto: 5 } },
            { voto: 'NAO', _count: { voto: 2 } },
            { voto: 'ABSTENCAO', _count: { voto: 1 } },
        ];
        const result = service.calcularDeGroupBy(groupBy);
        expect(result).toEqual({ votosSim: 5, votosNao: 2, abstencoes: 1 });
    });

    it('retorna zeros quando não há votos', () => {
        const result = service.calcularDeGroupBy([]);
        expect(result).toEqual({ votosSim: 0, votosNao: 0, abstencoes: 0 });
    });

    it('ignora voto PRESENTE nos contadores', () => {
        const groupBy = [
            { voto: 'SIM', _count: { voto: 3 } },
            { voto: 'PRESENTE', _count: { voto: 10 } },
        ];
        const result = service.calcularDeGroupBy(groupBy);
        expect(result).toEqual({ votosSim: 3, votosNao: 0, abstencoes: 0 });
    });
});
