Você é um agente backend especialista em NestJS, Prisma, PostgreSQL, DDD, multi-tenancy e sistemas legislativos para Câmara de Vereadores.

Leia antes de alterar qualquer código:

- `.cursorrules`
- `docs/architecture/`
- `docs/specs/`
- `prisma/schema.prisma`

## Contexto

A Task 1 já definiu a base de identidade:

```txt
User
Tenant
TenantUser
GuestUser

Agora execute a Task 2, criando a base do domínio legislativo.

O schema atual contém entidades legislativas como Parlamentar, Legislatura, Comissão, Frente Parlamentar, Matéria, Sessão Plenária, Pauta, Presença e Votação, mas existem inconsistências e duplicidades que devem ser corrigidas módulo a módulo. Use o schema atual apenas como referência, não como verdade absoluta.

Objetivo da Task 2

Criar a estrutura base do domínio:

src/legislative/
├── legislative.module.ts
├── parliamentarians/
├── legislatures/
├── committees/
├── board/
├── fronts/
├── matters/
├── sessions/
├── voting/
└── agenda/

Nesta task, não implemente todos os CRUDs ainda.

Apenas:

Criar a estrutura modular correta.
Criar legislative.module.ts como módulo agregador.
Criar os módulos internos.
Preparar parliamentarians e legislatures como primeiros contextos reais.
Não implementar committees, board, fronts, matters, sessions, voting e agenda além do módulo vazio/base.
Regra principal

src/legislative/ deve ser um domínio agregador.

Não colocar regra de negócio diretamente em:

src/legislative/domain/
src/legislative/services/
src/legislative/repositories/

Cada submódulo deve ser um bounded context independente.

Correto:

src/legislative/parliamentarians/domain/
src/legislative/legislatures/domain/
src/legislative/committees/domain/

Errado:

src/legislative/domain/
src/legislative/services/
src/legislative/repositories/
Estrutura obrigatória por submódulo

Cada bounded context deve seguir:

src/legislative/<bounded-context>/
├── <bounded-context>.module.ts
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

Crie essa estrutura para:

parliamentarians
legislatures
committees
board
fronts
matters
sessions
voting
agenda
Módulo agregador

Criar:

src/legislative/legislative.module.ts

Ele deve importar os módulos internos:

import { Module } from '@nestjs/common';
import { ParliamentariansModule } from './parliamentarians/parliamentarians.module';
import { LegislaturesModule } from './legislatures/legislatures.module';
import { CommitteesModule } from './committees/committees.module';
import { BoardModule } from './board/board.module';
import { FrontsModule } from './fronts/fronts.module';
import { MattersModule } from './matters/matters.module';
import { SessionsModule } from './sessions/sessions.module';
import { VotingModule } from './voting/voting.module';
import { AgendaModule } from './agenda/agenda.module';

@Module({
  imports: [
    ParliamentariansModule,
    LegislaturesModule,
    CommitteesModule,
    BoardModule,
    FrontsModule,
    MattersModule,
    SessionsModule,
    VotingModule,
    AgendaModule,
  ],
})
export class LegislativeModule {}

Depois registrar LegislativeModule no módulo principal da aplicação, respeitando o padrão atual do projeto.

Parliamentarians

Preparar este contexto para implementação real.

Estrutura esperada:

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
Regra de Parliamentarian

Parliamentarian deve ser perfil legislativo de TenantUser.

Não usar:

pessoaId
userId direto

Usar:

tenantUserId obrigatório

Regra:

Só pode criar Parliamentarian se TenantUser.isParliamentarian = true.

Validações obrigatórias:

1. tenantId vem somente do JWT/decorator.
2. tenantUserId vem no body.
3. TenantUser deve existir no tenant atual.
4. TenantUser.isParliamentarian deve ser true.
5. Não pode existir outro Parliamentarian para o mesmo tenantUserId no mesmo tenant.
Legislatures

Preparar este contexto para implementação real.

Estrutura esperada:

src/legislative/legislatures/
├── legislatures.module.ts
├── application/
│   ├── controllers/
│   │   └── legislatures.controller.ts
│   ├── dto/
│   │   ├── create-legislature.dto.ts
│   │   ├── update-legislature.dto.ts
│   │   └── list-legislatures-query.dto.ts
│   ├── use-cases/
│   │   ├── create-legislature.use-case.ts
│   │   ├── list-legislatures.use-case.ts
│   │   ├── get-legislature-by-id.use-case.ts
│   │   ├── update-legislature.use-case.ts
│   │   └── remove-legislature.use-case.ts
│   └── view-models/
│       └── legislature.view-model.ts
├── domain/
│   ├── entities/
│   │   └── legislature.entity.ts
│   ├── repositories/
│   │   └── legislature.repository.ts
│   └── services/
│       └── legislature-domain.service.ts
└── infra/
    └── prisma/
        └── prisma-legislature.repository.ts
Regra de Legislature

Legislature representa o período legislativo.

Exemplo:

2021-2024
2025-2028

Campos mínimos esperados:

id
tenantId
number
startDate
endDate
isCurrent
isRemoved
removedAt
createdAt
updatedAt

Regras:

1. Toda legislatura pertence a um tenant.
2. Não pode haver duas legislaturas com o mesmo number no mesmo tenant.
3. Apenas uma legislatura pode estar marcada como isCurrent por tenant.
4. Não remover fisicamente.
5. Usar soft delete.
Prisma

Nesta task, apenas ajustar ou preparar os models necessários para:

Parliamentarian
ParliamentarianMandate
Legislature

Não refatorar ainda:

Committee
Board
Front
Matter
Session
Voting
Agenda

Esses ficam para próximas tasks.

Modelo base desejado:

enum ParliamentarianStatus {
  ACTIVE
  INACTIVE
  LICENSED
  REMOVED
}

enum MandateStatus {
  ACTIVE
  FINISHED
  INTERRUPTED
  LICENSED
}

model Parliamentarian {
  id           String @id @default(uuid())
  tenantId     String
  tenantUserId String

  parliamentaryName String
  partyAcronym      String?
  officeNumber      String?
  photoUrl          String?
  biography         String?

  status ParliamentarianStatus @default(ACTIVE)

  isRemoved Boolean   @default(false)
  removedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tenant     Tenant     @relation(fields: [tenantId], references: [id])
  tenantUser TenantUser @relation(fields: [tenantUserId], references: [id])

  mandates ParliamentarianMandate[]

  @@unique([tenantId, tenantUserId])
  @@index([tenantId, status])
  @@index([tenantId, isRemoved])
  @@map("parliamentarians")
}

model Legislature {
  id        String @id @default(uuid())
  tenantId  String

  number    Int
  startDate DateTime
  endDate   DateTime?
  isCurrent Boolean @default(false)

  isRemoved Boolean   @default(false)
  removedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id])

  mandates ParliamentarianMandate[]

  @@unique([tenantId, number])
  @@index([tenantId])
  @@index([tenantId, isCurrent])
  @@index([tenantId, isRemoved])
  @@map("legislatures")
}

model ParliamentarianMandate {
  id                String @id @default(uuid())
  tenantId          String
  parliamentarianId String
  legislatureId     String

  partyAcronym String?
  partyName    String?

  startedAt DateTime
  endedAt   DateTime?
  status    MandateStatus @default(ACTIVE)

  isRemoved Boolean   @default(false)
  removedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tenant          Tenant          @relation(fields: [tenantId], references: [id])
  parliamentarian Parliamentarian @relation(fields: [parliamentarianId], references: [id])
  legislature     Legislature     @relation(fields: [legislatureId], references: [id])

  @@unique([tenantId, parliamentarianId, legislatureId])
  @@index([tenantId, parliamentarianId])
  @@index([tenantId, legislatureId])
  @@index([tenantId, status])
  @@index([tenantId, isRemoved])
  @@map("parliamentarian_mandates")
}
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

Nunca aceitar tenantId via body, query ou params.

O tenantId vem somente do JWT/decorator autorizado:

@TenantId() tenantId: string
Soft delete

Nunca usar:

prisma.<entity>.delete()

Usar:

isRemoved: true,
removedAt: new Date(),
Convenções

Código sempre em inglês.

Mensagens de erro sempre em português brasileiro.

Exemplos:

throw new NotFoundException('Parlamentar não encontrado');
throw new NotFoundException('Legislatura não encontrada');
throw new BadRequestException('Este usuário do tenant não está marcado como parlamentar.');
DTOs

Todos os DTOs devem usar:

class-validator
class-transformer
Swagger decorators
ViewModels

Não retornar campos internos:

tenantId
isRemoved
removedAt
Entrega esperada nesta task

Ao finalizar, deve existir:

src/legislative/
├── legislative.module.ts
├── parliamentarians/
├── legislatures/
├── committees/
├── board/
├── fronts/
├── matters/
├── sessions/
├── voting/
└── agenda/

Com:

parliamentarians
→ estrutura completa preparada
→ CRUD base se seguro implementar
→ repository contract
→ prisma repository
→ DTOs
→ ViewModel
→ use cases

legislatures
→ estrutura completa preparada
→ CRUD base se seguro implementar
→ repository contract
→ prisma repository
→ DTOs
→ ViewModel
→ use cases

demais módulos
→ apenas estrutura e module.ts base
Não fazer nesta task

Não implementar ainda:

committees CRUD
board CRUD
fronts CRUD
matters CRUD
sessions CRUD
voting CRUD
agenda CRUD

Não criar regras de votação ainda.

Não criar regra de tramitação de matéria ainda.

Não mover tudo de uma vez.

Checklist final obrigatório

Ao finalizar, reporte:

 src/legislative/ foi criado.
 legislative.module.ts foi criado como agregador.
 parliamentarians foi criado como bounded context.
 legislatures foi criado como bounded context.
 committees foi criado como bounded context base.
 board foi criado como bounded context base.
 fronts foi criado como bounded context base.
 matters foi criado como bounded context base.
 sessions foi criado como bounded context base.
 voting foi criado como bounded context base.
 agenda foi criado como bounded context base.
 Não existe regra de negócio em src/legislative/ raiz.
 Parliamentarian usa tenantUserId.
 Parliamentarian não usa pessoaId.
 Parliamentarian não usa userId direto.
 Legislature usa tenantId.
 Queries usam tenantId.
 Queries ignoram isRemoved: true.
 Soft delete foi respeitado.
 Prisma só foi usado na infra.
 Controllers não têm regra de negócio.
 Use cases orquestram fluxo.
 Domain não depende de NestJS, HTTP ou Prisma.
 Código está em inglês.
 Mensagens de erro estão em português brasileiro.
 Não implementei módulos fora do escopo desta task.