Você é um agente backend especialista em NestJS, Prisma, PostgreSQL, DDD, multi-tenancy e sistemas legislativos para Câmara de Vereadores.

Leia antes de alterar qualquer código:

- `.cursorrules`
- `docs/architecture/`
- `docs/specs/`
- `prisma/schema.prisma`

## Contexto

A Task 1 ajustou `TenantUser` com:

- `isTenantAdmin`
- `isTenantStaff`
- `isParliamentarian`
- múltiplas flags simultâneas
- remoção de `role` e `isAdmin`
- `permissions Json`
- `removedAt`
- soft delete
- `@@map("tenant_users")`
- índices por tenant e flags

A Task 2 criou a estrutura base:

```txt
src/legislative/
├── parliamentarians/
├── legislatures/
├── committees/
├── board/
├── fronts/
├── matters/
├── sessions/
├── voting/
└── agenda/

Agora execute a Task 3 focada somente em:

src/legislative/parliamentarians/
src/legislative/political-parties/
Objetivo da Task 3

Implementar o módulo real de Parliamentarians e criar o novo módulo de Political Parties.

O parlamentar deve ter vínculo obrigatório com:

TenantUser
PoliticalParty

Ou seja:

TenantUser
  └── Parliamentarian
        └── PoliticalParty
Não implementar nesta task

Não implementar ainda:

committees
board
fronts
matters
sessions
voting
agenda

Não criar regra de votação.

Não criar regra de tramitação de matéria.

Não alterar módulos fora do escopo sem necessidade.

Estrutura obrigatória

Criar ou ajustar:

src/legislative/
├── parliamentarians/
└── political-parties/
Political Parties

Criar novo bounded context:

src/legislative/political-parties/
├── political-parties.module.ts
├── application/
│   ├── controllers/
│   │   └── political-parties.controller.ts
│   ├── dto/
│   │   ├── create-political-party.dto.ts
│   │   ├── update-political-party.dto.ts
│   │   └── list-political-parties-query.dto.ts
│   ├── use-cases/
│   │   ├── create-political-party.use-case.ts
│   │   ├── list-political-parties.use-case.ts
│   │   ├── get-political-party-by-id.use-case.ts
│   │   ├── update-political-party.use-case.ts
│   │   └── remove-political-party.use-case.ts
│   └── view-models/
│       └── political-party.view-model.ts
├── domain/
│   ├── entities/
│   │   └── political-party.entity.ts
│   ├── repositories/
│   │   └── political-party.repository.ts
│   └── services/
│       └── political-party-domain.service.ts
└── infra/
    └── prisma/
        └── prisma-political-party.repository.ts
Parliamentarians

Garantir estrutura:

src/legislative/parliamentarians/
├── parliamentarians.module.ts
├── application/
│   ├── controllers/
│   │   └── parliamentarians.controller.ts
│   ├── dto/
│   │   ├── create-parliamentarian.dto.ts
│   │   ├── update-parliamentarian.dto.ts
│   │   └── list-parliamentarians-query.dto.ts
│   ├── use-cases/
│   │   ├── create-parliamentarian.use-case.ts
│   │   ├── list-parliamentarians.use-case.ts
│   │   ├── get-parliamentarian-by-id.use-case.ts
│   │   ├── update-parliamentarian.use-case.ts
│   │   └── remove-parliamentarian.use-case.ts
│   └── view-models/
│       └── parliamentarian.view-model.ts
├── domain/
│   ├── entities/
│   │   └── parliamentarian.entity.ts
│   ├── enums/
│   │   └── parliamentarian-status.enum.ts
│   ├── repositories/
│   │   └── parliamentarian.repository.ts
│   └── services/
│       └── parliamentarian-domain.service.ts
└── infra/
    └── prisma/
        └── prisma-parliamentarian.repository.ts
Prisma — PoliticalParty

Criar model:

model PoliticalParty {
  id       String @id @default(uuid())
  tenantId String

  name     String
  acronym  String
  ideology String?
  flagUrl  String?

  isRemoved Boolean   @default(false)
  removedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id])

  parliamentarians Parliamentarian[]

  @@unique([tenantId, acronym])
  @@unique([tenantId, name])
  @@index([tenantId])
  @@index([tenantId, isRemoved])
  @@map("political_parties")
}

Observação:

Usar flagUrl no código, pois o código deve ser em inglês.
Se o projeto já tiver padrão diferente para imagem/logo, seguir o padrão existente.
flagUrl representa a bandeira, símbolo ou imagem do partido.
Prisma — Parliamentarian

Ajustar Parliamentarian para usar:

tenantUserId String
politicalPartyId String?

Modelo esperado:

enum ParliamentarianStatus {
  ACTIVE
  INACTIVE
  LICENSED
  REMOVED
}

model Parliamentarian {
  id               String @id @default(uuid())
  tenantId         String
  tenantUserId     String
  politicalPartyId String?

  parliamentaryName String
  officeNumber      String?
  photoUrl          String?
  biography         String?

  status ParliamentarianStatus @default(ACTIVE)

  isRemoved Boolean   @default(false)
  removedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tenant         Tenant         @relation(fields: [tenantId], references: [id])
  tenantUser     TenantUser     @relation(fields: [tenantUserId], references: [id])
  politicalParty PoliticalParty? @relation(fields: [politicalPartyId], references: [id])

  mandates ParliamentarianMandate[]

  @@unique([tenantId, tenantUserId])
  @@index([tenantId])
  @@index([tenantId, status])
  @@index([tenantId, politicalPartyId])
  @@index([tenantId, isRemoved])
  @@map("parliamentarians")
}

Importante:

Não usar pessoaId.
Não usar userId direto.
Não usar partyAcronym solto se já existir politicalPartyId.
Se existir partyAcronym, migrar gradualmente para politicalPartyId.
Relação com TenantUser

Parliamentarian só pode ser criado para um TenantUser válido.

Validações obrigatórias:

1. tenantId vem somente do JWT/decorator.
2. tenantUserId vem no body.
3. TenantUser deve existir no tenant atual.
4. TenantUser.isParliamentarian deve ser true.
5. Não pode existir outro Parliamentarian para o mesmo tenantUserId no mesmo tenant.
6. Se politicalPartyId for informado, PoliticalParty deve existir no mesmo tenant.
7. PoliticalParty removido não pode ser usado.

Mensagem de erro:

throw new BadRequestException(
  'Este usuário do tenant não está marcado como parlamentar.',
);

Outras mensagens:

throw new NotFoundException('Parlamentar não encontrado');
throw new NotFoundException('Partido político não encontrado');
throw new ConflictException('Já existe parlamentar para este usuário do tenant');
throw new ConflictException('Já existe partido político com esta sigla');
Political Parties CRUD

Criar CRUD completo:

CreatePoliticalPartyUseCase
ListPoliticalPartiesUseCase
GetPoliticalPartyByIdUseCase
UpdatePoliticalPartyUseCase
RemovePoliticalPartyUseCase

Rotas:

POST   /api/legislative/political-parties
GET    /api/legislative/political-parties
GET    /api/legislative/political-parties/:id
PATCH  /api/legislative/political-parties/:id
DELETE /api/legislative/political-parties/:id
CreatePoliticalPartyDto

Campos:

name
acronym
ideology
flagUrl

Regras:

name obrigatório
acronym obrigatório
ideology opcional
flagUrl opcional
acronym único por tenant
name único por tenant
ListPoliticalPartiesQueryDto

Permitir:

search
page
limit

Busca deve procurar por:

name
acronym
ideology

Sempre filtrar:

tenantId
isRemoved: false
RemovePoliticalPartyUseCase

Usar soft delete:

isRemoved: true,
removedAt: new Date(),

Não usar:

prisma.politicalParty.delete()

Antes de remover partido, verificar se há parlamentares ativos usando o partido.

Se houver, bloquear remoção com:

throw new BadRequestException(
  'Não é possível remover partido político vinculado a parlamentares ativos.',
);
Parliamentarians CRUD

Criar ou ajustar CRUD completo:

CreateParliamentarianUseCase
ListParliamentariansUseCase
GetParliamentarianByIdUseCase
UpdateParliamentarianUseCase
RemoveParliamentarianUseCase

Rotas:

POST   /api/legislative/parliamentarians
GET    /api/legislative/parliamentarians
GET    /api/legislative/parliamentarians/:id
PATCH  /api/legislative/parliamentarians/:id
DELETE /api/legislative/parliamentarians/:id
CreateParliamentarianDto

Campos:

tenantUserId
politicalPartyId
parliamentaryName
officeNumber
photoUrl
biography

Regras:

tenantUserId obrigatório
politicalPartyId opcional
parliamentaryName obrigatório
officeNumber opcional
photoUrl opcional
biography opcional
UpdateParliamentarianDto

Campos atualizáveis:

politicalPartyId
parliamentaryName
officeNumber
photoUrl
biography
status

Não permitir atualizar:

tenantId
tenantUserId
ListParliamentariansQueryDto

Permitir:

search
status
politicalPartyId
page
limit

Busca deve procurar por:

parliamentaryName
officeNumber
tenantUser.user.firstName
tenantUser.user.lastName
politicalParty.name
politicalParty.acronym

Sempre filtrar:

tenantId
isRemoved: false
Multi-tenancy

Toda query deve filtrar por:

tenantId
isRemoved: false

Nunca buscar entidade legislativa apenas por id.

Correto:

where: {
  id,
  tenantId,
  isRemoved: false,
}

Errado:

where: {
  id,
}

Nunca aceitar tenantId via:

body
query
params

O tenantId vem somente do JWT/decorator autorizado:

@TenantId() tenantId: string
Soft delete

Nunca usar:

prisma.<entity>.delete()

Usar:

isRemoved: true,
removedAt: new Date(),

Toda listagem deve ignorar removidos:

isRemoved: false
Camadas
Application

Contém:

controllers
dto
use-cases
view-models

Regras:

Controller não contém regra de negócio.
Controller apenas recebe HTTP input.
Controller valida DTO.
Controller chama UseCase.
UseCase orquestra fluxo.
UseCase usa contracts do domain.
UseCase não usa Prisma diretamente.
Domain

Contém:

entities
enums
repository contracts
domain services

Regras:

Domain não depende de Prisma.
Domain não depende de NestJS.
Domain não depende de HTTP.
Domain não conhece banco.
Infra

Contém:

Prisma repositories
ORM mapping

Regras:

Contratos ficam em domain/repositories.
Implementações ficam em infra/prisma.
Prisma só pode ser usado na infra.
DTOs

Todos os DTOs devem usar:

class-validator
class-transformer
Swagger decorators
ViewModels

Não retornar:

tenantId
isRemoved
removedAt
passwordHash
permissions bruto

No ParliamentarianViewModel, pode retornar dados resumidos do partido:

politicalParty: {
  id: string;
  name: string;
  acronym: string;
  flagUrl?: string;
}

Também pode retornar dados básicos do usuário:

user: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

Nunca retornar:

passwordHash
cpf, salvo endpoint administrativo específico
Permissões

Usar guards existentes do projeto.

Rotas de criação, edição e remoção devem exigir usuário com pelo menos uma das flags:

isTenantAdmin
isTenantStaff

Listagem e detalhe podem ser acessadas por usuários autenticados do tenant.

Não criar parlamentar se o executor não tiver permissão administrativa.

Atualizar LegislativeModule

Adicionar:

import { PoliticalPartiesModule } from './political-parties/political-parties.module';

E incluir em:

imports: [
  PoliticalPartiesModule,
  ParliamentariansModule,
]

Manter legislative.module.ts apenas como agregador.

Não colocar regra de negócio no módulo raiz.

Prisma migration

Antes de alterar migration:

Analisar schema atual.
Ver se já existe campo partyAcronym.
Ver se já existe Pessoa.
Ver se Parliamentarian já usa tenantUserId.
Gerar diff seguro.

Não usar:

npx prisma migrate reset

Se precisar migration:

npx prisma migrate dev --name add_political_parties_and_refactor_parliamentarians
npx prisma generate
Testes mínimos

Criar ou preparar testes para:

Political Parties:
- criar partido
- não permitir sigla duplicada no mesmo tenant
- permitir mesma sigla em tenants diferentes
- listar somente partidos do tenant
- soft delete
- não listar removidos
- bloquear remoção se houver parlamentar ativo vinculado

Parliamentarians:
- criar parlamentar para TenantUser com isParliamentarian = true
- bloquear criação se isParliamentarian = false
- bloquear duplicidade para o mesmo tenantUserId
- vincular partido político do mesmo tenant
- bloquear partido de outro tenant
- listar somente parlamentares do tenant
- soft delete
- não listar removidos
Checklist final obrigatório

Ao finalizar, reporte:

 src/legislative/political-parties foi criado.
 PoliticalPartiesModule foi criado.
 CRUD de partidos políticos foi criado.
 PoliticalParty tem id, name, acronym, ideology, flagUrl.
 PoliticalParty usa tenantId.
 PoliticalParty usa soft delete.
 PoliticalParty tem @@map("political_parties").
 Parliamentarian usa tenantUserId.
 Parliamentarian não usa pessoaId.
 Parliamentarian não usa userId direto.
 Parliamentarian usa politicalPartyId.
 partyAcronym solto foi removido ou marcado para migração.
 Só cria Parliamentarian se TenantUser.isParliamentarian = true.
 TenantUser permite múltiplas flags simultâneas.
 Nenhum enum único de role foi reintroduzido.
 permissions Json foi preservado.
 removedAt foi preservado.
 Soft delete foi respeitado.
 Nenhum prisma.delete() foi usado em entidade de negócio.
 Todas as queries usam tenantId.
 Nenhum tenantId vem de body/query/params.
 Prisma só foi usado na infra.
 Controllers não possuem regra de negócio.
 Use cases orquestram fluxo.
 Domain não depende de Prisma, NestJS ou HTTP.
 DTOs usam validação.
 DTOs usam Swagger decorators.
 ViewModels não expõem campos internos.
 Código está em inglês.
 Mensagens de erro estão em português brasileiro.
 Não implementei módulos fora do escopo da Task 3.

Essa task fecha a base correta para:

```txt
TenantUser → Parliamentarian → PoliticalParty