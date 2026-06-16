import { Tag } from 'primereact/tag';
import { SESSAO_STATUS, type SessaoStatus } from '../../types/legislative';

type Severity = 'info' | 'success' | 'warning' | 'danger' | 'secondary';

const STATUS_SEVERITY: Record<SessaoStatus, Severity> = {
    AGENDADA: 'info',
    ABERTA: 'success',
    SUSPENSA: 'warning',
    ENCERRADA: 'secondary',
    CANCELADA: 'danger',
};

export function SessaoStatusBadge({ status }: { status: SessaoStatus }) {
    return (
        <Tag
            value={SESSAO_STATUS[status]}
            severity={STATUS_SEVERITY[status]}
        />
    );
}
