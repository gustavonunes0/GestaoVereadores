import { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';
import { parlamentaresApi } from '../../api/legislative/parlamentares.api';
import { useAppToast } from '../../hooks/useAppToast';

interface Props {
    parliamentarianId: string;
    parliamentaryName: string;
    onClose: () => void;
}

export function ParlamentarComissoesDialog({
    parliamentarianId,
    parliamentaryName,
    onClose,
}: Props) {
    const { showApiError } = useAppToast();
    const [loading, setLoading] = useState(true);
    const [comissoes, setComissoes] = useState<
        Array<{ id: string; name: string; acronym?: string }>
    >([]);

    useEffect(() => {
        parlamentaresApi
            .getById(parliamentarianId)
            .then((p) => setComissoes(p.committees ?? []))
            .catch(showApiError)
            .finally(() => setLoading(false));
    }, [parliamentarianId, showApiError]);

    return (
        <Dialog
            header={`Comissões — ${parliamentaryName}`}
            visible
            onHide={onClose}
            style={{ width: 'min(90vw, 520px)' }}
            modal
        >
            {loading ? (
                <div className="flex justify-content-center p-4">
                    <ProgressSpinner />
                </div>
            ) : comissoes.length === 0 ? (
                <p className="text-color-secondary m-0">Nenhuma comissão vinculada.</p>
            ) : (
                <ul className="list-none p-0 m-0 flex flex-column gap-2">
                    {comissoes.map((c) => (
                        <li key={c.id} className="flex align-items-center gap-2">
                            {c.acronym && <Tag value={c.acronym} severity="secondary" />}
                            <span>{c.name}</span>
                        </li>
                    ))}
                </ul>
            )}
        </Dialog>
    );
}
