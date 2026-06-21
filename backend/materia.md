# Matéria — Módulo Legislativo

Documentação completa do submódulo `src/legislativo/materias/`.

| Item | Valor |
|------|-------|
| API prefix | `/api/legislative/materias` |
| Spec | `docs/specs/materias/SPEC-001-materias.md` |
| Task | `docs/tasks/TASK-001b-materias.md` |
| Controller | `application/controllers/materias.controller.ts` |
| View model | `application/view-models/matter.view-model.ts` |

---

## 1. Visão geral

Matéria legislativa é o núcleo do processo: proposição com ementa, tipo, numeração, autoria, tramitação de status, publicações oficiais e vínculo com pauta, votação e normas.

Fluxo DDD:

```
controller -> use-case -> domain service -> repository (Prisma)
```

**Regras absolutas do projeto:**
- `tenantId` vem do JWT (`@CurrentTenant()`), nunca do body/query/params
- Queries filtram `{ tenantId, isRemoved: false }`
- Soft delete apenas (nunca `prisma.delete`)
- Domain layer não importa `@prisma/client` nem `@nestjs/*`
- `tramitacaoJson` é legado — código novo usa `TramitacaoHistorico`
- Status só muda via tramitação (use cases dedicados), não via PATCH genérico
- View models não expõem: `tenantId`, `isRemoved`, `removedAt`, `tramitacaoJson`
- Mensagens de erro em português brasileiro


## 2. Estrutura de pastas

```
src/legislativo/materias/
├── application/
│   ├── controllers/     materias.controller.ts
│   ├── dto/             CreateMateriaDto, UpdateMateriaDto, TramitarMateriaDto...
│   ├── errors/          matter.errors.ts
│   ├── use-cases/       24 use cases
│   └── view-models/     matter.view-model.ts, matter-authorship.view-model.ts
├── domain/
│   ├── enums/           matter-status.enum.ts, matter-tramitation-action.enum.ts
│   ├── repositories/    materia.repository.ts (contrato abstrato)
│   ├── services/        legislative-matter-domain.service.ts, autor-resolver...
│   └── types/           matter-workflow.types.ts
├── infra/prisma/        prisma-materia.repository.ts
├── materias.module.ts
└── materias.tokens.ts
```


## 3. Schema Prisma (model Materia)

Campos principais em `prisma/schema.prisma`:

| Campo | Notas |
|-------|-------|
| id, tenantId | PK e isolamento multi-tenant |
| tipoId | FK TipoMateria |
| ementa | obrigatória (min 3 caracteres no domain) |
| numero, anoId | identificação formal (opcionais) |
| numeroProtocolo | protocolo interno |
| status | StatusMateria, default DRAFT |
| sigla | copiada do TipoMateria na criação |
| autorId | FK Autor (relação AutorMateria) |
| authorParliamentarianId | modelo novo (Parliamentarian) |
| rapporteurParliamentarianId | relator |
| primeiroAutorId, relatorId | legado PT (Parlamentar) |
| textoOriginalUrl, textoIntegralUrl, audioUrl | midia |
| tramitacaoJson | **LEGADO** — não usar em código novo |
| isRemoved, removedAt | soft delete |
| @@unique | [tenantId, tipoId, numero, anoId] |

**Relações:** tipo, ano, autor, coautores (MatterCoauthor + MateriaCoautor legado), tramitacaoHistorico, publicacoesOficiais, pautaItens, normas, materiaAutores.

**Models relacionados:**
- `Autor` — autoria polimórfica: `parliamentarianId` ou `tenantPartnerId`
- `TramitacaoHistorico` — histórico append-only e auditável
- `PublicacaoOficial` — publicação em veículo oficial
- `MatterCoauthor` — coautores (parliamentarianId + ordem)
- `TipoMateria` — nome, sigla, ordem


## 4. Status e workflow

Enum `StatusMateria` / `MatterStatus`:

| Valor | Label API | Descricao |
|-------|-----------|-----------|
| DRAFT | Rascunho | cadastro inicial |
| PROTOCOLADA | Protocolada | protocolo formal |
| EM_TRAMITACAO | Em tramitação | análise em comissões/unidades |
| EM_PAUTA | Em pauta | incluída em sessão |
| APROVADA | Aprovada | resultado favorável |
| REJEITADA | Rejeitada | resultado desfavorável |
| ARQUIVADA | Arquivada | encerrada sem deliberação |
| RETIRADA | Retirada | retirada de tramitação |
| TRANSFORMADA_EM_NORMA | Transformada em norma | virou norma jurídica |

### Transições (TramitarMateriaUseCase)

```
DRAFT -> PROTOCOLADA
PROTOCOLADA -> EM_TRAMITACAO
EM_TRAMITACAO -> EM_PAUTA | ARQUIVADA | RETIRADA
EM_PAUTA -> APROVADA | REJEITADA | EM_TRAMITACAO
APROVADA -> TRANSFORMADA_EM_NORMA
```

