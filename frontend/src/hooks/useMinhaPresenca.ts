import { useCallback, useEffect, useState } from 'react';
import { parlamentaresApi } from '../api/legislative/parlamentares.api';
import { sessoesApi } from '../api/legislative/sessoes.api';
import { substituicoesApi } from '../api/legislative/substituicoes.api';
import type { ElencoExercicioSessao } from '../types/substituicoes';
import { useAppToast } from './useAppToast';
import { usePermissions } from './usePermissions';
import { hasMinhaPresenca } from '../utils/minhaPresenca';

export const MSG_TITULAR_SUBSTITUIDO =
    'Parlamentar substituído por suplente no período — presença/voto não permitido.';
export const MSG_SUPLENTE_SEM_EXERCICIO =
    'Suplente sem substituição ativa no período — presença/voto não permitido.';
export const MSG_PARLAMENTAR_INATIVO = 'Parlamentar inativo — presença/voto não permitido.';

export interface MeuExercicio {
    emExercicio: boolean;
    /** Motivo exibido quando presença/voto não são permitidos. */
    bloqueio: string | null;
    /** Suplente em exercício: nome do titular substituído. */
    substituindo: string | null;
}

const EXERCICIO_LIVRE: MeuExercicio = { emExercicio: true, bloqueio: null, substituindo: null };

function resolverMeuExercicio(
    elenco: ElencoExercicioSessao | null,
    parliamentarianId: string | undefined,
    meuStatus: string | null,
): MeuExercicio {
    if (meuStatus === 'INACTIVE') {
        return { emExercicio: false, bloqueio: MSG_PARLAMENTAR_INATIVO, substituindo: null };
    }
    if (!elenco || elenco.vagas.length === 0 || !parliamentarianId) return EXERCICIO_LIVRE;
    const minhaVaga = elenco.vagas.find((v) => v.emExercicio.id === parliamentarianId);
    if (minhaVaga) {
        return {
            emExercicio: true,
            bloqueio: null,
            substituindo: minhaVaga.substituicaoId ? minhaVaga.titular.parliamentaryName : null,
        };
    }
    const substituido = elenco.vagas.some((v) => v.titular.id === parliamentarianId);
    return {
        emExercicio: false,
        bloqueio: substituido ? MSG_TITULAR_SUBSTITUIDO : MSG_SUPLENTE_SEM_EXERCICIO,
        substituindo: null,
    };
}

export function useMinhaPresenca(sessaoId: string) {
    const { parliamentarianId } = usePermissions();
    const { showApiError } = useAppToast();
    const [hasConfirmed, setHasConfirmed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(false);
    const [exercicio, setExercicio] = useState<MeuExercicio>(EXERCICIO_LIVRE);

    const refresh = useCallback(async () => {
        if (!sessaoId) return;
        setLoading(true);
        try {
            const [registros, elenco, meuCadastro] = await Promise.all([
                sessoesApi.getPresencas(sessaoId),
                substituicoesApi.elencoDaSessao(sessaoId).catch(() => null),
                parliamentarianId
                    ? parlamentaresApi.getById(parliamentarianId).catch(() => null)
                    : Promise.resolve(null),
            ]);
            setHasConfirmed(hasMinhaPresenca(registros, parliamentarianId));
            setExercicio(
                resolverMeuExercicio(elenco, parliamentarianId, meuCadastro?.status ?? null),
            );
        } catch (err) {
            showApiError(err);
        } finally {
            setLoading(false);
        }
    }, [sessaoId, parliamentarianId, showApiError]);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const confirmPresence = useCallback(async () => {
        if (!sessaoId) return;
        setConfirming(true);
        try {
            await sessoesApi.registrarMinhaPresenca(sessaoId);
            setHasConfirmed(true);
        } catch (err) {
            showApiError(err);
        } finally {
            setConfirming(false);
        }
    }, [sessaoId, showApiError]);

    return {
        hasConfirmed,
        loading,
        confirming,
        confirmPresence,
        refresh,
        exercicio,
    };
}
