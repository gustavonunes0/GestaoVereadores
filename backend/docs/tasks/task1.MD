Você é um agente backend especialista em NestJS, Prisma, PostgreSQL, DDD, multi-tenancy e sistemas legislativos para Câmara de Vereadores.

Leia antes de alterar qualquer código:

- `.cursorrules`
- `docs/architecture/`
- `docs/specs/`
- `prisma/schema.prisma`

## Objetivo principal

Refatorar o backend módulo a módulo, reduzindo inconsistências, duplicidades e acoplamento.

A aplicação deve ser organizada como monolito modular com possibilidade futura de extração para microserviços.

Não implemente tudo de uma vez.

Trabalhe nesta ordem:

1. Analisar o schema atual.
2. Identificar inconsistências.
3. Criar plano de refatoração.
4. Refatorar primeiro Identity / Tenant Access.
5. Depois refatorar Legislativo módulo a módulo.

## Regra central de arquitetura

Organizar por:

- Module
- Bounded Context
- Domain Context

Nunca organizar globalmente assim:

```txt
src/controllers/
src/services/
src/repositories/
src/dto/

Organizar assim:

src/identidade/
src/legislative/

E dentro de cada domínio:

src/<domain>/<bounded-context>/
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
Separação desejada

Use esta estrutura de alto nível:

src/
├── identidade/
│   ├── users/
│   ├── tenants/
│   ├── tenant-users/
│   └── guest-users/
└── legislative/
    ├── legislative.module.ts
    ├── parliamentarians/
    ├── legislatures/
    ├── board/
    ├── committees/
    ├── fronts/
    ├── matters/
    ├── sessions/
    ├── voting/
    └── agenda/
Regras sobre User, TenantUser, Parliamentarian e GuestUser

Remover duplicidade conceitual entre:

User
Pessoa
Usuario
Parlamentar
TenantUser

A modelagem correta deve ser:

User
→ identidade global do sistema
→ login, senha, cpf, email, nome

TenantUser
→ vínculo entre User e Tenant
→ permissões e papéis dentro da Câmara

Parliamentarian
→ perfil legislativo de um TenantUser
→ só existe quando TenantUser.isParliamentarian = true

GuestUser
→ pessoa sem login obrigatório
→ convidado, cidadão, representante externo, autoridade, palestrante ou autor externo
Regra sobre Pessoa

Pessoa não deve ser usada no fluxo principal.

Não usar Pessoa para representar parlamentar.

Não duplicar dados de User em Pessoa.

Se existir Pessoa no schema atual, tratar como legado ou remover do fluxo principal.

Pessoa só poderá voltar no futuro se houver necessidade real, mas para este refactor usar GuestUser para externos sem login.

TenantUser

Refatorar TenantUser para ser o centro do acesso dentro do tenant.

Deve possuir:

isTenantAdmin     Boolean @default(false)
isTenantStaff     Boolean @default(false)
isParliamentarian Boolean @default(false)

Um mesmo TenantUser pode ter múltiplas flags verdadeiras.

Exemplos válidos:

isTenantAdmin = true
isTenantStaff = true
isParliamentarian = false

isTenantAdmin = true
isTenantStaff = false
isParliamentarian = true

isTenantAdmin = false
isTenantStaff = true
isParliamentarian = false

Não usar enum único para papel se isso impedir múltiplos papéis simultâneos.

Manter permissions Json para permissões granulares.

Modelo base desejado:

model TenantUser {
  id        String @id @default(uuid())
  tenantId  String
  userId    String

  tenant    Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  user      User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  isTenantAdmin     Boolean @default(false)
  isTenantStaff     Boolean @default(false)
  isParliamentarian Boolean @default(false)

  permissions Json @default("[]")

  status       TenantUserStatus @default(ACTIVE)
  lastAccessAt DateTime?

  createdAt  DateTime @default(now())
  createdBy  String?
  modifiedAt DateTime @updatedAt
  modifiedBy String?
  isRemoved  Boolean  @default(false)
  removedAt  DateTime?

  parliamentarian Parliamentarian?

  @@unique([tenantId, userId])
  @@index([tenantId])
  @@index([userId])
  @@index([tenantId, isTenantAdmin])
  @@index([tenantId, isTenantStaff])
  @@index([tenantId, isParliamentarian])
  @@index([tenantId, isRemoved])
  @@map("tenant_users")
}
Parliamentarian

Parliamentarian deve ser perfil legislativo de TenantUser.

Não deve ter pessoaId.

Não deve ter userId direto.

Deve ter:

tenantUserId String

com unicidade por tenant:

@@unique([tenantId, tenantUserId])

Modelo base desejado:

enum ParliamentarianStatus {
  ACTIVE
  INACTIVE
  LICENSED
  REMOVED
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

Regra de criação:

1. Receber tenantId somente pelo JWT/decorator.
2. Receber tenantUserId no body.
3. Validar que TenantUser existe no tenant atual.
4. Validar que TenantUser.isParliamentarian = true.
5. Validar que ainda não existe Parliamentarian para esse tenantUserId.
6. Criar Parliamentarian.

Mensagem de erro em português:

throw new BadRequestException(
  'Este usuário do tenant não está marcado como parlamentar.',
);
GuestUser

Criar GuestUser para pessoas externas sem login obrigatório.

Usos:

convidados
civis
representantes de entidade
autoridades externas
palestrantes
autores externos
participantes de audiência pública
procuradores

Não usar GuestUser para:

voto parlamentar
presença parlamentar
mandato
mesa diretora
membro oficial de comissão

Modelo base desejado:

enum GuestUserType {
  CITIZEN
  GUEST
  EXTERNAL_AUTHORITY
  ORGANIZATION_REPRESENTATIVE
  ATTORNEY
  SPEAKER
  EXTERNAL_AUTHOR
}

enum GuestUserStatus {
  ACTIVE
  INACTIVE
  BLOCKED
}

model GuestUser {
  id       String @id @default(uuid())
  tenantId String

  fullName String
  cpf      String?
  email    String?
  phone    String?

  type   GuestUserType   @default(CITIZEN)
  status GuestUserStatus @default(ACTIVE)

  organizationName String?
  positionName     String?
  notes            String?

  isRemoved Boolean   @default(false)
  removedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id])

  @@unique([tenantId, cpf])
  @@index([tenantId])
  @@index([tenantId, type])
  @@index([tenantId, status])
  @@index([tenantId, isRemoved])
  @@map("guest_users")
}

Atenção: como cpf pode ser nulo, avalie a melhor estratégia no PostgreSQL/Prisma para evitar problemas de unicidade com valores nulos.

Multi-tenancy

Toda entidade de negócio deve ter tenantId.

Nunca aceitar tenantId via:

body
query
params

O tenantId deve vir somente do JWT/decorator autorizado:

@TenantId() tenantId: string

Toda query de entidade de negócio deve filtrar por:

tenantId
isRemoved: false

Nunca buscar entidade de negócio apenas por id.

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
Soft delete

Nunca usar:

prisma.<entity>.delete()

Usar:

isRemoved: true,
removedAt: new Date(),

Toda listagem deve ignorar removidos:

isRemoved: false
Campos genéricos indevidos

Remover campos genéricos de entidades onde não fazem sentido, como:

cnpj
logo
settings_json

Esses campos pertencem ao Tenant, não a entidades como:

Materia
Autor
TipoMateria
Norma
SessaoPlenaria
PautaItem
PresencaSessao
Comissao
CargoMesa

Cada entidade deve ter campos próprios do negócio.

Fluxo real da Câmara de Vereadores

O modelo deve refletir este fluxo:

1. Criar Tenant da Câmara.
2. Criar Users.
3. Vincular Users ao Tenant como TenantUser.
4. Marcar TenantUser como admin, staff e/ou parlamentar.
5. Criar Parliamentarian para TenantUser parlamentar.
6. Criar Legislature.
7. Criar ParliamentarianMandate.
8. Criar Mesa Diretora.
9. Criar Comissões.
10. Criar Frentes Parlamentares.
11. Protocolar Matéria Legislativa.
12. Definir autores, coautores e relator.
13. Tramitar Matéria.
14. Criar Sessão Plenária.
15. Adicionar Matéria à pauta.
16. Registrar presença dos parlamentares.
17. Abrir votação da pauta.
18. Registrar voto individual.
19. Calcular resultado.
20. Atualizar resultado da pauta.
21. Atualizar status da matéria.
22. Se aprovada e aplicável, gerar Norma.
Módulo Legislativo

Separar por bounded context:

src/legislative/
├── parliamentarians/
├── legislatures/
├── board/
├── committees/
├── fronts/
├── matters/
├── sessions/
├── voting/
└── agenda/

Não colocar toda regra dentro de:

src/legislative/domain/
src/legislative/services/
src/legislative/repositories/

legislative.module.ts deve ser apenas agregador de módulos.

Relações principais do Legislativo

Usar esta visão conceitual:

Tenant
  └── TenantUser
        └── Parliamentarian
              └── ParliamentarianMandate
                    └── Legislature
Legislature
  └── LegislativeSession
Legislature
  └── Board
        └── BoardMember
              ├── Parliamentarian
              └── BoardRole
Committee
  └── CommitteeMember
        ├── Parliamentarian
        └── CommitteeRole
LegislativeMatter
  ├── MatterType
  ├── MatterAuthor
  ├── MatterCoauthor
  ├── MatterRapporteur
  └── MatterProcedureStep
PlenarySession
  ├── AgendaItem
  │     └── LegislativeMatter
  ├── SessionAttendance
  │     └── Parliamentarian
  └── Voting
        └── LegislativeVote
              └── Parliamentarian
Votação

A votação deve seguir:

PlenarySession
  └── AgendaItem
        └── Voting
              └── LegislativeVote[]

Regras:

1. Só pode votar matéria que está em pauta.
2. Só pode criar votação para AgendaItem existente.
3. No MVP, um AgendaItem pode ter no máximo uma votação principal.
4. Um parlamentar só pode votar uma vez por votação.
5. O parlamentar precisa pertencer ao tenant.
6. O parlamentar precisa ter mandato ativo na legislatura da sessão.
7. Opcionalmente, o parlamentar precisa estar presente na sessão.
8. Resultado da votação deve ser calculado a partir dos votos.
9. Resultado deve atualizar o AgendaItem.
10. Resultado pode atualizar o status da LegislativeMatter.
Ordem segura de implementação

Não refatorar tudo de uma vez.

Seguir esta ordem:

Fase 1 — Identity / Tenant Access
- User
- Tenant
- TenantUser
- GuestUser
- Remover Pessoa do fluxo principal
- Ajustar flags isTenantAdmin, isTenantStaff, isParliamentarian

Fase 2 — Parliamentarians
- Parliamentarian
- ParliamentarianMandate
- vínculo obrigatório com TenantUser

Fase 3 — Legislatures
- Legislature
- LegislativeSession

Fase 4 — Board
- Board
- BoardRole
- BoardMember

Fase 5 — Committees
- Committee
- CommitteeRole
- CommitteeMember

Fase 6 — Fronts
- ParliamentaryFront
- ParliamentaryFrontMember

Fase 7 — Matters
- LegislativeMatter
- MatterType
- MatterAuthor
- MatterCoauthor
- MatterRapporteur
- MatterProcedureStep

Fase 8 — Sessions
- PlenarySession
- SessionType
- SessionStatus
- AgendaItem
- SessionAttendance

Fase 9 — Voting
- Voting
- LegislativeVote
- VotingResult calculation

Fase 10 — Norms
- LegalNorm

Fase 11 — Agenda
- LegislativeAgendaEvent
- AgendaParticipant
Camadas
Application

Deve conter:

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
UseCase usa contratos do domínio.
UseCase não usa Prisma diretamente.
Domain

Deve conter:

entities
enums
repository contracts
domain services
factories
builders
facades

Regras:

Domain não depende de Prisma.
Domain não depende de NestJS.
Domain não depende de HTTP.
Domain não conhece banco.
Domain não conhece serviços externos diretamente.
Infra

Deve conter:

Prisma repositories
ORM mapping
External integrations
Providers técnicos

Regras:

Contratos ficam em domain/repositories.
Implementações ficam em infra/prisma ou infra/repositories.
Prisma só pode ser usado na infra.
CRUD padrão

Para CRUDs, usar:

Create<Entity>UseCase
List<Entities>UseCase
Get<Entity>ByIdUseCase
Update<Entity>UseCase
Remove<Entity>UseCase

Exemplo:

create-parliamentarian.use-case.ts
list-parliamentarians.use-case.ts
get-parliamentarian-by-id.use-case.ts
update-parliamentarian.use-case.ts
remove-parliamentarian.use-case.ts
Convenções de código

Código sempre em inglês.

Correto:

CreateParliamentarianUseCase
TenantUserRepository
GuestUserViewModel

Errado:

CriarParlamentarUseCase
RepositorioUsuarioTenant
ModeloConvidado

Mensagens de erro em português brasileiro:

throw new NotFoundException('Parlamentar não encontrado');
throw new BadRequestException('Este usuário do tenant não está marcado como parlamentar.');
DTOs

Todos os DTOs devem usar:

class-validator
class-transformer
Swagger decorators

Não expor entidades Prisma diretamente em resposta HTTP.

Sempre usar ViewModels.

ViewModels não devem retornar:

passwordHash
tenantId, quando não for necessário
isRemoved
removedAt
settings bruto
permissions bruto, salvo endpoint administrativo
Prisma e migrations

Antes de alterar o schema:

Analise os models existentes.
Liste conflitos.
Proponha diff.
Só depois aplique alterações.

Não rodar comandos destrutivos.

Não apagar dados sem plano de migração.

Não usar prisma migrate reset.

Se criar migration:

npx prisma migrate dev --name refactor_identity_tenant_users_guest_users
npx prisma generate
Entrega esperada nesta execução

Nesta primeira execução, foque somente na Fase 1:

Identity / Tenant Access

Implementar ou ajustar:

src/identidade/users/
src/identidade/tenants/
src/identidade/tenant-users/
src/identidade/guest-users/

E no Prisma:

User
Tenant
TenantUser
GuestUser
GuestUserType
GuestUserStatus
TenantUserStatus

Não implementar ainda:

parliamentarians
legislatures
board
committees
fronts
matters
sessions
voting
agenda

Apenas preparar a base para eles.

Checklist final obrigatório

Ao finalizar, reporte:

 Analisei o schema atual antes de alterar.
 Identifiquei duplicidades entre User, Pessoa, TenantUser e Parlamentar.
 Não usei Pessoa no fluxo principal.
 TenantUser virou o vínculo central do usuário no tenant.
 TenantUser possui isTenantAdmin.
 TenantUser possui isTenantStaff.
 TenantUser possui isParliamentarian.
 TenantUser permite múltiplas flags verdadeiras.
 GuestUser foi criado para pessoas externas sem login.
 GuestUser não substitui User.
 GuestUser não substitui Parliamentarian.
 Parliamentarian continuará sendo perfil de TenantUser.
 Toda entidade de negócio usa tenantId.
 Nenhum tenantId é aceito via body/query/params.
 Soft delete foi mantido.
 Nenhum prisma.delete foi usado em entidade de negócio.
 Prisma ficou somente na infra.
 Controllers não têm regra de negócio.
 Use cases orquestram fluxo.
 Domain não depende de NestJS, HTTP ou Prisma.
 Código está em inglês.
 Mensagens de erro estão em português.
 Não refatorei módulos legislativos fora da Fase 1.

Execute a Fase 1 diretamente no backend, mantendo compatibilidade com o padrão atual do projeto.