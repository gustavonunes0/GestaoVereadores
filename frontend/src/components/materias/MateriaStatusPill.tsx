import { MATERIA_STATUS } from '../../types/legislative';

const STATUS_STYLES = {
    RASCUNHO:   { bg: '#fef3e2', text: '#92400e' },
    TRAMITANDO: { bg: '#e0f2fe', text: '#075985' },
    APROVADO:   { bg: '#dcfce7', text: '#166534' },
    REJEITADO:  { bg: '#fee2e2', text: '#991b1b' },
    ARQUIVADO:  { bg: '#f3f4f6', text: '#4b5563' },
} as const;

type StyleKey = keyof typeof STATUS_STYLES;

const STATUS_STYLE_KEY: Record<string, StyleKey> = {
    // valores antigos
    DRAFT:                   'RASCUNHO',
    PROTOCOLADA:             'TRAMITANDO',
    EM_TRAMITACAO:           'TRAMITANDO',
    EM_PAUTA:                'TRAMITANDO',
    APROVADA:                'APROVADO',
    REJEITADA:               'REJEITADO',
    ARQUIVADA:               'ARQUIVADO',
    RETIRADA:                'ARQUIVADO',
    TRANSFORMADA_EM_NORMA:   'APROVADO',
    // novos valores do backend
    RASCUNHO:                    'RASCUNHO',
    LIDA_NO_PLENARIO:            'TRAMITANDO',
    EM_ANALISE_NAS_COMISSOES:    'TRAMITANDO',
    PRONTA_PARA_ORDEM_DO_DIA:    'TRAMITANDO',
    EM_VOTACAO:                  'TRAMITANDO',
    APROVADA_PELO_LEGISLATIVO:   'APROVADO',
    VETADA:                      'REJEITADO',
    SANCIONADA:                  'APROVADO',
};

const LABEL_OVERRIDE: Record<string, string> = {
    RASCUNHO:                  'Rascunho',
    LIDA_NO_PLENARIO:          'Lida no plenário',
    EM_ANALISE_NAS_COMISSOES:  'Em análise',
    PRONTA_PARA_ORDEM_DO_DIA:  'Pronta para pauta',
    EM_VOTACAO:                'Em votação',
    APROVADA_PELO_LEGISLATIVO: 'Aprovada',
    VETADA:                    'Vetada',
    SANCIONADA:                'Sancionada',
};

interface Props {
    status: string;
}

export function MateriaStatusPill({ status }: Props) {
    const styleKey: StyleKey = STATUS_STYLE_KEY[status] ?? 'ARQUIVADO';
    const style = STATUS_STYLES[styleKey];
    const label =
        LABEL_OVERRIDE[status] ??
        MATERIA_STATUS[status as keyof typeof MATERIA_STATUS] ??
        status;

    return (
        <span
            className="text-[10.5px] font-medium px-2.5 py-1 rounded-[6px]"
            style={{ background: style.bg, color: style.text }}
        >
            {label}
        </span>
    );
}
