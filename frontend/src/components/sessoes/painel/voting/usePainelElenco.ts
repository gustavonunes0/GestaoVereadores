import { useCallback, useEffect, useMemo, useState } from 'react';
import { sessoesApi } from '../../../../api/legislative/sessoes.api';
import type { PresencaUpdate } from '../../../../hooks/useSessaoRealtime';
import type { PresencaSessao } from '../../../../types/presenca';
import { mapPresencaToCouncilors } from './mapPresencaToCouncilors';
import type { Councilor, VoteTotals } from './types';

/** Elenco do telão via endpoint público (sem JWT). */
export function usePainelElenco(params: {
    sessaoId: string;
    presencaUpdate: PresencaUpdate | null;
    idsQueVotaram?: Set<string> | null;
    revealNominalVotes?: boolean;
}) {
    const { sessaoId, presencaUpdate, idsQueVotaram, revealNominalVotes } = params;

    const [presenca, setPresenca] = useState<PresencaSessao | null>(null);
    const [loading, setLoading] = useState(true);

    const carregar = useCallback(async () => {
        if (!sessaoId) return;
        setLoading(true);
        try {
            const data = await sessoesApi.getPainelPublico(sessaoId);
            setPresenca(data.presenca);
        } catch {
            setPresenca(null);
        } finally {
            setLoading(false);
        }
    }, [sessaoId]);

    useEffect(() => {
        void carregar();
    }, [carregar]);

    useEffect(() => {
        if (!presencaUpdate) return;
        if (presencaUpdate.sessaoId && presencaUpdate.sessaoId !== sessaoId) return;
        void carregar();
    }, [presencaUpdate, sessaoId, carregar]);

    const mapped = useMemo(() => {
        if (!presenca) {
            return {
                president: null as Councilor | null,
                left: [] as Councilor[],
                right: [] as Councilor[],
                all: [] as Councilor[],
            };
        }
        return mapPresencaToCouncilors({
            presenca,
            idsQueVotaram,
            revealNominalVotes,
        });
    }, [presenca, idsQueVotaram, revealNominalVotes]);

    return {
        loading,
        president: mapped.president,
        left: mapped.left,
        right: mapped.right,
        all: mapped.all,
        reload: carregar,
    };
}

export function resolvePanelVotes(params: {
    votosSim: number;
    votosNao: number;
    abstencoes: number;
}): VoteTotals {
    return {
        sim: params.votosSim,
        nao: params.votosNao,
        abs: params.abstencoes,
    };
}
