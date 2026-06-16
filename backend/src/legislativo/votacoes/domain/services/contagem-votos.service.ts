export type ContagemVotos = {
    votosSim: number;
    votosNao: number;
    abstencoes: number;
};

export type GroupByVotoResult = {
    voto: string;
    _count: { voto: number };
};

export class ContagemVotosService {
    calcularDeGroupBy(groupByResult: GroupByVotoResult[]): ContagemVotos {
        let votosSim = 0;
        let votosNao = 0;
        let abstencoes = 0;

        for (const entry of groupByResult) {
            const count = entry._count.voto;
            if (entry.voto === 'SIM') votosSim = count;
            else if (entry.voto === 'NAO') votosNao = count;
            else if (entry.voto === 'ABSTENCAO') abstencoes = count;
            // PRESENTE (votação simbólica) não conta nos totais específicos
        }

        return { votosSim, votosNao, abstencoes };
    }
}
