import { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';
import { parlamentaresApi } from '../../api/legislative/parlamentares.api';
import { useAppToast } from '../../hooks/useAppToast';

type Mandato = {
    id: string;
    status?: string;
    startedAt?: string;
    endedAt?: string;
    legislature?: { number: number; isCurrent?: boolean };
};

interface Props {
    parliamentarianId: string;
    parliamentaryName: string;
    onClose: () => void;
}

export function ParlamentarMandatosDialog({
    parliamentarianId,
    parliamentaryName,
    onClose,
}: Props) {
    const { showApiError } = useAppToast();
    const [loading, setLoading] = useState(true);
    const [mandatos, setMandatos] = useState<Mandato[]>([]);

    useEffect(() => {
        parlamentaresApi
            .getMandatos(parliamentarianId)
            .then((res) => setMandatos(res as unknown as Mandato[]))
            .catch(showApiError)
            .finally(() => setLoading(false));
    }, [parliamentarianId, showApiError]);

    return (
        <Dialog
            header={`Mandatos — ${parliamentaryName}`}
            visible
            onHide={onClose}
            style={{ width: 'min(90vw, 520px)' }}
            modal
        >
            {loading ? (
                <div className="flex justify-content-center p-4">
                    <ProgressSpinner />
                </div>
            ) : mandatos.length === 0 ? (
                <p className="text-color-secondary m-0">Nenhum mandato cadastrado.</p>
            ) : (
                <ul className="list-none p-0 m-0 flex flex-column gap-3">
                    {mandatos.map((m) => (
                        <li key={m.id} className="border-1 border-round p-3 surface-border">
                            <div className="flex align-items-center gap-2 mb-1">
                                <strong>
                                    Legislatura {m.legislature?.number ?? '—'}
                                </strong>
                                {m.legislature?.isCurrent && (
                                    <Tag value="Atual" severity="success" />
                                )}
                                {m.status && <Tag value={m.status} severity="info" />}
                            </div>
                            {m.startedAt && (
                                <span className="text-sm text-color-secondary">
                                    Início: {new Date(m.startedAt).toLocaleDateString('pt-BR')}
                                    {m.endedAt
                                        ? ` · Fim: ${new Date(m.endedAt).toLocaleDateString('pt-BR')}`
                                        : ''}
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </Dialog>
    );
}
