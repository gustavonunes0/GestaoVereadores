import { MATERIA_STATUS, MATERIA_STATUS_LABELS, type MateriaStatus } from '../../types/legislative';

const STATUS_STYLES = {
    DRAFT: { bg: '#fef3e2', text: '#92400e' },
    TRAMITANDO: { bg: '#e0f2fe', text: '#075985' },
    APROVADO: { bg: '#dcfce7', text: '#166534' },
    REJEITADO: { bg: '#fee2e2', text: '#991b1b' },
    ARQUIVADO: { bg: '#f3f4f6', text: '#4b5563' },
} as const;

type StyleKey = keyof typeof STATUS_STYLES;

const STATUS_STYLE_KEY: Record<MateriaStatus, StyleKey> = {
    DRAFT: 'DRAFT',
    PROTOCOLADA: 'TRAMITANDO',
    EM_TRAMITACAO: 'TRAMITANDO',
    EM_PAUTA: 'TRAMITANDO',
    EM_VOTACAO: 'TRAMITANDO',
    APROVADA: 'APROVADO',
    REJEITADA: 'REJEITADO',
    ARQUIVADA: 'ARQUIVADO',
    RETIRADA: 'ARQUIVADO',
    TRANSFORMADA_EM_NORMA: 'APROVADO',
};

interface Props {
    status: string;
}

export function MateriaStatusPill({ status }: Props) {
    const key = status as MateriaStatus;
    const styleKey: StyleKey = STATUS_STYLE_KEY[key] ?? 'ARQUIVADO';
    const style = STATUS_STYLES[styleKey];
    const label = MATERIA_STATUS_LABELS[key] ?? MATERIA_STATUS[key as MateriaStatus] ?? status;

    return (
        <span
            className="text-[10.5px] font-medium px-2.5 py-1 rounded-[6px]"
            style={{ background: style.bg, color: style.text }}
        >
            {label}
        </span>
    );
}
