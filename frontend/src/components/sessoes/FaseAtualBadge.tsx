import { Tag } from 'primereact/tag';
import type { FaseSessao } from '../../types/sessoes';

type Severity = 'info' | 'success' | 'warning' | 'danger' | 'secondary';

const CFG: Record<FaseSessao, { label: string; severity: Severity }> = {
    NAO_INICIADA:         { label: 'Não iniciada',        severity: 'secondary' },
    EXPEDIENTE:           { label: 'Expediente',           severity: 'info'     },
    ORDEM_DO_DIA:         { label: 'Ordem do Dia',         severity: 'warning'  },
    EXPLICACOES_PESSOAIS: { label: 'Explicações Pessoais', severity: 'secondary'},
    ENCERRADA:            { label: 'Encerrada',            severity: 'secondary'},
};

export function FaseAtualBadge({ fase }: { fase: FaseSessao }) {
    const cfg = CFG[fase] ?? { label: fase, severity: 'secondary' as Severity };
    return <Tag value={cfg.label} severity={cfg.severity} />;
}
