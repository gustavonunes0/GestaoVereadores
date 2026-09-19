export type CouncilorStatus =
    | 'ausente'
    | 'presente'
    | 'votou'
    | 'sim'
    | 'nao'
    | 'abstencao';

export type CouncilorRole = 'PRESIDENTE' | 'VICE' | '1SEC' | '2SEC';

export interface Councilor {
    id: string;
    name: string;
    party: string;
    role?: CouncilorRole;
    /** Cargo original da mesa (quando disponível). */
    cargoLabel?: string;
    status: CouncilorStatus;
    side: 'left' | 'right';
    photoUrl?: string | null;
}

export interface VoteTotals {
    sim: number;
    nao: number;
    abs: number;
}

export interface PanelStats {
    parlamentares: number;
    ausentes: number;
    presentes: number;
}

export type VotingPanelMode = 'live' | 'result';

export const STATUS_ARIA: Record<CouncilorStatus, string> = {
    ausente: 'Ausente',
    presente: 'Presente',
    votou: 'Já votou',
    sim: 'Votou sim',
    nao: 'Votou não',
    abstencao: 'Absteve-se',
};

export const ROLE_LABEL: Record<CouncilorRole, string> = {
    PRESIDENTE: 'PRESIDENTE',
    VICE: 'VICE',
    '1SEC': '1º SEC',
    '2SEC': '2º SEC',
};

/** Rótulos por extenso — tela de apresentação da mesa. */
export const ROLE_LABEL_APRESENTACAO: Record<CouncilorRole, string> = {
    PRESIDENTE: 'PRESIDENTE',
    VICE: 'VICE-PRESIDENTE',
    '1SEC': 'PRIMEIRO(A) SECRETÁRIO(A)',
    '2SEC': 'SEGUNDO(A) SECRETÁRIO(A)',
};
