import { Tag } from 'primereact/tag';
import type { StatusMateria } from '../../types/materias';

type Severity = 'info' | 'warning' | 'success' | 'danger' | 'secondary';

interface StatusCfg {
    label: string;
    severity: Severity;
    icon: string;
}

const CFG: Record<StatusMateria, StatusCfg> = {
    RASCUNHO:                  { label: 'Rascunho',                 severity: 'secondary', icon: 'pi pi-file-edit'    },
    PROTOCOLADA:               { label: 'Protocolada',              severity: 'info',      icon: 'pi pi-file-check'   },
    LIDA_NO_PLENARIO:          { label: 'Lida no plenário',         severity: 'info',      icon: 'pi pi-book'         },
    EM_ANALISE_NAS_COMISSOES:  { label: 'Em análise nas comissões', severity: 'warning',   icon: 'pi pi-search'       },
    PRONTA_PARA_ORDEM_DO_DIA:  { label: 'Pronta para ordem do dia', severity: 'warning',   icon: 'pi pi-list-check'   },
    EM_VOTACAO:                { label: 'Em votação',               severity: 'warning',   icon: 'pi pi-circle'       },
    APROVADA_PELO_LEGISLATIVO: { label: 'Aprovada',                 severity: 'success',   icon: 'pi pi-check-circle' },
    VETADA:                    { label: 'Vetada',                   severity: 'danger',    icon: 'pi pi-times-circle' },
    SANCIONADA:                { label: 'Sancionada',               severity: 'success',   icon: 'pi pi-verified'     },
};

const FALLBACK: StatusCfg = { label: 'Desconhecido', severity: 'secondary', icon: 'pi pi-question' };

interface Props {
    status: string;
}

export function MateriaStatusBadge({ status }: Props) {
    const c = CFG[status as StatusMateria] ?? FALLBACK;
    return <Tag value={c.label} severity={c.severity} icon={c.icon} />;
}
