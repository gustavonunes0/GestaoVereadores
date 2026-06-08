Você é um agente backend especialista em NestJS, Prisma, PostgreSQL, DDD, multi-tenancy e sistemas legislativos para Câmara de Vereadores.

Leia antes de alterar qualquer código:

- `.cursorrules`
- `docs/architecture/`
- `docs/specs/`
- `prisma/schema.prisma`

## Contexto

As Tasks 1, 2 e 3 já foram executadas.

A Task 3 criou problemas porque usou nomes de bounded contexts em inglês, como:

```txt
parliamentarians
legislatures
committees
board
fronts
matters
sessions
voting
agenda

Mas o sistema atual e o Prisma schema usam nomes de domínio em português, como:

Parlamentar
Legislatura
Comissao
MesaDiretora
FrenteParlamentar
Materia
SessaoPlenaria
PautaItem
PresencaSessao
Votacao
AgendaLegislativa

O schema atual também possui relações do Tenant com entidades em português:

parlamentares
legislaturas
comissoes
frentes
materias
sessoesPlenarias
mesasDiretoras
agendasLegislativas
Objetivo da Task 2.1

Corrigir a migração estrutural dos módulos legislativos para que os bounded contexts reflitam o domínio real em português do sistema.

Importante:

Não recriar tudo do zero.
Não apagar código sem verificar uso.
Não executar migration destrutiva.
Não rodar prisma migrate reset.
Corrigir imports, nomes de módulos, paths e relação com Prisma.
Manter DDD por bounded context.
Manter código de classes em inglês quando possível.
Manter mensagens de erro em português.
Regra principal

A pasta raiz continua sendo:

src/legislative/

Mas os submódulos devem usar nomes alinhados ao domínio atual em português.

Usar esta estrutura:

src/legislative/
├── legislative.module.ts
├── parlamentares/
├── legislaturas/
├── partidos-politicos/
├── comissoes/
├── mesa-diretora/
├── frentes-parlamentares/
├── materias/
├── sessoes-plenarias/
├── votacoes/
└── agenda-legislativa/
Mapeamento obrigatório

Corrigir os módulos da Task 2 conforme este mapa:

parliamentarians        → parlamentares
legislatures            → legislaturas
political-parties       → partidos-politicos
committees              → comissoes
board                   → mesa-diretora
fronts                  → frentes-parlamentares
matters                 → materias
sessions                → sessoes-plenarias
voting                  → votacoes
agenda                  → agenda-legislativa
Regra de nomes
Pastas

Pastas de módulo devem ficar em português e kebab-case:

parlamentares
legislaturas
partidos-politicos
comissoes
mesa-diretora
frentes-parlamentares
materias
sessoes-plenarias
votacoes
agenda-legislativa
Classes TypeScript

Classes podem continuar em inglês para manter padrão técnico:

ParliamentariansModule
CreateParliamentarianUseCase
ParliamentarianRepository
PrismaParliamentarianRepository

Ou podem usar nomes em português se o projeto já estiver assim:

ParlamentaresModule
CreateParlamentarUseCase
ParlamentarRepository
PrismaParlamentarRepository

Escolha o padrão predominante no projeto atual e aplique de forma consistente.

Não misturar dentro do mesmo módulo.

Prisma Models

Não renomear models Prisma nesta task sem plano de migração.

Se o schema atual usa:

model Parlamentar
model Legislatura
model Comissao
model FrenteParlamentar
model Materia
model SessaoPlenaria
model Votacao
model AgendaLegislativa

mantenha esses nomes por enquanto.

A camada infra/repository deve adaptar os nomes do Prisma para as entidades de domínio.

Exemplo:

// domínio pode chamar Parliamentarian
// infra usa prisma.parlamentar

ou:

// domínio pode chamar Parlamentar
// infra usa prisma.parlamentar

O mais importante é não quebrar o Prisma existente.

Estrutura obrigatória por submódulo

Cada submódulo deve seguir:

src/legislative/<modulo>/
├── <modulo>.module.ts
├── application/
│   ├── controllers/
│   ├── dto/
│   ├── use-cases/
│   └── view-models/
├── domain/
│   ├── entities/
│   ├── enums/
│   ├── repositories/
│   ├── services/
│   ├── factories/
│   ├── builders/
│   └── facades/
└── infra/
    ├── prisma/
    ├── repositories/
    └── integrations/
Corrigir LegislativeModule

Atualizar:

src/legislative/legislative.module.ts

Para importar os módulos corretos em português.

Exemplo, se as classes ficarem em inglês:

import { Module } from '@nestjs/common';
import { ParliamentariansModule } from './parlamentares/parlamentares.module';
import { LegislaturesModule } from './legislaturas/legislaturas.module';
import { PoliticalPartiesModule } from './partidos-politicos/partidos-politicos.module';
import { CommitteesModule } from './comissoes/comissoes.module';
import { BoardModule } from './mesa-diretora/mesa-diretora.module';
import { ParliamentaryFrontsModule } from './frentes-parlamentares/frentes-parlamentares.module';
import { MattersModule } from './materias/materias.module';
import { PlenarySessionsModule } from './sessoes-plenarias/sessoes-plenarias.module';
import { VotingModule } from './votacoes/votacoes.module';
import { LegislativeAgendaModule } from './agenda-legislativa/agenda-legislativa.module';

@Module({
  imports: [
    ParliamentariansModule,
    LegislaturesModule,
    PoliticalPartiesModule,
    CommitteesModule,
    BoardModule,
    ParliamentaryFrontsModule,
    MattersModule,
    PlenarySessionsModule,
    VotingModule,
    LegislativeAgendaModule,
  ],
})
export class LegislativeModule {}

Ou, se o padrão do projeto estiver em português:

import { Module } from '@nestjs/common';
import { ParlamentaresModule } from './parlamentares/parlamentares.module';
import { LegislaturasModule } from './legislaturas/legislaturas.module';
import { PartidosPoliticosModule } from './partidos-politicos/partidos-politicos.module';
import { ComissoesModule } from './comissoes/comissoes.module';
import { MesaDiretoraModule } from './mesa-diretora/mesa-diretora.module';
import { FrentesParlamentaresModule } from './frentes-parlamentares/frentes-parlamentares.module';
import { MateriasModule } from './materias/materias.module';
import { SessoesPlenariasModule } from './sessoes-plenarias/sessoes-plenarias.module';
import { VotacoesModule } from './votacoes/votacoes.module';
import { AgendaLegislativaModule } from './agenda-legislativa/agenda-legislativa.module';

@Module({
  imports: [
    ParlamentaresModule,
    LegislaturasModule,
    PartidosPoliticosModule,
    ComissoesModule,
    MesaDiretoraModule,
    FrentesParlamentaresModule,
    MateriasModule,
    SessoesPlenariasModule,
    VotacoesModule,
    AgendaLegislativaModule,
  ],
})
export class LegislativeModule {}

Use apenas uma das abordagens, de acordo com o padrão predominante no projeto.

Corrigir paths criados pela Task 2

Se existirem estas pastas:

src/legislative/parliamentarians
src/legislative/legislatures
src/legislative/committees
src/legislative/board
src/legislative/fronts
src/legislative/matters
src/legislative/sessions
src/legislative/voting
src/legislative/agenda

Migrar para:

src/legislative/parlamentares
src/legislative/legislaturas
src/legislative/comissoes
src/legislative/mesa-diretora
src/legislative/frentes-parlamentares
src/legislative/materias
src/legislative/sessoes-plenarias
src/legislative/votacoes
src/legislative/agenda-legislativa

Se political-parties foi criado na Task 3, migrar para:

src/legislative/partidos-politicos
Rotas HTTP

Usar rotas em português, alinhadas ao produto:

/api/legislative/parlamentares
/api/legislative/legislaturas
/api/legislative/partidos-politicos
/api/legislative/comissoes
/api/legislative/mesa-diretora
/api/legislative/frentes-parlamentares
/api/legislive/materias
/api/legislative/sessoes-plenarias
/api/legislative/votacoes
/api/legislative/agenda-legislativa

Corrigir typo se aparecer:

legislive → legislative
Prisma

Não renomear tabelas nesta task.

Se os models atuais estão em português, manter.

Exemplos:

model Parlamentar
model Legislatura
model Comissao
model FrenteParlamentar
model Materia
model SessaoPlenaria
model Votacao
model AgendaLegislativa

Apenas garantir que os repositories concretos usem os delegates corretos:

this.prisma.parlamentar
this.prisma.legislatura
this.prisma.comissao
this.prisma.frenteParlamentar
this.prisma.materia
this.prisma.sessaoPlenaria
this.prisma.votacao
this.prisma.agendaLegislativa

Não usar delegates inexistentes como:

this.prisma.parliamentarian
this.prisma.legislature
this.prisma.committee
this.prisma.matter

a menos que o schema tenha sido realmente alterado e o Prisma Client gerado.

Parlamentares

O módulo correto deve ficar em:

src/legislative/parlamentares/

Manter a regra de negócio já definida:

Parlamentar é perfil legislativo de TenantUser.
Não usar Pessoa no fluxo principal.
Não usar userId direto.
Usar tenantUserId obrigatório.
Só criar Parlamentar se TenantUser.isParliamentarian = true.

Se o Prisma ainda tiver pessoaId, não apagar sem plano.

Nesta task, fazer uma das opções:

Se migration da Task 3 já removeu pessoaId, ajustar repository para usar tenantUserId.
Se migration ainda não removeu pessoaId, parar e reportar conflito antes de continuar.
Legislaturas

O módulo correto deve ficar em:

src/legislative/legislaturas/

Usar Prisma model:

model Legislatura

Se a camada domain usa Legislature, mapear corretamente:

Legislature domain entity
↔ Legislatura Prisma model
Partidos Políticos

O módulo correto deve ficar em:

src/legislative/partidos-politicos/

Se na Task 3 foi criado:

src/legislative/political-parties/

migrar para partidos-politicos.

O model Prisma pode continuar como:

model PoliticalParty

se já foi criado assim.

Mas o path do módulo deve ser português:

src/legislative/partidos-politicos
Comissões

O módulo correto deve ficar em:

src/legislative/comissoes/

Usar Prisma models:

model Comissao
model TipoComissao
model ComissaoMembro

Não implementar CRUD completo agora se ainda não for escopo.

Apenas corrigir estrutura e imports.

Mesa Diretora

O módulo correto deve ficar em:

src/legislative/mesa-diretora/

Usar Prisma models:

model MesaDiretora
model CargoMesa
model MesaDiretoraMembro
Frentes Parlamentares

O módulo correto deve ficar em:

src/legislative/frentes-parlamentares/

Usar Prisma models:

model FrenteParlamentar
model FrenteMembro
Matérias

O módulo correto deve ficar em:

src/legislative/materias/

Usar Prisma models:

model Materia
model TipoMateria
model Autor
model TipoAutor
model MateriaAutor
model MateriaCoautor
model MateriaRepresentante
Sessões Plenárias

O módulo correto deve ficar em:

src/legislative/sessoes-plenarias/

Usar Prisma models:

model SessaoPlenaria
model SessaoLegislativa
model TipoSessao
model SituacaoSessao
model PresencaSessao
model PautaItem
Votações

O módulo correto deve ficar em:

src/legislative/votacoes/

Usar Prisma models:

model Votacao
model VotoParlamentar
Agenda Legislativa

O módulo correto deve ficar em:

src/legislative/agenda-legislativa/

Usar Prisma model:

model AgendaLegislativa
Remoção de módulos antigos

Depois de migrar imports e confirmar que não há referências, remover ou arquivar as pastas antigas:

parliamentarians
legislatures
committees
board
fronts
matters
sessions
voting
agenda
political-parties

Antes de remover, fazer busca global por imports.

Não remover se ainda houver referência ativa.

Validação obrigatória

Rodar ou preparar:

npm run lint
npm run build
npx prisma generate

Não rodar migration destrutiva.

Não rodar:

npx prisma migrate reset
Entrega esperada

Ao finalizar, o domínio legislativo deve estar assim:

src/legislative/
├── legislative.module.ts
├── parlamentares/
├── legislaturas/
├── partidos-politicos/
├── comissoes/
├── mesa-diretora/
├── frentes-parlamentares/
├── materias/
├── sessoes-plenarias/
├── votacoes/
└── agenda-legislativa/
Checklist final

Reporte ao final:

 Analisei os módulos criados pela Task 2.
 Identifiquei módulos em inglês criados incorretamente.
 Migrei parliamentarians para parlamentares.
 Migrei legislatures para legislaturas.
 Migrei political-parties para partidos-politicos.
 Migrei committees para comissoes.
 Migrei board para mesa-diretora.
 Migrei fronts para frentes-parlamentares.
 Migrei matters para materias.
 Migrei sessions para sessoes-plenarias.
 Migrei voting para votacoes.
 Migrei agenda para agenda-legislativa.
 Corrigi imports no legislative.module.ts.
 Corrigi imports no app.module.ts ou módulo raiz.
 Corrigi rotas HTTP para português.
 Repositories usam delegates Prisma existentes.
 Não usei delegates Prisma inexistentes em inglês.
 Não renomeei models Prisma sem migration planejada.
 Não rodei migration destrutiva.
 Não usei prisma migrate reset.
 Não coloquei regra de negócio em src/legislative/ raiz.
 Mantive DDD por bounded context.
 Mantive multi-tenancy.
 Mantive soft delete.
 Build/lint foram executados ou reportados se falharam.

O ponto principal agora é: **pastas e rotas em português para refletir o produto; classes podem fica