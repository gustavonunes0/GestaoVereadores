import { useCallback, useEffect, useState } from 'react';
import { mesaDiretoraApi, type Board } from '../../api/legislative/mesa-diretora.api';
import { VerDialog } from '../common/VerDialog';
import { MesaComposicaoTable } from './MesaComposicaoTable';
import { useAppToast } from '../../hooks/useAppToast';

interface Props {
    boardId: string;
    onClose: () => void;
}

export function MesaVerDialog({ boardId, onClose }: Props) {
    const { showApiError } = useAppToast();
    const [mesa, setMesa] = useState<Board | null>(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(() => {
        setLoading(true);
        return mesaDiretoraApi
            .getById(boardId)
            .then(setMesa)
            .catch(showApiError)
            .finally(() => setLoading(false));
    }, [boardId, showApiError]);

    useEffect(() => {
        void load();
    }, [load]);

    return (
        <VerDialog
            visible
            title={mesa?.name ?? 'Mesa diretora'}
            onClose={onClose}
            width="min(90vw, 820px)"
        >
            {loading && <p className="text-color-secondary">Carregando…</p>}
            {mesa && !loading && (
                <MesaComposicaoTable
                    boardId={mesa.id}
                    entityLabel="mesa diretora"
                    membros={mesa.members}
                    onChanged={() => void load()}
                />
            )}
        </VerDialog>
    );
}
