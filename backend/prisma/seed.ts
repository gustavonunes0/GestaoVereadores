import {
    PrismaClient,
    CodigoTipoSessao,
    RoleUsuario,
    TenantStatus,
    TenantUserStatus,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomBytes, scrypt as scryptCallback } from 'crypto';
import { promisify } from 'util';

const prisma = new PrismaClient();
const scrypt = promisify(scryptCallback);

export const DEMO_TENANT_ID = 'a0000000-0000-4000-8000-000000000001';

async function hashPasswordScrypt(value: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scrypt(value, salt, 64)) as Buffer;
    return `${salt}:${derivedKey.toString('hex')}`;
}

async function upsertTenantLookup(
    model:
        | 'tipoMateria'
        | 'tipoAutor'
        | 'tipoSessao'
        | 'cargoMesa'
        | 'tipoComissao',
    nome: string,
) {
    const data = { tenantId: DEMO_TENANT_ID, nome };
    const where = { tenantId_nome: { tenantId: DEMO_TENANT_ID, nome } };
    switch (model) {
        case 'tipoMateria':
            return prisma.tipoMateria.upsert({
                where,
                update: {},
                create: data,
            });
        case 'tipoAutor':
            return prisma.tipoAutor.upsert({ where, update: {}, create: data });
        case 'tipoSessao':
            return prisma.tipoSessao.upsert({
                where,
                update: {},
                create: data,
            });
        case 'cargoMesa':
            return prisma.cargoMesa.upsert({ where, update: {}, create: data });
        case 'tipoComissao':
            return prisma.tipoComissao.upsert({
                where,
                update: {},
                create: data,
            });
    }
}

