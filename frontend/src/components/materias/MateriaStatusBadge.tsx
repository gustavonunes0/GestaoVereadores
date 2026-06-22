import { Tag } from 'primereact/tag';
import type { MateriaStatus } from '../../types/legislative';
import { MATERIA_STATUS_LABELS } from '../../types/legislative';

type Severity = 'info' | 'warning' | 'success' | 'danger' | 'secondary';

interface StatusCfg {
    label: string;
    severity: Severity;
    icon: string;
}

const CFG: Record<MateriaStatus, StatusCfg> = {
    DRAFT: { label: MATERIA_STATUS_LABELS.DRAFT, severity: 'secondary', icon: 'pi pi-file-edit' },
    PROTOCOLADA: { label: MATERIA_STATUS_LABELS.PROTOCOLADA, severity: 'info', icon: 'pi pi-file-check' },
    EM_TRAMITACAO: { label: MATERIA_STATUS_LABELS.EM_TRAMITACAO, severity: 'warning', icon: 'pi pi-search' },
    EM_PAUTA: { label: MATERIA_STATUS_LABELS.EM_PAUTA, severity: 'warning', icon: 'pi pi-list-check' },
    APROVADA: { label: MATERIA_STATUS_LABELS.APROVADA, severity: 'success', icon: 'pi pi-check-circle' },
    REJEITADA: { label: MATERIA_STATUS_LABELS.REJEITADA, severity: 'danger', icon: 'pi pi-times-circle' },
    ARQUIVADA: { label: MATERIA_STATUS_LABELS.ARQUIVADA, severity: 'secondary', icon: 'pi pi-inbox' },
    RETIRADA: { label: MATERIA_STATUS_LABELS.RETIRADA, severity: 'secondary', icon: 'pi pi-arrow-left' },
    TRANSFORMADA_EM_NORMA: {
        label: MATERIA_STATUS_LABELS.TRANSFORMADA_EM_NORMA,
        severity: 'success',
        icon: 'pi pi-verified',
    },
};

const FALLBACK: StatusCfg = { label: 'Desconhecido', severity: 'secondary', icon: 'pi pi-question' };

interface Props {
    status: string;
}

export function MateriaStatusBadge({ status }: Props) {
    const c = CFG[status as MateriaStatus] ?? FALLBACK;
    return <Tag value={c.label} severity={c.severity} icon={c.icon} />;
}
