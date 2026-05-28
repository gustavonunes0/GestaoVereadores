/** Includes Prisma reutilizados entre módulos legislativos. */
export const parlamentarComPessoa = {
  include: { pessoa: true },
} as const;

export const membrosComParlamentar = {
  include: { parlamentar: parlamentarComPessoa },
} as const;

export const materiaRelationsInclude = {
  tipo: true,
  ano: true,
  tematica: true,
  origem: true,
  autor: true,
  primeiroAutor: parlamentarComPessoa,
  relator: parlamentarComPessoa,
  statusTramitacao: true,
  unidadeTramitacaoDestino: true,
} as const;

export const sessaoPlenariaInclude = {
  tipoSessao: true,
  situacao: true,
  sessaoLegislativa: { include: { legislatura: true } },
  pautaItens: {
    include: { materia: true },
    orderBy: { ordem: 'asc' as const },
  },
  presencas: membrosComParlamentar,
} as const;

export const mesaDiretoraInclude = {
  legislatura: true,
  sessao: true,
  membros: {
    include: {
      parlamentar: parlamentarComPessoa,
      cargo: true,
    },
  },
} as const;