Despacho obrigatório ao transitar para: `EM_TRAMITACAO`, `APROVADA`, `REJEITADA`.

Existe também `ExecuteMatterTramitationUseCase` com ações explícitas (`MatterTramitationAction`).

### Capabilities (LegislativeMatterDomainService)

| Capability | Condição |
|------------|----------|
| canTramitate | PROTOCOLADA ou EM_TRAMITACAO |
| canEnterAgenda | EM_TRAMITACAO |
| canBeVoted | EM_TRAMITACAO ou EM_PAUTA |
| canGenerateNorm | APROVADA |

**Nota produto (pauta):** o módulo `sessoes-plenarias` não exige mais `EM_TRAMITACAO` para adicionar item na pauta. O core do sistema é votação; o domain ainda expõe `assertCanEnterAgenda` para outros consumidores.


## 5. API REST

Guards: `JwtAuthGuard`, `TenantGuard` em todas as rotas.

### CRUD e listagem

| Metodo | Rota | Use case |
|--------|------|----------|
| GET | `/` | ListMateriasUseCase |
| GET | `/minhas` | ListMinhasMateriasUseCase |
| GET | `/:id` | GetMateriaByIdUseCase |
| POST | `/` | CreateMateriaUseCase |
| PATCH | `/:id` | UpdateMateriaUseCase |
| DELETE | `/:id` | RemoveMateriaUseCase |

Query listagem: `page`, `limit`, `search`, `status`, `tipoId`, `anoId`.

### Workflow e tramitação

| Metodo | Rota | Use case |
|--------|------|----------|
| GET | `/statuses` | ListMatterStatusesUseCase |
| GET | `/:id/workflow` | GetMatterWorkflowUseCase |
| GET | `/:id/tramitacao/acoes` | ListMatterTramitationActionsUseCase |
| POST | `/:id/tramitacao` | TramitarMateriaUseCase |
| POST | `/:id/tramitacao/executar` | ExecuteMatterTramitationUseCase |

### Autoria

| Metodo | Rota | Use case |
|--------|------|----------|
| GET | `/:id/autoria` | GetMatterAuthorshipUseCase |
| GET | `/autores/opcoes` | ListMatterAuthorOptionsUseCase |
| GET | `/autores-externos` | ListAutoresExternosUseCase |
| POST | `/:id/autores` | AddMateriaAutorUseCase |
| DELETE | `/:id/autores/:autorId` | RemoveMateriaAutorUseCase |
| PUT | `/:id/autor-parlamentar` | SetMatterAutorParlamentarUseCase |
| PUT | `/:id/autor-externo` | SetMatterAutorExternoUseCase |
| PUT | `/:id/relator` | SetMatterRelatorUseCase |
| POST | `/:id/coautores` | ManageMatterCoauthorsUseCase (add) |
| DELETE | `/:id/coautores/:parliamentarianId` | ManageMatterCoauthorsUseCase (remove) |

### Publicação e arquivos

| Metodo | Rota | Use case |
|--------|------|----------|
| POST | `/:id/publicacoes` | AddPublicacaoMateriaUseCase |
| POST | `/:id/texto-original` | UploadMatterTextoOriginalUseCase |

### Sem rota HTTP

- `AlterarStatusMateriaUseCase` — uso interno via repository; PATCH bloqueia mudança de status (`MatterStatusChangeViaUpdateNotAllowedError`).


## 6. View model HTTP (MatterViewModel)

Resposta canônica via `MatterViewModel.toHttp()`:

```json
{
  "id": "uuid",
  "identificacao": {
    "sigla": "PL",
    "numero": 1,
    "ano": 2026,
    "rotulo": "PL 1/2026",
    "numeroProtocolo": null
  },
  "tipo": { "id": "...", "nome": "Projeto de Lei", "sigla": "PL" },
  "ementa": "...",
  "status": { "value": "DRAFT", "label": "Rascunho" },
  "authorship": { "autor": {}, "coautores": [], "relator": null },
  "workflow": {
    "canTramitate": false,
    "canEnterAgenda": false,
    "canBeVoted": false,
    "canGenerateNorm": false,
    "tramitacaoHistorico": []
  },
  "publicacoes": [],
  "textoOriginalUrl": null,
  "createdAt": "...",
  "updatedAt": "..."
}
```

Em `sessoes-plenarias`, `PautaItemViewModel` expõe slice reduzida (`tipo`, `ementa`, `numero`, `ano`). Alinhar com `buildIdentificacao` evita divergência FE/BE.

Campos nunca expostos: `tenantId`, `isRemoved`, `removedAt`, `tramitacaoJson`.


## 7. Criação de matéria (CreateMateriaUseCase)