async function main() {
    await prisma.tenant.upsert({
        where: { id: DEMO_TENANT_ID },
        update: {
            name: 'Câmara Municipal de Teste',
            status: TenantStatus.ACTIVE,
            isRemoved: false,
        },
        create: {
            id: DEMO_TENANT_ID,
            name: 'Câmara Municipal de Teste',
            cnpj: '00000000000191',
            status: TenantStatus.ACTIVE,
        },
    });

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
            isTenantAdmin: true,
            isTenantStaff: true,
            isParliamentarian: false,
            status: TenantUserStatus.ACTIVE,
            isRemoved: false,
        },
        create: {
            tenantId: DEMO_TENANT_ID,
            userId: camaraUser.id,
            isTenantAdmin: true,
            isTenantStaff: true,
            isParliamentarian: false,
            status: TenantUserStatus.ACTIVE,
        },
    });
    console.log(
        'Usuário câmara: admin@camara.teste / camara123 (CNPJ 00.000.000/0001-91)',
    );

    const ano2026 = await prisma.ano.upsert({
        where: { valor: 2026 },
        update: {},
        create: { valor: 2026 },
    });

    for (const nome of [
        'Projeto de Lei',
        'Requerimento',
        'Indicação',
        'Moção',
    ]) {
        await upsertTenantLookup('tipoMateria', nome);
    }

    for (const nome of ['Permanente', 'Temporária', 'Especial']) {
        await upsertTenantLookup('tipoComissao', nome);
    }

    const tiposListagem = ['Expediente', 'Ordem do Dia', 'Geral'];
    for (const nome of tiposListagem) {
        await prisma.tipoListagem.upsert({
            where: { nome },
            update: {},
            create: { nome },
        });
    }

    const tematicas = ['Educação', 'Saúde', 'Obras', 'Meio Ambiente'];
    for (const nome of tematicas) {
        await prisma.tematica.upsert({
            where: { nome },
            update: {},
            create: { nome },
        });
    }

    const origens = ['Iniciativa Popular', 'Executivo', 'Legislativo'];
    for (const nome of origens) {
        await prisma.origemMateria.upsert({
            where: { nome },
            update: {},
            create: { nome },
        });
    }

    const locais = [
        'Assembleia Estadual',
        'Congresso Nacional',
        'Câmara Municipal',
    ];
    for (const nome of locais) {
        await prisma.localOrigemExterna.upsert({
            where: { nome },
            update: {},
            create: { nome },
        });
    }

    const unidades = ['Protocolo', 'Comissão de Constituição', 'Plenário'];
    for (const nome of unidades) {
        await prisma.unidadeTramitacao.upsert({
            where: { nome },
            update: {},
            create: { nome },
        });
    }

    const esferas = ['Municipal', 'Estadual', 'Federal'];
    for (const nome of esferas) {
        await prisma.esferaFederacao.upsert({
            where: { nome },
            update: {},
            create: { nome },
        });
    }

    const identificadores = ['Lei nº', 'Decreto nº', 'Resolução nº'];
    for (const nome of identificadores) {
        await prisma.identificadorNorma.upsert({
            where: { nome },
            update: {},
            create: { nome },
        });
    }

    const tiposNorma = ['Lei Ordinária', 'Lei Complementar', 'Resolução'];
    for (const nome of tiposNorma) {
        await prisma.tipoNorma.upsert({
            where: { nome },
            update: {},
            create: { nome },
        });
    }

    const tiposSessao: { nome: string; codigo: CodigoTipoSessao }[] = [
        { nome: 'Ordinária', codigo: CodigoTipoSessao.ORDINARIA },
        { nome: 'Extraordinária', codigo: CodigoTipoSessao.EXTRAORDINARIA },
        { nome: 'Solene', codigo: CodigoTipoSessao.SOLENE },
        { nome: 'Especial', codigo: CodigoTipoSessao.ESPECIAL },
    ];
    for (const tipo of tiposSessao) {
        await prisma.tipoSessao.upsert({
            where: {
                tenantId_nome: { tenantId: DEMO_TENANT_ID, nome: tipo.nome },
            },
            update: { codigo: tipo.codigo },
            create: {
                tenantId: DEMO_TENANT_ID,
                nome: tipo.nome,
                codigo: tipo.codigo,
            },
        });
    }

    const situacoes: {
        nome: string;
        codigo: 'AGENDADA' | 'EM_ANDAMENTO' | 'ENCERRADA' | 'CANCELADA';
    }[] = [
        { nome: 'Agendada', codigo: 'AGENDADA' },
        { nome: 'Em andamento', codigo: 'EM_ANDAMENTO' },
        { nome: 'Encerrada', codigo: 'ENCERRADA' },
        { nome: 'Cancelada', codigo: 'CANCELADA' },
    ];
    for (const { nome, codigo } of situacoes) {
        await prisma.situacaoSessao.upsert({
            where: { nome },
            update: { codigo },
            create: { nome, codigo },
        });
    }

    for (const nome of ['Parlamentar', 'Executivo', 'Popular']) {
        await upsertTenantLookup('tipoAutor', nome);
    }

    const statusTram = [
        'Protocolada',
        'Em comissão',
        'Pauta',
        'Aprovada',
        'Arquivada',
    ];
    for (const nome of statusTram) {
        await prisma.statusTramitacao.upsert({
            where: { nome },
            update: {},
            create: { nome },
        });
    }

    for (const nome of [
        'Presidente',
        'Vice-Presidente',
        '1º Secretário',
        '2º Secretário',
    ]) {
        await upsertTenantLookup('cargoMesa', nome);
    }

    for (const nome of [
        'Presidente',
        'Vice-Presidente',
        'Primeiro Secretário',
        'Segundo Secretário',
    ]) {
        await prisma.boardRole.upsert({
            where: {
                tenantId_name: { tenantId: DEMO_TENANT_ID, name: nome },
            },
            update: { isRemoved: false, removedAt: null },
            create: { tenantId: DEMO_TENANT_ID, name: nome },
        });
    }

    const committeesDemo = [
        {
            name: 'Comissão de Finanças e Orçamento',
            acronym: 'CDFO',
            type: 'PERMANENT' as const,
            purpose:
                'Compete analisar proposta orçamentária, LDO, PPA e matérias de impacto fiscal municipal.',
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
        {
            name: 'Comissão Especial de CPI Demo',
            acronym: 'CECD',
            type: 'TEMPORARY' as const,
            purpose: 'Investigar fatos determinados (demo comissão temporária).',
            startDate: new Date('2025-03-01'),
            endDate: new Date('2025-09-30'),
        },
    ];
    for (const c of committeesDemo) {
        await prisma.committee.upsert({
            where: {
                tenantId_acronym: {
                    tenantId: DEMO_TENANT_ID,
                    acronym: c.acronym,
                },
            },
            update: {
                name: c.name,
                type: c.type,
                purpose: c.purpose,
                status: c.status ?? 'ACTIVE',
                startDate: c.startDate ?? null,
                endDate: c.endDate ?? null,
                isRemoved: false,
            },
            create: {
                tenantId: DEMO_TENANT_ID,
                name: c.name,
                acronym: c.acronym,
                type: c.type,
                purpose: c.purpose,
                status: c.status ?? 'ACTIVE',
                startDate: c.startDate ?? null,
                endDate: c.endDate ?? null,
            },
        });
    }

    const frentesDemo = [
        {
            name: 'Frente Parlamentar da Educação',
            theme: 'Educação',
            description:
                'Grupo suprapartidário em defesa da educação pública municipal.',
        },
        {
            name: 'Frente Parlamentar da Saúde',
            theme: 'Saúde',
            description: 'Articulação parlamentar em causas de saúde pública.',
        },
    ];
    for (const f of frentesDemo) {
        const exists = await prisma.parliamentaryFront.findFirst({
            where: {
                tenantId: DEMO_TENANT_ID,
                name: f.name,
                isRemoved: false,
            },
        });
        if (!exists) {
            await prisma.parliamentaryFront.create({
                data: {
                    tenantId: DEMO_TENANT_ID,
                    name: f.name,
                    theme: f.theme,
                    description: f.description,
                },
            });
        }
    }

    const tiposAto = ['Portaria', 'Decreto Legislativo', 'Resolução Interna'];
    for (const nome of tiposAto) {
        await prisma.tipoAto.upsert({
            where: { nome },
            update: {},
            create: { nome },
        });
    }

    const classificacoesAto = ['Administrativo', 'Legislativo', 'Protocolo'];
    for (const nome of classificacoesAto) {
        await prisma.classificacaoAto.upsert({
            where: { nome },
            update: {},
            create: { nome },
        });
    }

    const legislatura = await prisma.legislatura.upsert({
        where: {
            tenantId_numero: { tenantId: DEMO_TENANT_ID, numero: 20 },
        },
        update: {},
        create: {
            tenantId: DEMO_TENANT_ID,
            numero: 20,
            dataInicio: new Date('2025-01-01'),
        },
    });

    await prisma.legislature.upsert({
        where: {
            tenantId_number: { tenantId: DEMO_TENANT_ID, number: 20 },
        },
        update: { isCurrent: true },
        create: {
            tenantId: DEMO_TENANT_ID,
            number: 20,
            startDate: new Date('2025-01-01'),
            isCurrent: true,
        },
    });

    const sessaoLeg = await prisma.sessaoLegislativa.upsert({
        where: {
            legislaturaId_numero: { legislaturaId: legislatura.id, numero: 1 },
        },
        update: {},
        create: {
            legislaturaId: legislatura.id,
            numero: 1,
            dataInicio: new Date('2025-02-01'),
        },
    });

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
            {
                dataInicio: new Date('2026-03-10T19:00:00'),
                situacaoId: situacaoAgendada.id,
                mensagem: 'Sessão ordinária agendada (demo pesquisar-sessao)',
            },
            {
                dataInicio: new Date('2026-02-15T19:00:00'),
                situacaoId: situacaoEncerrada?.id ?? situacaoAgendada.id,
                mensagem: undefined as string | undefined,
            },
        ];
        for (const s of sessoesDemo) {
            const exists = await prisma.sessaoPlenaria.findFirst({
                where: {
                    tenantId: DEMO_TENANT_ID,
                    dataInicio: s.dataInicio,
                },
            });
            if (!exists) {
                await prisma.sessaoPlenaria.create({
                    data: {
                        tenantId: DEMO_TENANT_ID,
                        sessaoLegislativaId: sessaoLeg.id,
                        tipoSessaoId: tipoOrdinaria.id,
                        ...s,
                    },
                });
            }
        }
    }

    const vereadoresDemo = [
        {
            cpf: '11111111111',
            nome: 'João da Silva Santos',
            nomeParlamentar: 'João Silva',
            partido: 'PT',
            gabinete: '01',
            email: 'joao.silva@camara.teste',
        },
        {
            cpf: '22222222222',
            nome: 'Maria Oliveira Costa',
            nomeParlamentar: 'Maria Oliveira',
            partido: 'PSDB',
            gabinete: '02',
            email: 'maria.oliveira@camara.teste',
        },
        {
            cpf: '33333333333',
            nome: 'Carlos Pereira Lima',
            nomeParlamentar: 'Carlos Pereira',
            partido: 'MDB',
            gabinete: '03',
            ativo: false,
        },
    ];

    for (const v of vereadoresDemo) {
        const pessoa = await prisma.pessoa.upsert({
            where: { cpf: v.cpf },
            update: {
                nome: v.nome,
                nomeParlamentar: v.nomeParlamentar,
                email: v.email,
            },
            create: {
                nome: v.nome,
                nomeParlamentar: v.nomeParlamentar,
                cpf: v.cpf,
                email: v.email,
            },
        });

        const parlamentar = await prisma.parlamentar.upsert({
            where: { pessoaId: pessoa.id },
            update: {
                partido: v.partido,
                gabinete: v.gabinete,
                ativo: v.ativo ?? true,
            },
            create: {
                tenantId: DEMO_TENANT_ID,
                pessoaId: pessoa.id,
                partido: v.partido,
                gabinete: v.gabinete,
                ativo: v.ativo ?? true,
            },
        });

        await prisma.parlamentarMandato.upsert({
            where: {
                parlamentarId_legislaturaId: {
                    parlamentarId: parlamentar.id,
                    legislaturaId: legislatura.id,
                },
            },
            update: { titular: true, ativo: true },
            create: {
                parlamentarId: parlamentar.id,
                legislaturaId: legislatura.id,
                titular: true,
                dataPosse: new Date('2025-01-01'),
                ativo: true,
            },
        });
    }

    console.log(
        'Seed concluído. Tenant demo:',
        DEMO_TENANT_ID,
        'Ano:',
        ano2026.valor,
    );
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
