/** Includes Prisma reutilizados entre módulos legislativos. */
export const parlamentarComPessoa = {
  include: {
    pessoa: true,
    mandatos: {
      include: { legislatura: true },
      orderBy: { legislatura: { numero: 'desc' as const } },
    },
  },
} as const;

export const membrosComParlamentar = {
  include: { parlamentar: parlamentarComPessoa },
} as const;

export const materiaAutoresInclude = {
  include: { autor: true },
  orderBy: { ordem: 'asc' as const },
} as const;

export const materiaParlamentaresVinculoInclude = {
  include: { parlamentar: parlamentarComPessoa },
  orderBy: { ordem: 'asc' as const },
} as const;

export const materiaRelationsInclude = {
  tipo: true,
  ano: true,
  tematica: true,
  origem: true,
  autor: true,
  materiaAutores: materiaAutoresInclude,
  representantes: materiaParlamentaresVinculoInclude,
  coautores: materiaParlamentaresVinculoInclude,
  primeiroAutor: parlamentarComPessoa,
  relator: parlamentarComPessoa,
  statusTramitacao: true,
  unidadeTramitacaoDestino: true,
  localOrigemExterna: true,
  tipoListagem: true,
} as const;

export const votacaoInclude = {
  include: {
    votos: {
      include: { parlamentar: parlamentarComPessoa },
    },
  },
} as const;

export const sessaoPlenariaInclude = {
  tipoSessao: true,
  situacao: true,
  sessaoLegislativa: { include: { legislatura: true } },
  pautaItens: {
    include: {
      materia: true,
      votacao: votacaoInclude,
    },
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
