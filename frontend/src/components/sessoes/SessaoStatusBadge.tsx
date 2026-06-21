import { Tag } from 'primereact/tag';
import { SESSAO_STATUS, type SessaoStatus } from '../../types/legislative';
import type { StatusSessao } from '../../types/sessoes';

type Severity = 'info' | 'success' | 'warning' | 'danger' | 'secondary';

const CFG: Record<string, { severity: Severity; icon: string; label: string }> = {
    AGENDADA:  { severity: 'info',      icon: 'pi pi-calendar',      label: 'Agendada'  },
    ABERTA:    { severity: 'success',   icon: 'pi pi-circle-fill',   label: 'Aberta'    },
    SUSPENSA:  { severity: 'warning',   icon: 'pi pi-pause',         label: 'Suspensa'  },
    ENCERRADA: { severity: 'secondary', icon: 'pi pi-check-circle',  label: 'Encerrada' },
    CANCELADA: { severity: 'danger',    icon: 'pi pi-times-circle',  label: 'Cancelada' },
};

export function SessaoStatusBadge({ status }: { status: SessaoStatus | StatusSessao }) {
    const cfg = CFG[status];
    if (!cfg) return <Tag value={SESSAO_STATUS[status as SessaoStatus] ?? status} />;
    return <Tag value={cfg.label} severity={cfg.severity} icon={cfg.icon} />;
}
