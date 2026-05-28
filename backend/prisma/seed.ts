import { PrismaClient, RoleUsuario } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
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
  console.log('Usuário master: admin / admin');
  const ano2026 = await prisma.ano.upsert({
    where: { valor: 2026 },
    update: {},
    create: { valor: 2026 },
  });

  const tiposMateria = ['Projeto de Lei', 'Requerimento', 'Indicação', 'Moção'];
  for (const nome of tiposMateria) {
    await prisma.tipoMateria.upsert({
      where: { nome },
      update: {},
      create: { nome },
    });
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

  const tiposSessao = ['Ordinária', 'Extraordinária', 'Solene'];
  for (const nome of tiposSessao) {
    await prisma.tipoSessao.upsert({
      where: { nome },
      update: {},
      create: { nome },
    });
  }

  const situacoes = ['Agendada', 'Em andamento', 'Encerrada', 'Cancelada'];
  for (const nome of situacoes) {
    await prisma.situacaoSessao.upsert({
      where: { nome },
      update: {},
      create: { nome },
    });
  }

  const tiposAutor = ['Parlamentar', 'Executivo', 'Popular'];
  for (const nome of tiposAutor) {
    await prisma.tipoAutor.upsert({
      where: { nome },
      update: {},
      create: { nome },
    });
  }

  const statusTram = ['Protocolada', 'Em comissão', 'Pauta', 'Aprovada', 'Arquivada'];
  for (const nome of statusTram) {
    await prisma.statusTramitacao.upsert({
      where: { nome },
      update: {},
      create: { nome },
    });
  }

  const cargos = ['Presidente', 'Vice-Presidente', '1º Secretário', '2º Secretário'];
  for (const nome of cargos) {
    await prisma.cargoMesa.upsert({
      where: { nome },
      update: {},
      create: { nome },
    });
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
    where: { numero: 20 },
    update: {},
    create: {
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

  console.log('Seed concluído. Ano referência:', ano2026.valor);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
