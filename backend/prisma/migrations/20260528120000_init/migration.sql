-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "RoleUsuario" AS ENUM ('MASTER', 'ADMIN', 'OPERADOR');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "role" "RoleUsuario" NOT NULL DEFAULT 'OPERADOR',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ano" (
    "id" TEXT NOT NULL,
    "valor" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ano_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoMateria" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "TipoMateria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoListagem" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "TipoListagem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tematica" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Tematica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrigemMateria" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "OrigemMateria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalOrigemExterna" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "LocalOrigemExterna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoAutor" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "TipoAutor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusTramitacao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "StatusTramitacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnidadeTramitacao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "UnidadeTramitacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoSessao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "TipoSessao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SituacaoSessao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "SituacaoSessao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EsferaFederacao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "EsferaFederacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdentificadorNorma" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "IdentificadorNorma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoNorma" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "TipoNorma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassificacaoAto" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "ClassificacaoAto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoAto" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "TipoAto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CargoMesa" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "CargoMesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pessoa" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pessoa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parlamentar" (
    "id" TEXT NOT NULL,
    "pessoaId" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "mensagem" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Parlamentar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Autor" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipoAutorId" TEXT NOT NULL,
    "parlamentarId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Autor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comissao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "mensagem" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comissao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComissaoMembro" (
    "id" TEXT NOT NULL,
    "comissaoId" TEXT NOT NULL,
    "parlamentarId" TEXT NOT NULL,
    "titular" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ComissaoMembro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrenteParlamentar" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "mensagem" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FrenteParlamentar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrenteMembro" (
    "id" TEXT NOT NULL,
    "frenteId" TEXT NOT NULL,
    "parlamentarId" TEXT NOT NULL,

    CONSTRAINT "FrenteMembro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Legislatura" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Legislatura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessaoLegislativa" (
    "id" TEXT NOT NULL,
    "legislaturaId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "dataInicio" TIMESTAMP(3),
    "dataFim" TIMESTAMP(3),

    CONSTRAINT "SessaoLegislativa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessaoPlenaria" (
    "id" TEXT NOT NULL,
    "sessaoLegislativaId" TEXT,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "tipoSessaoId" TEXT NOT NULL,
    "situacaoId" TEXT NOT NULL,
    "mensagem" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessaoPlenaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MesaDiretora" (
    "id" TEXT NOT NULL,
    "legislaturaId" TEXT NOT NULL,
    "sessaoId" TEXT,
    "mensagem" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MesaDiretora_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MesaDiretoraMembro" (
    "id" TEXT NOT NULL,
    "mesaId" TEXT NOT NULL,
    "parlamentarId" TEXT NOT NULL,
    "cargoId" TEXT NOT NULL,

    CONSTRAINT "MesaDiretoraMembro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Materia" (
    "id" TEXT NOT NULL,
    "tipoId" TEXT NOT NULL,
    "ementa" TEXT NOT NULL,
    "numero" INTEGER,
    "numeroProtocolo" INTEGER,
    "anoId" TEXT,
    "tematicaId" TEXT,
    "origemId" TEXT,
    "tipoListagemId" TEXT,
    "dataApresentacaoInicio" TIMESTAMP(3),
    "dataApresentacaoFim" TIMESTAMP(3),
    "dataPublicacaoInicio" TIMESTAMP(3),
    "dataPublicacaoFim" TIMESTAMP(3),
    "autorId" TEXT,
    "primeiroAutorId" TEXT,
    "relatorId" TEXT,
    "localOrigemExternaId" TEXT,
    "unidadeTramitacaoDestinoId" TEXT,
    "statusTramitacaoId" TEXT,
    "emTramitacao" BOOLEAN NOT NULL DEFAULT true,
    "mensagem" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Materia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Norma" (
    "id" TEXT NOT NULL,
    "tipoId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "anoId" TEXT,
    "data" TIMESTAMP(3),
    "dataPublicacaoInicio" TIMESTAMP(3),
    "dataPublicacaoFim" TIMESTAMP(3),
    "esferaFederacaoId" TEXT,
    "ementa" TEXT NOT NULL,
    "identificadorId" TEXT,
    "materiaOrigemId" TEXT,
    "mensagem" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Norma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ato" (
    "id" TEXT NOT NULL,
    "tipoId" TEXT NOT NULL,
    "classificacaoId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3),
    "dataFim" TIMESTAMP(3),
    "dataPublicacaoInicio" TIMESTAMP(3),
    "dataPublicacaoFim" TIMESTAMP(3),
    "mensagem" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PautaItem" (
    "id" TEXT NOT NULL,
    "sessaoId" TEXT NOT NULL,
    "materiaId" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,

    CONSTRAINT "PautaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresencaSessao" (
    "id" TEXT NOT NULL,
    "sessaoId" TEXT NOT NULL,
    "parlamentarId" TEXT NOT NULL,
    "presente" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PresencaSessao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_username_key" ON "Usuario"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Ano_valor_key" ON "Ano"("valor");

-- CreateIndex
CREATE UNIQUE INDEX "TipoMateria_nome_key" ON "TipoMateria"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "TipoListagem_nome_key" ON "TipoListagem"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Tematica_nome_key" ON "Tematica"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "OrigemMateria_nome_key" ON "OrigemMateria"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "LocalOrigemExterna_nome_key" ON "LocalOrigemExterna"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "TipoAutor_nome_key" ON "TipoAutor"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "StatusTramitacao_nome_key" ON "StatusTramitacao"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "UnidadeTramitacao_nome_key" ON "UnidadeTramitacao"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "TipoSessao_nome_key" ON "TipoSessao"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "SituacaoSessao_nome_key" ON "SituacaoSessao"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "EsferaFederacao_nome_key" ON "EsferaFederacao"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "IdentificadorNorma_nome_key" ON "IdentificadorNorma"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "TipoNorma_nome_key" ON "TipoNorma"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "ClassificacaoAto_nome_key" ON "ClassificacaoAto"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "TipoAto_nome_key" ON "TipoAto"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "CargoMesa_nome_key" ON "CargoMesa"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Pessoa_cpf_key" ON "Pessoa"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Parlamentar_pessoaId_key" ON "Parlamentar"("pessoaId");

-- CreateIndex
CREATE UNIQUE INDEX "ComissaoMembro_comissaoId_parlamentarId_key" ON "ComissaoMembro"("comissaoId", "parlamentarId");

-- CreateIndex
CREATE UNIQUE INDEX "FrenteMembro_frenteId_parlamentarId_key" ON "FrenteMembro"("frenteId", "parlamentarId");

-- CreateIndex
CREATE UNIQUE INDEX "Legislatura_numero_key" ON "Legislatura"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "SessaoLegislativa_legislaturaId_numero_key" ON "SessaoLegislativa"("legislaturaId", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "MesaDiretoraMembro_mesaId_cargoId_key" ON "MesaDiretoraMembro"("mesaId", "cargoId");

-- CreateIndex
CREATE UNIQUE INDEX "PautaItem_sessaoId_materiaId_key" ON "PautaItem"("sessaoId", "materiaId");

-- CreateIndex
CREATE UNIQUE INDEX "PautaItem_sessaoId_ordem_key" ON "PautaItem"("sessaoId", "ordem");

-- CreateIndex
CREATE UNIQUE INDEX "PresencaSessao_sessaoId_parlamentarId_key" ON "PresencaSessao"("sessaoId", "parlamentarId");

-- AddForeignKey
ALTER TABLE "Parlamentar" ADD CONSTRAINT "Parlamentar_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Autor" ADD CONSTRAINT "Autor_tipoAutorId_fkey" FOREIGN KEY ("tipoAutorId") REFERENCES "TipoAutor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Autor" ADD CONSTRAINT "Autor_parlamentarId_fkey" FOREIGN KEY ("parlamentarId") REFERENCES "Parlamentar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComissaoMembro" ADD CONSTRAINT "ComissaoMembro_comissaoId_fkey" FOREIGN KEY ("comissaoId") REFERENCES "Comissao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComissaoMembro" ADD CONSTRAINT "ComissaoMembro_parlamentarId_fkey" FOREIGN KEY ("parlamentarId") REFERENCES "Parlamentar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrenteMembro" ADD CONSTRAINT "FrenteMembro_frenteId_fkey" FOREIGN KEY ("frenteId") REFERENCES "FrenteParlamentar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrenteMembro" ADD CONSTRAINT "FrenteMembro_parlamentarId_fkey" FOREIGN KEY ("parlamentarId") REFERENCES "Parlamentar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessaoLegislativa" ADD CONSTRAINT "SessaoLegislativa_legislaturaId_fkey" FOREIGN KEY ("legislaturaId") REFERENCES "Legislatura"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessaoPlenaria" ADD CONSTRAINT "SessaoPlenaria_sessaoLegislativaId_fkey" FOREIGN KEY ("sessaoLegislativaId") REFERENCES "SessaoLegislativa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessaoPlenaria" ADD CONSTRAINT "SessaoPlenaria_tipoSessaoId_fkey" FOREIGN KEY ("tipoSessaoId") REFERENCES "TipoSessao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessaoPlenaria" ADD CONSTRAINT "SessaoPlenaria_situacaoId_fkey" FOREIGN KEY ("situacaoId") REFERENCES "SituacaoSessao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MesaDiretora" ADD CONSTRAINT "MesaDiretora_legislaturaId_fkey" FOREIGN KEY ("legislaturaId") REFERENCES "Legislatura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MesaDiretora" ADD CONSTRAINT "MesaDiretora_sessaoId_fkey" FOREIGN KEY ("sessaoId") REFERENCES "SessaoPlenaria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MesaDiretoraMembro" ADD CONSTRAINT "MesaDiretoraMembro_mesaId_fkey" FOREIGN KEY ("mesaId") REFERENCES "MesaDiretora"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MesaDiretoraMembro" ADD CONSTRAINT "MesaDiretoraMembro_parlamentarId_fkey" FOREIGN KEY ("parlamentarId") REFERENCES "Parlamentar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MesaDiretoraMembro" ADD CONSTRAINT "MesaDiretoraMembro_cargoId_fkey" FOREIGN KEY ("cargoId") REFERENCES "CargoMesa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Materia" ADD CONSTRAINT "Materia_tipoId_fkey" FOREIGN KEY ("tipoId") REFERENCES "TipoMateria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Materia" ADD CONSTRAINT "Materia_anoId_fkey" FOREIGN KEY ("anoId") REFERENCES "Ano"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Materia" ADD CONSTRAINT "Materia_tematicaId_fkey" FOREIGN KEY ("tematicaId") REFERENCES "Tematica"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Materia" ADD CONSTRAINT "Materia_origemId_fkey" FOREIGN KEY ("origemId") REFERENCES "OrigemMateria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Materia" ADD CONSTRAINT "Materia_tipoListagemId_fkey" FOREIGN KEY ("tipoListagemId") REFERENCES "TipoListagem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Materia" ADD CONSTRAINT "Materia_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Autor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Materia" ADD CONSTRAINT "Materia_primeiroAutorId_fkey" FOREIGN KEY ("primeiroAutorId") REFERENCES "Parlamentar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Materia" ADD CONSTRAINT "Materia_relatorId_fkey" FOREIGN KEY ("relatorId") REFERENCES "Parlamentar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Materia" ADD CONSTRAINT "Materia_localOrigemExternaId_fkey" FOREIGN KEY ("localOrigemExternaId") REFERENCES "LocalOrigemExterna"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Materia" ADD CONSTRAINT "Materia_unidadeTramitacaoDestinoId_fkey" FOREIGN KEY ("unidadeTramitacaoDestinoId") REFERENCES "UnidadeTramitacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Materia" ADD CONSTRAINT "Materia_statusTramitacaoId_fkey" FOREIGN KEY ("statusTramitacaoId") REFERENCES "StatusTramitacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Norma" ADD CONSTRAINT "Norma_tipoId_fkey" FOREIGN KEY ("tipoId") REFERENCES "TipoNorma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Norma" ADD CONSTRAINT "Norma_anoId_fkey" FOREIGN KEY ("anoId") REFERENCES "Ano"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Norma" ADD CONSTRAINT "Norma_esferaFederacaoId_fkey" FOREIGN KEY ("esferaFederacaoId") REFERENCES "EsferaFederacao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Norma" ADD CONSTRAINT "Norma_identificadorId_fkey" FOREIGN KEY ("identificadorId") REFERENCES "IdentificadorNorma"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Norma" ADD CONSTRAINT "Norma_materiaOrigemId_fkey" FOREIGN KEY ("materiaOrigemId") REFERENCES "Materia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ato" ADD CONSTRAINT "Ato_tipoId_fkey" FOREIGN KEY ("tipoId") REFERENCES "TipoAto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ato" ADD CONSTRAINT "Ato_classificacaoId_fkey" FOREIGN KEY ("classificacaoId") REFERENCES "ClassificacaoAto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PautaItem" ADD CONSTRAINT "PautaItem_sessaoId_fkey" FOREIGN KEY ("sessaoId") REFERENCES "SessaoPlenaria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PautaItem" ADD CONSTRAINT "PautaItem_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresencaSessao" ADD CONSTRAINT "PresencaSessao_sessaoId_fkey" FOREIGN KEY ("sessaoId") REFERENCES "SessaoPlenaria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PresencaSessao" ADD CONSTRAINT "PresencaSessao_parlamentarId_fkey" FOREIGN KEY ("parlamentarId") REFERENCES "Parlamentar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
