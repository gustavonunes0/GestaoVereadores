export type StatusMateria =
    | 'RASCUNHO'
    | 'PROTOCOLADA'
    | 'LIDA_NO_PLENARIO'
    | 'EM_ANALISE_NAS_COMISSOES'
    | 'PRONTA_PARA_ORDEM_DO_DIA'
    | 'EM_VOTACAO'
    | 'APROVADA_PELO_LEGISLATIVO'
    | 'VETADA'
    | 'SANCIONADA';

export type TipoAutorMateria = 'PARLAMENTAR' | 'TENANT_PARTNER' | 'EXECUTIVO' | 'COMISSAO';

export interface CoautorMateria {
    id: string;
    tipoCoautor: TipoAutorMateria;
    parlamentar?: { id: string; nomeParlamentar: string };
    tenantPartnerUser?: {
        id: string;
        nome: string;
        tenantPartner: { id: string; nome: string };
    };
}

export interface CreateMateriaDto {
    tipoMateriaId: string;
    numero?: string;
    dataProtocolo?: string;
    tipoAutor: TipoAutorMateria;
    autorId?: string;
    autorTexto?: string;
    ementa: string;
    justificativa?: string;
    statusMateria?: StatusMateria;
}

export interface UpdateMateriaDto extends Partial<CreateMateriaDto> {
    statusMateria?: StatusMateria;
}

export const STATUS_MATERIA_LABELS: Record<StatusMateria, string> = {
    RASCUNHO:                  'Rascunho',
    PROTOCOLADA:               'Protocolada',
    LIDA_NO_PLENARIO:          'Lida no plenário',
    EM_ANALISE_NAS_COMISSOES:  'Em análise nas comissões',
    PRONTA_PARA_ORDEM_DO_DIA:  'Pronta para ordem do dia',
    EM_VOTACAO:                'Em votação',
    APROVADA_PELO_LEGISLATIVO: 'Aprovada pelo legislativo',
    VETADA:                    'Vetada',
    SANCIONADA:                'Sancionada',
};

export const TIPOS_AUTOR_OPTIONS: Array<{ value: TipoAutorMateria; label: string }> = [
    { value: 'PARLAMENTAR',    label: 'Parlamentar' },
    { value: 'TENANT_PARTNER', label: 'Instituição parceira' },
    { value: 'EXECUTIVO',      label: 'Poder Executivo' },
    { value: 'COMISSAO',       label: 'Comissão' },
];

export function gerarOpcoesStatus(statusAtual: StatusMateria): StatusMateria[] {
    const ordem: StatusMateria[] = [
        'RASCUNHO', 'PROTOCOLADA', 'LIDA_NO_PLENARIO',
        'EM_ANALISE_NAS_COMISSOES', 'PRONTA_PARA_ORDEM_DO_DIA',
        'EM_VOTACAO', 'APROVADA_PELO_LEGISLATIVO',
    ];
    const idx = ordem.indexOf(statusAtual);
    const fromCurrent = idx >= 0 ? ordem.slice(idx) : ordem;
    return [...fromCurrent, 'VETADA', 'SANCIONADA'].filter(
        (v, i, arr) => arr.indexOf(v) === i,
    ) as StatusMateria[];
}
