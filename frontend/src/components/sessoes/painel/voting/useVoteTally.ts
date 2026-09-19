import { useMemo } from 'react';
import type { Councilor, PanelStats, VoteTotals } from './types';

/**
 * Totais preferem o placar do WS quando informado;
 * stats de presença vêm do elenco (círculos).
 */
export function useVoteTally(
    councilors: Councilor[],
    votesOverride?: VoteTotals | null,
): { votes: VoteTotals; stats: PanelStats } {
    return useMemo(() => {
        const all = councilors;
        const presentes = all.filter((c) => c.status !== 'ausente').length;
        const ausentes = all.length - presentes;

        const derived: VoteTotals = {
            sim: all.filter((c) => c.status === 'sim').length,
            nao: all.filter((c) => c.status === 'nao').length,
            abs: all.filter((c) => c.status === 'abstencao').length,
        };

        return {
            votes: votesOverride ?? derived,
            stats: {
                parlamentares: all.length,
                presentes,
                ausentes,
            },
        };
    }, [councilors, votesOverride]);
}
