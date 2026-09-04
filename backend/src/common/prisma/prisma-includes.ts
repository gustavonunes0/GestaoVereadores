export const materiaAutoresInclude = {    include: { autor: true },
    orderBy: { ordem: 'asc' as const },
} as const;

export const materiaParliamentarianSelect = {
    id: true,
    parliamentaryName: true,
    officeNumber: true,
    photoUrl: true,
    parliamentarianUser: {
        select: {
            politicalParty: {
                select: { id: true, name: true, acronym: true },
            },
        },
    },
} as const;

/** Usuário vinculado ao parceiro — nome + foto de perfil nas matérias. */
export const materiaTenantPartnerUserSelect = {
    select: {
        user: {
            select: {
                firstName: true,
                lastName: true,
                profilePicture: true,
            },
        },
    },
} as const;

export const materiaRelationsInclude = {
    tipo: true,
    ano: true,
    tematica: true,
    origem: true,
    autor: {
        include: {
            tenantPartner: {
                select: {
                    id: true,
                    nome: true,
                    cargo: true,
                    instituicao: true,
                    tenantPartnerUser: materiaTenantPartnerUserSelect,
                },
            },
            tipoAutor: { select: { id: true, nome: true } },
        },
    },
    materiaAutores: materiaAutoresInclude,
    statusTramitacao: true,
    unidadeTramitacaoDestino: true,
    localOrigemExterna: true,
    tipoListagem: true,
    authorParliamentarian: { select: materiaParliamentarianSelect },
    rapporteurParliamentarian: { select: materiaParliamentarianSelect },
    matterCoauthors: {
        orderBy: { ordem: 'asc' as const },
        include: {
            parliamentarian: { select: materiaParliamentarianSelect },
            tenantPartner: {
                select: {
                    id: true,
                    nome: true,
                    tipoAutorId: true,
                    tenantPartnerUser: materiaTenantPartnerUserSelect,
                },
            },
        },
    },
} as const;

export const materiaAutoriaInclude = {
    ...materiaRelationsInclude,
    autor: {
        include: {
            tenantPartner: {
                select: { id: true, nome: true, tipoAutorId: true },
            },
            parliamentarian: { select: materiaParliamentarianSelect },
        },
    },
} as const;

export const votacaoInclude = {
    include: {
        votos: {
            include: {
                parliamentarian: { select: materiaParliamentarianSelect },
            },
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
            ato: { include: { tipo: true, classificacao: true } },
            norma: { include: { tipo: true, ano: true } },
            comissao: { select: { id: true, nome: true, sigla: true } },
            votacao: votacaoInclude,
        },
        orderBy: { ordem: 'asc' as const },
    },
    presencas: {
        include: {
            parliamentarian: {
                select: {
                    id: true,
                    parliamentaryName: true,
                    photoUrl: true,
                },
            },
        },
    },
} as const;
