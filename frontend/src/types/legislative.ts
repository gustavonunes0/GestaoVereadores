/** Mirrors backend StatusMateria — UI gates for pauta, norma, etc. */
export const MATERIA_STATUS = {
  EM_TRAMITACAO: 'EM_TRAMITACAO',
  APROVADA: 'APROVADA',
  REJEITADA: 'REJEITADA',
  ARQUIVADA: 'ARQUIVADA',
  RETIRADA: 'RETIRADA',
} as const;

export type MateriaStatus = (typeof MATERIA_STATUS)[keyof typeof MATERIA_STATUS];

export const MATERIA_STATUS_LABELS: Record<MateriaStatus, string> = {
  EM_TRAMITACAO: 'Em tramitação',
  APROVADA: 'Aprovada',
  REJEITADA: 'Rejeitada',
  ARQUIVADA: 'Arquivada',
  RETIRADA: 'Retirada',
};

export type TipoVotacao = 'NOMINAL' | 'SIMBOLICA' | 'SECRETA';

export function canAddMateriaToPauta(materia: {
  status?: MateriaStatus;
  emTramitacao?: boolean;
}): boolean {
  if (materia.status) {
    return materia.status === MATERIA_STATUS.EM_TRAMITACAO;
  }
  return materia.emTramitacao === true;
}

export function canCreateNormaFromMateria(materia: {
  status?: MateriaStatus;
}): boolean {
  return materia.status === MATERIA_STATUS.APROVADA;
}

export function shouldHideNominalVotes(tipoVotacao?: TipoVotacao): boolean {
  return tipoVotacao === 'SECRETA';
}
