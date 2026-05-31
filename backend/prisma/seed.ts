import {
  PrismaClient,
  RoleUsuario,
  TenantStatus,
  TenantUserRole,
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
  model: 'tipoMateria' | 'tipoAutor' | 'tipoSessao' | 'cargoMesa',
  nome: string,
) {
  const data = { tenantId: DEMO_TENANT_ID, nome };
  const where = { tenantId_nome: { tenantId: DEMO_TENANT_ID, nome } };
  switch (model) {
    case 'tipoMateria':
      return prisma.tipoMateria.upsert({ where, update: {}, create: data });
    case 'tipoAutor':
      return prisma.tipoAutor.upsert({ where, update: {}, create: data });
    case 'tipoSessao':
      return prisma.tipoSessao.upsert({ where, update: {}, create: data });
    case 'cargoMesa':
      return prisma.cargoMesa.upsert({ where, update: {}, create: data });
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
      tenantId_userId: { tenantId: DEMO_TENANT_ID, userId: camaraUser.id },
    },
    update: {
      role: TenantUserRole.ADMIN,
      status: TenantUserStatus.ACTIVE,
      isAdmin: true,
      isRemoved: false,
    },
    create: {
      tenantId: DEMO_TENANT_ID,
      userId: camaraUser.id,
      role: TenantUserRole.ADMIN,
      status: TenantUserStatus.ACTIVE,
      isAdmin: true,
    },
  });
  console.log('Usuário câmara: admin@camara.teste / camara123 (CNPJ 00.000.000/0001-91)');

  const ano2026 = await prisma.ano.upsert({
    where: { valor: 2026 },
    update: {},
    create: { valor: 2026 },
  });

  for (const nome of ['Projeto de Lei', 'Requerimento', 'Indicação', 'Moção']) {
    await upsertTenantLookup('tipoMateria', nome);
  }

  const tiposListagem = ['Expediente', 'Ordem do Dia', 'Geral'];
  for (const nome of tiposListagem) {
    await prisma.tipoListagem.upsert({ where: { nome }, update: {}, create: { nome } });
  }

  const tematicas = ['Educação', 'Saúde', 'Obras', 'Meio Ambiente'];
  for (const nome of tematicas) {
    await prisma.tematica.upsert({ where: { nome }, update: {}, create: { nome } });
  }

  const origens = ['Iniciativa Popular', 'Executivo', 'Legislativo'];
  for (const nome of origens) {
    await prisma.origemMateria.upsert({ where: { nome }, update: {}, create: { nome } });
  }

  const locais = ['Assembleia Estadual', 'Congresso Nacional', 'Câmara Municipal'];
  for (const nome of locais) {
    await prisma.localOrigemExterna.upsert({ where: { nome }, update: {}, create: { nome } });
  }

  const unidades = ['Protocolo', 'Comissão de Constituição', 'Plenário'];
  for (const nome of unidades) {
    await prisma.unidadeTramitacao.upsert({ where: { nome }, update: {}, create: { nome } });
  }

  const esferas = ['Municipal', 'Estadual', 'Federal'];
  for (const nome of esferas) {
    await prisma.esferaFederacao.upsert({ where: { nome }, update: {}, create: { nome } });
  }

  const identificadores = ['Lei nº', 'Decreto nº', 'Resolução nº'];
  for (const nome of identificadores) {
    await prisma.identificadorNorma.upsert({ where: { nome }, update: {}, create: { nome } });
  }

  const tiposNorma = ['Lei Ordinária', 'Lei Complementar', 'Resolução'];
  for (const nome of tiposNorma) {
    await prisma.tipoNorma.upsert({
      where: { nome },
      update: {},
      create: { nome },
    });
  }

  for (const nome of ['Ordinária', 'Extraordinária', 'Solene']) {
    await upsertTenantLookup('tipoSessao', nome);
  }

  const situacoes: { nome: string; codigo: 'AGENDADA' | 'EM_ANDAMENTO' | 'ENCERRADA' | 'CANCELADA' }[] = [
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

  const statusTram = ['Protocolada', 'Em comissão', 'Pauta', 'Aprovada', 'Arquivada'];
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

  await prisma.sessaoLegislativa.upsert({
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

  console.log('Seed concluído. Tenant demo:', DEMO_TENANT_ID, 'Ano:', ano2026.valor);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
