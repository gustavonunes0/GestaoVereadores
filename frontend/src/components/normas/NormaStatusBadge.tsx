import { Tag } from 'primereact/tag';
import { NORMA_STATUS, type NormaStatus } from '../../types/legislative';

type Severity = 'info' | 'success' | 'warning' | 'danger' | 'secondary';

const STATUS_SEVERITY: Record<NormaStatus, Severity> = {
    EM_TRAMITE: 'secondary',
    SANCIONADA: 'info',
    VETADA: 'danger',
    PROMULGADA: 'warning',
    PUBLICADA: 'info',
    VIGENTE: 'success',
    REVOGADA: 'secondary',
};

export function NormaStatusBadge({ status }: { status: NormaStatus }) {
    return (
        <Tag
            value={NORMA_STATUS[status]}
            severity={STATUS_SEVERITY[status]}
        />
    );
}
