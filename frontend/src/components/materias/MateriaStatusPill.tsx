import { MATERIA_STATUS, type MateriaStatus } from '../../types/legislative';

const STATUS_STYLES = {
    RASCUNHO: { bg: '#fef3e2', text: '#92400e' },
    TRAMITANDO: { bg: '#e0f2fe', text: '#075985' },
    APROVADO: { bg: '#dcfce7', text: '#166534' },
    REJEITADO: { bg: '#fee2e2', text: '#991b1b' },
    ARQUIVADO: { bg: '#f3f4f6', text: '#4b5563' },
} as const;

type StatusStyleKey = keyof typeof STATUS_STYLES;

const STATUS_STYLE_KEY: Record<MateriaStatus, StatusStyleKey> = {
    DRAFT: 'RASCUNHO',
    PROTOCOLADA: 'TRAMITANDO',
    EM_TRAMITACAO: 'TRAMITANDO',
    EM_PAUTA: 'TRAMITANDO',
    APROVADA: 'APROVADO',
    REJEITADA: 'REJEITADO',
    ARQUIVADA: 'ARQUIVADO',
    RETIRADA: 'ARQUIVADO',
    TRANSFORMADA_EM_NORMA: 'APROVADO',
};

interface Props {
    status: MateriaStatus;
}

export function MateriaStatusPill({ status }: Props) {
    const styleKey = STATUS_STYLE_KEY[status] ?? 'ARQUIVADO';
    const style = STATUS_STYLES[styleKey];

    return (
        <span
            className="text-[10.5px] font-medium px-2.5 py-1 rounded-[6px]"
            style={{ background: style.bg, color: style.text }}
        >
            {MATERIA_STATUS[status]}
        </span>
    );
}
