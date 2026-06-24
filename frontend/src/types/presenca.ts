export type OrigemPresenca = 'APP' | 'STAFF' | null;

export interface PresencaParlamentar {
    /** ID do Parliamentarian (chave da cadeira no mapa). */
    parliamentarianId: string;
    /** @deprecated use parliamentarianId — mantido para eventos WS legados */
    parlamentarianUserId: string;
    presencaId?: string;
    parliamentaryName: string;
    abreviacao: string;
    partidoSigla?: string;
    gabinete?: string;
    cargoMesa?: string;
    fotoUrl?: string;
    presente: boolean;
    origem: OrigemPresenca;
    registradoEm?: string;
}

export interface PresencaSessao {
    sessaoId: string;
    totalMembros: number;
    presentes: number;
    ausentes: number;
    quorumMinimo: number;
    temQuorum: boolean;
    /** Todos os membros (quórum e toggle). */
    parlamentares: PresencaParlamentar[];
    /** Membros da mesa diretora — não repetidos no semicírculo. */
    mesaMembros: PresencaParlamentar[];
    /** Vereadores no semicírculo (exclui mesa). */
    vereadores: PresencaParlamentar[];
}

export interface PosicaoCadeira {
    x: number;
    y: number;
    rotacaoGraus: number;
}
