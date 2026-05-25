import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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
