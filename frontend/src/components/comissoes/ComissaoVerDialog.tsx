import { useEffect, useState } from 'react';
import { Tag } from 'primereact/tag';
import { comissoesApi, type Committee } from '../../api/legislative/comissoes.api';
import { VerDialog } from '../common/VerDialog';
import { useAppToast } from '../../hooks/useAppToast';
import { formatDatePt } from '../../utils/formatDate';
import { STATUS_OPTIONS, TYPE_OPTIONS } from './ComissaoFormDialog';

type Severity = 'success' | 'secondary' | 'danger';

const STATUS_SEVERITY: Record<Committee['status'], Severity> = {
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
    comissaoId: string;
    onClose: () => void;
}

export function ComissaoVerDialog({ comissaoId, onClose }: Props) {
    const { showApiError } = useAppToast();
    const [comissao, setComissao] = useState<Committee | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        comissoesApi
            .getById(comissaoId)
            .then(setComissao)
            .catch(showApiError)
            .finally(() => setLoading(false));
    }, [comissaoId, showApiError]);

    const tipoLabel =
        TYPE_OPTIONS.find((t) => t.value === comissao?.type)?.label ?? comissao?.type;
    const statusLabel =
        STATUS_OPTIONS.find((s) => s.value === comissao?.status)?.label ?? comissao?.status;

    return (
        <VerDialog
            visible
            title="Detalhes da comissão"
            onClose={onClose}
            width="min(90vw, 760px)"
        >
            {loading && <p className="text-color-secondary">Carregando…</p>}
            {comissao && !loading && (
                <div>
                    <div className="flex align-items-center gap-2 mb-3 flex-wrap">
                        <span className="font-bold text-lg">{comissao.name}</span>
                        {comissao.acronym && (
                            <span className="text-color-secondary">({comissao.acronym})</span>
                        )}
                        <Tag value={statusLabel} severity={STATUS_SEVERITY[comissao.status]} />
                    </div>
                    <div className="mb-3">
                        <DetailRow label="Tipo" value={tipoLabel} />
                        <DetailRow label="Início" value={formatDatePt(comissao.startDate)} />
                        <DetailRow label="Fim" value={formatDatePt(comissao.endDate)} />
                    </div>
                    <p className="mb-3 line-height-3">{comissao.purpose}</p>
                    {comissao.notes && (
                        <p className="text-color-secondary text-sm mb-3">{comissao.notes}</p>
                    )}
                    {comissao.members && comissao.members.length > 0 && (
                        <div className="border-top-1 surface-border pt-3">
                            <h4 className="mt-0 mb-2 text-base font-semibold">Membros</h4>
                            <ul className="m-0 pl-3">
                                {comissao.members.map((m) => (
                                    <li key={m.id} className="mb-1">
                                        {m.parliamentarian.parliamentaryName}
                                        <span className="text-color-secondary">
                                            {' '}
                                            — {m.roleLabel}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </VerDialog>
    );
}