1. Valida `tenantId` e `ementa` (min 3 caracteres)
2. Autor obrigatório: `authorParliamentarianId` ou `tenantPartnerId` (não ambos)
3. Usuário parlamentar logado: força `authorParliamentarianId` do JWT
4. Opcional: `coautorIds`, `relatoresIds`, `tipoId`, campos de publicação
5. Status inicial `DRAFT`
6. Registro inicial em `TramitacaoHistorico`
7. Retorna `MatterViewModel.toHttp()`


## 8. Erros de aplicação (`matter.errors.ts`)

| Classe | Mensagem típica |
|--------|-----------------|
| MatterNotFoundError | Matéria não encontrada |
| MatterEmentaRequiredError | Ementa obrigatória |
| MatterInvalidStatusTransitionError | Transição inválida |
| MatterCannotEnterAgendaError | Somente EM_TRAMITACAO na pauta (domain) |
| MatterCannotGenerateNormError | Norma só de APROVADA |
| MatterAuthorshipValidationError | Regras de autor/coautor |
| MatterStatusChangeViaUpdateNotAllowedError | Status só via tramitação |
| MatterTramitationActionNotAllowedError | Ação não permitida |
| ParliamentarianNotFoundForMatterError | Parlamentar não encontrado |
| TenantPartnerNotFoundForMatterError | Parceiro externo não encontrado |
| MatterCoauthorAlreadyExistsError | Coautor duplicado |
| MatterCoauthorNotFoundError | Coautor nao encontrado |
| TipoAutorNotFoundForMatterError | Tipo de autor nao configurado |


## 9. Integrações

| Módulo | Relação |
|--------|---------|
| sessoes-plenarias | `PautaItem.materiaId`; qualquer matéria do tenant pode entrar na pauta |
| votacoes | `mapVoteResultToStatus` -> APROVADA/REJEITADA |
| normas | `assertCanGenerateNorm` — só APROVADA |
| parlamentares | Autor, coautor, relator |
| identidade/tenant-partners | Autor externo |
| comissoes | `MATTER_COMMITTEE_OPINION_GATE` (DI parecer) |

---

## 10. Tokens e DI

```typescript
export const MATERIA_REPOSITORY = Symbol('MATERIA_REPOSITORY');
export const MATTER_COMMITTEE_OPINION_GATE = Symbol('MATTER_COMMITTEE_OPINION_GATE');
```

Provider: `PrismaMateriaRepository` -> `MATERIA_REPOSITORY`.

---

## 11. Lista de use cases

| Arquivo | Responsabilidade |
|---------|------------------|
| create-materia.use-case.ts | Criar matéria |
| update-materia.use-case.ts | Atualizar campos (sem status) |
| remove-materia.use-case.ts | Soft delete |
| get-materia-by-id.use-case.ts | Detalhe |
| list-materias.use-case.ts | Listagem paginada |
| list-minhas-materias.use-case.ts | Matérias do parlamentar logado |
| tramitar-materia.use-case.ts | Transição de status + histórico |
| execute-matter-tramitation.use-case.ts | Tramitação por ação |
| get-matter-workflow.use-case.ts | Capabilities + histórico |
| list-matter-statuses.use-case.ts | Enum com labels |
| list-matter-tramitation-actions.use-case.ts | Ações disponíveis |
| alterar-status-materia.use-case.ts | Interno (sem HTTP) |
| get-matter-authorship.use-case.ts | Autoria completa |
| add/remove-materia-autor.use-case.ts | Autores adicionais |
| set-matter-autor-parlamentar.use-case.ts | Definir autor parlamentar |
| set-matter-autor-externo.use-case.ts | Definir autor externo |
| set-matter-relator.use-case.ts | Definir relator |
| manage-matter-coauthors.use-case.ts | Coautores |
| list-matter-author-options.use-case.ts | Opcoes para select |
| list-autores-externos.use-case.ts | Parceiros externos |
| add-publicacao-materia.use-case.ts | Publicação oficial |
| upload-matter-texto-original.use-case.ts | Upload PDF/texto |


## 12. Testes

```bash
cd backend
npx jest --testPathPattern=legislativo/materias
npx tsc --noEmit
```

Specs: `matter-workflow.use-case.spec.ts`, `matter-authorship.use-case.spec.ts`, `tramitar-materia.use-case.spec.ts`, `autor-resolver.service.spec.ts`.

---

## 13. Legado e pendências

| Item | Estado |
|------|--------|
| tramitacaoJson | legado; usar TramitacaoHistorico |
| Parlamentar / primeiroAutorId / relatorId | legado PT |
| MateriaCoautor | legado; preferir MatterCoauthor |
| GuestUser em Autor | removido; usar TenantPartner |
| Unificar nested materia na pauta com MatterViewModel | melhoria sugerida |

---

## 14. Domain services

| Service | Papel |
|---------|-------|
| LegislativeMatterDomainService | Regras base, capabilities, transições |
| MatterTramitationDomainService | Ações e regras de tramitação |
| MatterAuthorshipDomainService | Validação de autoria |
| AutorResolverService | Resolve autor parlamentar/externo |
