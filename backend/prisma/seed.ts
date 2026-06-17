import {
    PrismaClient,
    CodigoTipoSessao,
    RoleUsuario,
    TenantStatus,
    TenantUserRole,
    TenantUserStatus,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomBytes, scrypt as scryptCallback } from 'crypto';
import { promisify } from 'util';
import { BRAZILIAN_POLITICAL_PARTIES } from './data/brazilian-political-parties';

const prisma = new PrismaClient();
const scrypt = promisify(scryptCallback);

export const DEMO_TENANT_ID = 'a0000000-0000-4000-8000-000000000001';

async function hashPasswordScrypt(value: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scrypt(value, salt, 64)) as Buffer;
    return `${salt}:${derivedKey.toString('hex')}`;
}

async function main() {
    // --- Tenant demo ---
    await prisma.tenant.upsert({
        where: { id: DEMO_TENANT_ID },
        update: {
            name: 'Câmara Municipal de Teste',
            status: TenantStatus.ACTIVE,
            isRemoved: false,
            portalSlug: 'camara-demo',
            settings: {
                portal: {
                    ativo: true,
                    titulo: 'Câmara Municipal de Teste',
                    secoes: {
                        vereadores: true,
                        mesaDiretora: true,
                        comissoes: true,
                        agenda: true,
                        normas: true,
                        materias: false,
                        transmissao: true,
                    },
                },
            },
        },
        create: {
            id: DEMO_TENANT_ID,
            name: 'Câmara Municipal de Teste',
            cnpj: '00000000000191',
            status: TenantStatus.ACTIVE,
            portalSlug: 'camara-demo',
        },
    });

    for (const party of BRAZILIAN_POLITICAL_PARTIES) {
        await prisma.politicalParty.upsert({
            where: {
                tenantId_acronym: {
                    tenantId: DEMO_TENANT_ID,
                    acronym: party.sigla,
                },
            },
            update: {
                name: party.nome,
                isRemoved: false,
                removedAt: null,
            },
            create: {
                tenantId: DEMO_TENANT_ID,
                acronym: party.sigla,
                name: party.nome,
            },
        });
    }
    console.log(
        `Partidos políticos: ${BRAZILIAN_POLITICAL_PARTIES.length} cadastrados/atualizados`,
    );

    // --- Usuário SIGL master ---
    const passwordHash = await bcrypt.hash('admin', 10);
    await prisma.usuario.upsert({
        where: { username: 'admin' },
        update: { passwordHash, role: RoleUsuario.MASTER, ativo: true },
        create: {
            username: 'admin',
            passwordHash,
            nome: 'Administrador Master',
            role: RoleUsuario.MASTER,
            ativo: true,
        },
    });
    console.log('Usuário SIGL master: admin / admin');

    // --- Usuário admin da câmara ---
    const camaraPasswordHash = await hashPasswordScrypt('camara123');
    const camaraUser = await prisma.user.upsert({
        where: { email: 'admin@camara.teste' },
        update: { passwordHash: camaraPasswordHash, isRemoved: false },
        create: {
            firstName: 'Admin',
            lastName: 'Câmara',
            cpf: '00000000191',
            email: 'admin@camara.teste',
            passwordHash: camaraPasswordHash,
        },
    });

    await prisma.tenantUser.upsert({
        where: {
            tenantId_userId: {
                tenantId: DEMO_TENANT_ID,
                userId: camaraUser.id,
            },
        },
        update: {
            role: TenantUserRole.ADMIN_STAFF,
            isTenantAdmin: true,
            isTenantStaff: true,
            isParliamentarian: false,
            status: TenantUserStatus.ACTIVE,
            isRemoved: false,
        },
        create: {
            tenantId: DEMO_TENANT_ID,
            userId: camaraUser.id,
            role: TenantUserRole.ADMIN_STAFF,
            isTenantAdmin: true,
            isTenantStaff: true,
            isParliamentarian: false,
            status: TenantUserStatus.ACTIVE,
        },
    });
    console.log(
        'Usuário câmara: admin@camara.teste / camara123 (CNPJ 00.000.000/0001-91)',
    );

    // --- Conta ADMIN_STAFF adicional (CPF + senha) ---
    const adminStaffPasswordHash = await hashPasswordScrypt('admin123');
    const adminStaffUser = await prisma.user.upsert({
        where: { email: 'admin.staff@camara.teste' },
        update: {
            firstName: 'Admin',
            lastName: 'Staff',
            cpf: '99999999999',
            passwordHash: adminStaffPasswordHash,
            isRemoved: false,
        },
        create: {
            firstName: 'Admin',
            lastName: 'Staff',
            cpf: '99999999999',
            email: 'admin.staff@camara.teste',
            passwordHash: adminStaffPasswordHash,
        },
    });

    await prisma.tenantUser.upsert({
        where: {
            tenantId_userId: {
                tenantId: DEMO_TENANT_ID,
                userId: adminStaffUser.id,
            },
        },
        update: {
            role: TenantUserRole.ADMIN_STAFF,
            isTenantAdmin: true,
            isTenantStaff: true,
            isParliamentarian: false,
            status: TenantUserStatus.ACTIVE,
            isRemoved: false,
        },
        create: {
            tenantId: DEMO_TENANT_ID,
            userId: adminStaffUser.id,
            role: TenantUserRole.ADMIN_STAFF,
            isTenantAdmin: true,
            isTenantStaff: true,
            isParliamentarian: false,
            status: TenantUserStatus.ACTIVE,
        },
    });
    console.log('Usuário ADMIN_STAFF: CPF 99999999999 / senha admin123');

    // --- Gustavo — ADMIN_STAFF (CPF real) ---
    const gustavoPasswordHash = await hashPasswordScrypt('admin123');
    const gustavoUser = await prisma.user.upsert({
        where: { cpf: '07415914309' },
        update: {
            firstName: 'Gustavo',
            lastName: 'Nunes',
            email: 'gustavo@camara.teste',
            passwordHash: gustavoPasswordHash,
            isRemoved: false,
        },
        create: {
            firstName: 'Gustavo',
            lastName: 'Nunes',
            cpf: '07415914309',
            email: 'gustavo@camara.teste',
            passwordHash: gustavoPasswordHash,
        },
    });

    await prisma.tenantUser.upsert({
        where: {
            tenantId_userId: {
                tenantId: DEMO_TENANT_ID,
                userId: gustavoUser.id,
            },
        },
        update: {
            role: TenantUserRole.ADMIN_STAFF,
            isTenantAdmin: true,
            isTenantStaff: true,
            isParliamentarian: false,
            status: TenantUserStatus.ACTIVE,
            isRemoved: false,
        },
        create: {
            tenantId: DEMO_TENANT_ID,
            userId: gustavoUser.id,
            role: TenantUserRole.ADMIN_STAFF,
            isTenantAdmin: true,
            isTenantStaff: true,
            isParliamentarian: false,
            status: TenantUserStatus.ACTIVE,
        },
    });
    console.log('Usuário ADMIN_STAFF: CPF 07415914309 / senha admin123 (Gustavo)');

    // --- Ano ---
    const ano2026 = await prisma.ano.upsert({
        where: { valor: 2026 },
        update: {},
        create: { valor: 2026 },
    });

    // --- TipoAutor — 26 tipos globais (tenantId: null) com idNegocio (C4a) ---
    const tiposAutorGlobal = [
        { idNegocio: 1,  nome: 'Parlamentar' },
        { idNegocio: 2,  nome: 'Frente Parlamentar' },
        { idNegocio: 3,  nome: 'Comissão' },
        { idNegocio: 4,  nome: 'Órgão' },
        { idNegocio: 5,  nome: 'Bancada Parlamentar' },
        { idNegocio: 6,  nome: 'Bloco Parlamentar' },
        { idNegocio: 7,  nome: 'Poder Executivo Municipal' },
        { idNegocio: 8,  nome: 'Presidente do Sindicato dos Professores' },
        { idNegocio: 9,  nome: 'Secretário' },
        { idNegocio: 10, nome: 'Sociedade' },
        { idNegocio: 11, nome: 'Coordenadora do CEO' },
        { idNegocio: 12, nome: 'Coordenadora de Saúde Bucal do Município' },
        { idNegocio: 13, nome: 'Advogado Município' },
        { idNegocio: 14, nome: 'Presidente do Sindicato dos Servidores' },
        { idNegocio: 15, nome: 'Presidente da OAB' },
        { idNegocio: 16, nome: 'Secretário de Cultura' },
        { idNegocio: 17, nome: 'Mesa Diretora' },
        { idNegocio: 20, nome: 'Comissão de Justiça e Redação (CJR)' },
        { idNegocio: 21, nome: 'Procurador' },
        { idNegocio: 22, nome: 'Liderança Regional' },
        { idNegocio: 23, nome: 'Deputado Federal' },
        { idNegocio: 24, nome: 'Presidente Municipal do PSL' },
        { idNegocio: 25, nome: 'Sindicato dos Servidores' },
        { idNegocio: 26, nome: 'Tribunal de Contas do Estado do Ceará' },
    ];
    for (const { idNegocio, nome } of tiposAutorGlobal) {
        const existing = await prisma.tipoAutor.findFirst({
            where: { tenantId: null, nome },
        });
        if (!existing) {
            await prisma.tipoAutor.create({ data: { tenantId: null, idNegocio, nome } });
        } else if (existing.idNegocio !== idNegocio) {
            await prisma.tipoAutor.update({ where: { id: existing.id }, data: { idNegocio } });
        }
    }
    console.log(`TipoAutor global: ${tiposAutorGlobal.length} tipos criados`);

    // --- TipoMateria — 18 tipos com sigla e ordem (TASK-001b T-14 + C4b) ---
    const tiposMateria = [
        { nome: 'Projeto de Lei Ordinária',          sigla: 'PLO',   ordem: 1 },
        { nome: 'Projeto de Lei Complementar',       sigla: 'PLC',   ordem: 2 },
        { nome: 'Projeto de Decreto Legislativo',    sigla: 'PDL',   ordem: 3 },
        { nome: 'Projeto de Resolução',              sigla: 'PR',    ordem: 4 },
        { nome: 'Requerimento Legislativo',          sigla: 'REQ',   ordem: 5 },
        { nome: 'Indicação',                         sigla: 'IND',   ordem: 6 },
        { nome: 'Substitutivo',                      sigla: 'SUB',   ordem: 7 },
        { nome: 'Sub-emenda',                        sigla: 'SUBE',  ordem: 8 },
        { nome: 'Parecer',                           sigla: 'PAR',   ordem: 9 },
        { nome: 'Recurso',                           sigla: 'REC',   ordem: 10 },
        { nome: 'Emenda à Lei Orgânica do Município', sigla: 'ELOM', ordem: 11 },
        { nome: 'Emenda',                            sigla: 'EMD',   ordem: 12 },
        { nome: 'Projeto de Indicação de Lei',       sigla: 'PIL',   ordem: 13 },
        { nome: 'Projeto de Lei - Executivo',        sigla: 'PLOE',  ordem: 14 },
        { nome: 'Moção',                             sigla: 'MOÇ',   ordem: 15 },
        { nome: 'Ofício',                            sigla: 'OFC',   ordem: 16 },
        { nome: 'Pedido de Veto de PLO',             sigla: 'PVPLO', ordem: 17 },
        { nome: 'Projeto de Lei (CTC)',               sigla: 'PLCTC', ordem: 18 },
    ];
    for (const { nome, sigla, ordem } of tiposMateria) {
        await prisma.tipoMateria.upsert({
            where: { tenantId_nome: { tenantId: DEMO_TENANT_ID, nome } },
            update: { sigla, ordem },
            create: { tenantId: DEMO_TENANT_ID, nome, sigla, ordem },
        });
    }
    console.log(`TipoMateria: ${tiposMateria.length} tipos criados`);

    // --- EsferaFederacao (C4e) ---
    for (const nome of ['Municipal', 'Estadual', 'Federal']) {
        await prisma.esferaFederacao.upsert({
            where: { nome },
            update: {},
            create: { nome },
        });
    }

    // --- TipoNorma — 16 tipos (C4c) ---
    const tiposNorma = [
        'Constituição Estadual',
        'Constituição Federal',
        'Decreto',
        'Decreto Legislativo',
        'Decreto Lei',
        'Emenda à Lei Orgânica',
        'Emenda Constitucional',
        'Emenda Constitucional de Revisão',
        'Lei',
        'Lei Complementar',
        'Lei Delegada',
        'Lei Orgânica',
        'Medida Provisória',
        'Portaria',
        'Regimento Interno',
        'Resolução',
    ];
    for (const nome of tiposNorma) {
        await prisma.tipoNorma.upsert({
            where: { nome },
            update: {},
            create: { nome },
        });
    }
    console.log(`TipoNorma: ${tiposNorma.length} tipos criados`);

    // --- IdentificadorNorma — 19 valores (C4d) ---
    const identificadoresNorma = [
        'Lei Orgânica',
        'Regimento Interno',
        'Constituição Federal',
        'Constituição Estadual',
        'Regime Jurídico Único',
        'Código Tributário do Município',
        'Pessoal',
        'Licitações e Contratos',
        'Transparência Legislativa',
        'Transparência Administrativa',
        'Participação e Controle Social',
        'Contabilidade Governamental',
        'Aderência a LAI',
        'Lei de Proteção de Dados (LGPD)',
        'Lei do Governo Digital',
        'Estrutura Organizacional',
        'Diária',
        'Procuradoria da Mulher',
        'Outros',
    ];
    for (const nome of identificadoresNorma) {
        await prisma.identificadorNorma.upsert({
            where: { nome },
            update: {},
            create: { nome },
        });
    }
    console.log(`IdentificadorNorma: ${identificadoresNorma.length} valores criados`);

    // --- TipoAto — 4 tipos (C4f) ---
    const tiposAto = [
        'Decreto Legislativo',
        'Edital de Convocação',
        'Edital de Publicação',
        'Portaria',
    ];
    for (const nome of tiposAto) {
        await prisma.tipoAto.upsert({
            where: { nome },
            update: {},
            create: { nome },
        });
    }

    // --- ClassificacaoAto — 11 valores (C4g) ---
    const classificacoesAto = [
        'Portaria Aprova Prestação de Contas de Governo',
        'Edital de Publicação - Prestação de Contas de Governo',
        'Sessão Extraordinária',
        'Sessão de Posse - Início de Legislatura',
        'Convoca Reunião da CDFO',
        'Convoca Reunião da CJR',
        'Convoca Reunião Pública',
        'Portaria de Nomeação',
        'Portaria de Exoneração',
        'Nomeia Membros das Comissões Permanentes',
    ];
    for (const nome of classificacoesAto) {
        await prisma.classificacaoAto.upsert({
            where: { nome },
            update: {},
            create: { nome },
        });
    }
    console.log(`ClassificacaoAto: ${classificacoesAto.length} valores criados`);

    // --- Lookups de apoio ---
    for (const nome of ['Permanente', 'Temporária', 'Especial']) {
        await prisma.tipoComissao.upsert({
            where: { tenantId_nome: { tenantId: DEMO_TENANT_ID, nome } },
            update: {},
            create: { tenantId: DEMO_TENANT_ID, nome },
        });
    }

    for (const nome of ['Expediente', 'Ordem do Dia', 'Geral']) {
        await prisma.tipoListagem.upsert({
            where: { nome },
            update: {},
            create: { nome },
        });
    }

    for (const nome of ['Educação', 'Saúde', 'Obras', 'Meio Ambiente']) {
        await prisma.tematica.upsert({
            where: { nome },
            update: {},
            create: { nome },
        });
    }

    for (const nome of ['Iniciativa Popular', 'Executivo', 'Legislativo']) {
        await prisma.origemMateria.upsert({
            where: { nome },
            update: {},
            create: { nome },
        });
    }

    for (const nome of ['Assembleia Estadual', 'Congresso Nacional', 'Câmara Municipal']) {
        await prisma.localOrigemExterna.upsert({
            where: { nome },
            update: {},
            create: { nome },
        });
    }

    for (const nome of ['Protocolo', 'Comissão de Constituição', 'Plenário']) {
        await prisma.unidadeTramitacao.upsert({
            where: { nome },
            update: {},
            create: { nome },
        });
    }

    for (const nome of ['Protocolada', 'Em comissão', 'Pauta', 'Aprovada', 'Arquivada']) {
        await prisma.statusTramitacao.upsert({
            where: { nome },
            update: {},
            create: { nome },
        });
    }

    // --- TipoSessao ---
    const tiposSessao: { nome: string; codigo: CodigoTipoSessao }[] = [
        { nome: 'Ordinária',      codigo: CodigoTipoSessao.ORDINARIA },
        { nome: 'Extraordinária', codigo: CodigoTipoSessao.EXTRAORDINARIA },
        { nome: 'Solene',         codigo: CodigoTipoSessao.SOLENE },
        { nome: 'Especial',       codigo: CodigoTipoSessao.ESPECIAL },
    ];
    for (const tipo of tiposSessao) {
        await prisma.tipoSessao.upsert({
            where: { tenantId_nome: { tenantId: DEMO_TENANT_ID, nome: tipo.nome } },
            update: { codigo: tipo.codigo },
            create: { tenantId: DEMO_TENANT_ID, nome: tipo.nome, codigo: tipo.codigo },
        });
    }

    // --- SituacaoSessao ---
    const situacoes: { nome: string; codigo: 'AGENDADA' | 'EM_ANDAMENTO' | 'ENCERRADA' | 'CANCELADA' }[] = [
        { nome: 'Agendada',     codigo: 'AGENDADA' },
        { nome: 'Em andamento', codigo: 'EM_ANDAMENTO' },
        { nome: 'Encerrada',    codigo: 'ENCERRADA' },
        { nome: 'Cancelada',    codigo: 'CANCELADA' },
    ];
    for (const { nome, codigo } of situacoes) {
        await prisma.situacaoSessao.upsert({
            where: { nome },
            update: { codigo },
            create: { nome, codigo },
        });
    }

    // --- CargoMesa ---
    for (const nome of ['Presidente', 'Vice-Presidente', '1º Secretário', '2º Secretário']) {
        await prisma.cargoMesa.upsert({
            where: { tenantId_nome: { tenantId: DEMO_TENANT_ID, nome } },
            update: {},
            create: { tenantId: DEMO_TENANT_ID, nome },
        });
    }

    // --- BoardRole ---
    for (const nome of ['Presidente', 'Vice-Presidente', 'Primeiro Secretário', 'Segundo Secretário']) {
        await prisma.boardRole.upsert({
            where: { tenantId_name: { tenantId: DEMO_TENANT_ID, name: nome } },
            update: { isRemoved: false, removedAt: null },
            create: { tenantId: DEMO_TENANT_ID, name: nome },
        });
    }

    // --- Committees demo ---
    const committeesDemo = [
        {
            name: 'Comissão de Finanças e Orçamento',
            acronym: 'CDFO',
            type: 'PERMANENT' as const,
            purpose: 'Compete analisar proposta orçamentária, LDO, PPA e matérias de impacto fiscal municipal.',
        },
        {
            name: 'Comissão de Justiça e Redação',
            acronym: 'CDJR',
            type: 'PERMANENT' as const,
            purpose: 'Análise jurídica e redação final de matérias legislativas.',
        },
        {
            name: 'Comissão de Ética',
            acronym: 'CDE',
            type: 'PERMANENT' as const,
            purpose: 'Apuração de conduta parlamentar.',
            status: 'INACTIVE' as const,
        },
    ];
    for (const c of committeesDemo) {
        await prisma.committee.upsert({
            where: { tenantId_acronym: { tenantId: DEMO_TENANT_ID, acronym: c.acronym } },
            update: { name: c.name, type: c.type, purpose: c.purpose, status: c.status ?? 'ACTIVE' },
            create: {
                tenantId: DEMO_TENANT_ID,
                name: c.name,
                acronym: c.acronym,
                type: c.type,
                purpose: c.purpose,
                status: c.status ?? 'ACTIVE',
            },
        });
    }

    // --- Frentes Parlamentares demo ---
    const frentesDemo = [
        { name: 'Frente Parlamentar da Educação', theme: 'Educação', description: 'Grupo suprapartidário em defesa da educação pública municipal.' },
        { name: 'Frente Parlamentar da Saúde',    theme: 'Saúde',    description: 'Articulação parlamentar em causas de saúde pública.' },
    ];
    for (const f of frentesDemo) {
        const exists = await prisma.parliamentaryFront.findFirst({
            where: { tenantId: DEMO_TENANT_ID, name: f.name, isRemoved: false },
        });
        if (!exists) {
            await prisma.parliamentaryFront.create({
                data: { tenantId: DEMO_TENANT_ID, name: f.name, theme: f.theme, description: f.description },
            });
        }
    }

    // --- Legislatura e Sessão Legislativa ---
    const legislatura = await prisma.legislatura.upsert({
        where: { tenantId_numero: { tenantId: DEMO_TENANT_ID, numero: 20 } },
        update: {},
        create: { tenantId: DEMO_TENANT_ID, numero: 20, dataInicio: new Date('2025-01-01') },
    });

    await prisma.legislature.upsert({
        where: { tenantId_number: { tenantId: DEMO_TENANT_ID, number: 20 } },
        update: { isCurrent: true },
        create: { tenantId: DEMO_TENANT_ID, number: 20, startDate: new Date('2025-01-01'), isCurrent: true },
    });

    const sessaoLeg = await prisma.sessaoLegislativa.upsert({
        where: { legislaturaId_numero: { legislaturaId: legislatura.id, numero: 1 } },
        update: {},
        create: { legislaturaId: legislatura.id, numero: 1, dataInicio: new Date('2025-02-01') },
    });

    // --- Sessões plenárias demo ---
    const tipoOrdinaria = await prisma.tipoSessao.findFirst({
        where: { tenantId: DEMO_TENANT_ID, nome: 'Ordinária' },
    });
    const situacaoAgendada = await prisma.situacaoSessao.findFirst({
        where: { codigo: 'AGENDADA' },
    });
    const situacaoEncerrada = await prisma.situacaoSessao.findFirst({
        where: { codigo: 'ENCERRADA' },
    });

    if (tipoOrdinaria && situacaoAgendada) {
        const sessoesDemo = [
            { dataInicio: new Date('2026-03-10T19:00:00'), situacaoId: situacaoAgendada.id, mensagem: 'Sessão ordinária agendada (demo)' },
            { dataInicio: new Date('2026-02-15T19:00:00'), situacaoId: situacaoEncerrada?.id ?? situacaoAgendada.id, mensagem: undefined as string | undefined },
        ];
        for (const s of sessoesDemo) {
            const exists = await prisma.sessaoPlenaria.findFirst({
                where: { tenantId: DEMO_TENANT_ID, dataInicio: s.dataInicio },
            });
            if (!exists) {
                await prisma.sessaoPlenaria.create({
                    data: { tenantId: DEMO_TENANT_ID, sessaoLegislativaId: sessaoLeg.id, tipoSessaoId: tipoOrdinaria.id, ...s },
                });
            }
        }
    }

    // --- Vereadores demo ---
    const vereadoresDemo = [
        { cpf: '11111111111', nome: 'João da Silva Santos',   nomeParlamentar: 'João Silva',    partido: 'PT',   gabinete: '01', email: 'joao.silva@camara.teste' },
        { cpf: '22222222222', nome: 'Maria Oliveira Costa',   nomeParlamentar: 'Maria Oliveira', partido: 'PSDB', gabinete: '02', email: 'maria.oliveira@camara.teste' },
        { cpf: '33333333333', nome: 'Carlos Pereira Lima',    nomeParlamentar: 'Carlos Pereira', partido: 'MDB',  gabinete: '03', ativo: false },
    ];

    for (const v of vereadoresDemo) {
        const pessoa = await prisma.pessoa.upsert({
            where: { cpf: v.cpf },
            update: { nome: v.nome, nomeParlamentar: v.nomeParlamentar, email: v.email ?? null },
            create: { nome: v.nome, nomeParlamentar: v.nomeParlamentar, cpf: v.cpf, email: v.email ?? null },
        });

        const parlamentar = await prisma.parlamentar.upsert({
            where: { pessoaId: pessoa.id },
            update: { partido: v.partido, gabinete: v.gabinete, ativo: v.ativo ?? true },
            create: { tenantId: DEMO_TENANT_ID, pessoaId: pessoa.id, partido: v.partido, gabinete: v.gabinete, ativo: v.ativo ?? true },
        });

        await prisma.parlamentarMandato.upsert({
            where: { parlamentarId_legislaturaId: { parlamentarId: parlamentar.id, legislaturaId: legislatura.id } },
            update: { titular: true, ativo: true },
            create: { parlamentarId: parlamentar.id, legislaturaId: legislatura.id, titular: true, dataPosse: new Date('2025-01-01'), ativo: true },
        });
    }

    console.log('Seed concluído. Tenant demo:', DEMO_TENANT_ID, '| Ano:', ano2026.valor);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
