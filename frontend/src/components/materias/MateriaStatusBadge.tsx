import { Tag } from 'primereact/tag';
import { MATERIA_STATUS, type MateriaStatus } from '../../types/legislative';

type Severity = 'info' | 'warning' | 'success' | 'danger' | 'secondary';

const STATUS_SEVERITY: Record<MateriaStatus, Severity> = {
    DRAFT: 'secondary',
    PROTOCOLADA: 'info',
    EM_TRAMITACAO: 'warning',
    EM_PAUTA: 'warning',
    APROVADA: 'success',
    REJEITADA: 'danger',
    ARQUIVADA: 'secondary',
    RETIRADA: 'secondary',
    TRANSFORMADA_EM_NORMA: 'success',
};

interface Props {
    status: MateriaStatus;
}

export function MateriaStatusBadge({ status }: Props) {
    return (
        <Tag
            value={MATERIA_STATUS[status]}
            severity={STATUS_SEVERITY[status]}
        />
    );
}
