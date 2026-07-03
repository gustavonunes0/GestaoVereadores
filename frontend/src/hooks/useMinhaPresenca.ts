import { useCallback, useEffect, useState } from 'react';
import { sessoesApi } from '../api/legislative/sessoes.api';
import { useAppToast } from './useAppToast';
import { usePermissions } from './usePermissions';
import { hasMinhaPresenca } from '../utils/minhaPresenca';

export function useMinhaPresenca(sessaoId: string) {
    const { parliamentarianId } = usePermissions();
    const { showApiError } = useAppToast();
    const [hasConfirmed, setHasConfirmed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(false);

    const refresh = useCallback(async () => {
        if (!sessaoId) return;
        setLoading(true);
        try {
            const registros = await sessoesApi.getPresencas(sessaoId);
            setHasConfirmed(hasMinhaPresenca(registros, parliamentarianId));
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
    };
}
