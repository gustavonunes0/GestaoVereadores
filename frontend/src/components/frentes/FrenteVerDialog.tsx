import { useEffect, useState } from 'react';
import { Tag } from 'primereact/tag';
import { frentesApi, type ParliamentaryFront } from '../../api/legislative/frentes.api';
import { VerDialog } from '../common/VerDialog';
import { useAppToast } from '../../hooks/useAppToast';
import { formatDatePt } from '../../utils/formatDate';
import { STATUS_OPTIONS } from './FrenteFormDialog';

type Severity = 'success' | 'secondary' | 'danger';

const STATUS_SEVERITY: Record<ParliamentaryFront['status'], Severity> = {
    ACTIVE: 'success',
    INACTIVE: 'secondary',
    FINISHED: 'danger',
};

function DetailRow({ label, value }: { label: string; value?: string | null }) {
    if (!value) return null;
    return (
        <div className="flex gap-2 mb-2">
            <span className="font-semibold w-10rem">{label}:</span>
            <span>{value}</span>
        </div>
    );
}

interface Props {
    frenteId: string;
    onClose: () => void;
}

export function FrenteVerDialog({ frenteId, onClose }: Props) {
    const { showApiError } = useAppToast();
    const [frente, setFrente] = useState<ParliamentaryFront | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        frentesApi
            .getById(frenteId)
            .then(setFrente)
            .catch(showApiError)
            .finally(() => setLoading(false));
    }, [frenteId, showApiError]);

    const statusLabel =
        STATUS_OPTIONS.find((o) => o.value === frente?.status)?.label ?? frente?.status;

    return (
        <VerDialog visible title="Detalhes da frente parlamentar" onClose={onClose}>
            {loading && <p className="text-color-secondary">Carregando…</p>}
            {frente && !loading && (
                <div>
                    <div className="flex align-items-center gap-2 mb-3">
                        <span className="font-bold text-lg">{frente.name}</span>
                        <Tag value={statusLabel} severity={STATUS_SEVERITY[frente.status]} />
                    </div>
                    <DetailRow label="Tema" value={frente.theme} />
                    {frente.description && (
                        <p className="mb-3 line-height-3">{frente.description}</p>
                    )}
                    <div className="border-top-1 surface-border pt-3">
                        <DetailRow label="Início" value={formatDatePt(frente.startDate)} />
                        <DetailRow label="Fim" value={formatDatePt(frente.endDate)} />
                    </div>
                </div>
            )}
        </VerDialog>
    );
}
