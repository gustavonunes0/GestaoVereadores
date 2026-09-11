import { useCallback, useEffect, useState } from 'react';
import { mesaDiretoraApi } from '../api/legislative/mesa-diretora.api';
import { isPresidenteMesa } from '../utils/plenarioLayout';

/**
 * Indica se o parlamentar logado é o Presidente da mesa diretora ativa
 * (voto não obrigatório — popup não deve abrir automaticamente).
 */
export function useIsPresidenteMesa(parliamentarianId: string | undefined) {
    const [isPresidente, setIsPresidente] = useState(false);

    const refresh = useCallback(async () => {
        if (!parliamentarianId) {
            setIsPresidente(false);
            return;
        }
        try {
            const res = await mesaDiretoraApi.list({ status: 'ACTIVE', limit: 5 });
            const boards = res.data ?? [];
            const ativo =
                boards.find((b) => b.status === 'ACTIVE' && b.members.length > 0) ??
                boards[0];
            const presidente = ativo?.members?.find((m) =>
                isPresidenteMesa(m.boardRole?.name),
            );
            setIsPresidente(presidente?.parliamentarian?.id === parliamentarianId);
        } catch {
            setIsPresidente(false);
        }
    }, [parliamentarianId]);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    return { isPresidente, refresh };
}
