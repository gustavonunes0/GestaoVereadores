export enum TipoQuorum {
    MAIORIA_SIMPLES = 'MAIORIA_SIMPLES',
    MAIORIA_ABSOLUTA = 'MAIORIA_ABSOLUTA',
    QUALIFICADO_DOIS_TERCOS = 'QUALIFICADO_DOIS_TERCOS',
    QUALIFICADO_TRES_QUINTOS = 'QUALIFICADO_TRES_QUINTOS',
}

export const TIPO_QUORUM_LABELS: Record<TipoQuorum, string> = {
    [TipoQuorum.MAIORIA_SIMPLES]: 'Maioria Simples',
    [TipoQuorum.MAIORIA_ABSOLUTA]: 'Maioria Absoluta',
    [TipoQuorum.QUALIFICADO_DOIS_TERCOS]: 'Maioria Qualificada (2/3)',
    [TipoQuorum.QUALIFICADO_TRES_QUINTOS]: 'Maioria Qualificada (3/5)',
};

export function calcularQuorumNecessario(tipoQuorum: TipoQuorum, totalMembros: number): number {
    switch (tipoQuorum) {
        case TipoQuorum.MAIORIA_SIMPLES:
            return Math.floor(totalMembros / 2) + 1;
        case TipoQuorum.MAIORIA_ABSOLUTA:
            return Math.floor(totalMembros / 2) + 1;
        case TipoQuorum.QUALIFICADO_DOIS_TERCOS:
            return Math.ceil((totalMembros * 2) / 3);
        case TipoQuorum.QUALIFICADO_TRES_QUINTOS:
            return Math.ceil((totalMembros * 3) / 5);
    }
}
