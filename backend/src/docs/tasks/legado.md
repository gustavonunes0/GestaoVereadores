# legado.md — Análise TASK-11 (modelos/campos legados)

> Somente análise. Nenhum model, campo, índice ou linha de código foi removido ou alterado
> nesta tarefa — em conformidade com a regra 6 do CLAUDE.md ("Nunca remover models legados").
> Objetivo: mapear uso real de cada model/campo legado e registrar inconsistências ("errors")
> encontradas durante a auditoria.

Metodologia: contagem de referências (`prisma.<model>.`) no código TypeScript de `backend/src`,
mais leitura direta dos repositórios/use-cases envolvidos para confirmar se o uso é real
(create/update) ou só leitura/relacionamento.

---

## 1. Achados críticos (erros funcionais reais)

### 1.1 `TramitacaoHistorico` nunca é lido — dois caminhos divergentes de tramitação de Matéria

**Severidade: alta.** Existem hoje **três** mecanismos diferentes que alteram o `status` de uma
`Materia`, e eles não escrevem no mesmo lugar:

| Caminho | Endpoint / chamador | Onde grava o histórico |
|---|---|---|
| `MateriaRepository.tramitar()` | `TramitarMateriaUseCase` → `POST /materias/:id/tramitar` ([tramitar-materia.use-case.ts:84](../../../src/legislativo/materias/application/use-cases/tramitar-materia.use-case.ts#L84)) | `TramitacaoHistorico` (transação correta — [prisma-materia.repository.ts:880-908](../../../src/legislativo/materias/infra/prisma/prisma-materia.repository.ts#L880-L908)) |
| `MateriaRepository.tramitarMateria()` | `ExecuteMatterTramitationUseCase` → `POST /materias/:id/tramitacao` ([materias.controller.ts:353-364](../../../src/legislativo/materias/application/controllers/materias.controller.ts#L353-L364)) | só `tramitacaoJson` ([prisma-materia.repository.ts:508-544](../../../src/legislativo/materias/infra/prisma/prisma-materia.repository.ts#L508-L544)) |
| `MateriaRepository.alterarStatus()` | `AlterarStatusMateriaUseCase` | só `tramitacaoJson` ([prisma-materia.repository.ts:552-576](../../../src/legislativo/materias/infra/prisma/prisma-materia.repository.ts#L552-L576)) |

Além disso, mudanças de status disparadas como **efeito colateral de sessão/votação** também
passam por `tramitarMateria()` (só `tramitacaoJson`):
[prisma-sessao-plenaria.repository.ts:716,769](../../../src/legislativo/sessoes-plenarias/infra/prisma/prisma-sessao-plenaria.repository.ts#L716),
[prisma-votacao.repository.ts:413,717,870](../../../src/legislativo/votacoes/infra/prisma/prisma-votacao.repository.ts#L413).

**O problema real:** `TramitacaoHistoricoRepository.findByMateriaId()` — o único método de leitura
que existe para `TramitacaoHistorico` — **não é chamado por nenhum use-case, controller ou
view-model no projeto** (`grep -rn "findByMateriaId"` só retorna a própria interface e a
implementação Prisma). O endpoint que existe para histórico,
`GET /materias/:id/tramitacao` ([materias.controller.ts:395-408](../../../src/legislativo/materias/application/controllers/materias.controller.ts#L395-L408)),
devolve o objeto `Materia` (que expõe o histórico derivado de `tramitacaoJson`, via
`parseTramitacaoHistory` em [matter.view-model.ts:59-62](../../../src/legislativo/materias/application/view-models/matter.view-model.ts#L59-L62)),
não o conteúdo de `TramitacaoHistorico`.

**Consequência prática:** se uma matéria for tramitada via `POST /:id/tramitar` (o único caminho
que grava em `TramitacaoHistorico` e que valida transições + exige despacho para status
sensíveis), esse evento **fica invisível** em qualquer consulta — não aparece no
`tramitacaoJson` nem em nenhuma resposta de API. Já as transições feitas por votação, pauta ou
pelo endpoint `/tramitacao` ficam registradas só no JSON legado, sem nunca alimentar a tabela
`TramitacaoHistorico` (que é `append-only` por design — regra 8). Ou seja: **o modelo "novo" que
deveria ser a fonte de verdade do histórico está com o lado de escrita subutilizado e o lado de
leitura completamente morto** — nenhuma trilha de auditoria está 100% completa hoje.

O próprio contrato de domínio já documenta a intenção correta e diverge da implementação real:
> `/** Transição de status + registro em TramitacaoHistorico em uma transaction. */`
> [materia.repository.ts:129](../../../src/legislativo/materias/domain/repositories/materia.repository.ts#L129)
— essa doc-comment descreve só o método `tramitar()`; os outros dois (`tramitarMateria`,
`alterarStatus`) não cumprem essa promessa.

### 1.2 Sistema de autenticação paralelo "SIGL" (`Usuario`) sem `tenantId`

**Severidade: alta (arquitetural).** Além do módulo `identidade` (User + TenantUser, JWT
multi-tenant, documentado no CLAUDE.md), existe um **segundo sistema de autenticação completo e
ativo**, baseado no model `Usuario` (schema.prisma:639-648), que:

- não tem `tenantId` nenhum (é uma tabela global, fora do isolamento multi-tenant);
- tem seu próprio enum de papéis (`RoleUsuario`: MASTER/ADMIN/OPERADOR);
- tem controller, use-cases de CRUD e login próprios, todos ativos:
  [usuarios.controller.ts](../../../src/auth/application/controllers/usuarios.controller.ts),
  [login-sigl.use-case.ts](../../../src/auth/application/use-cases/login-sigl.use-case.ts),
  chamado a partir de [auth.controller.ts:36,54](../../../src/auth/application/controllers/auth.controller.ts#L54).

Isso não está listado em nenhum lugar do CLAUDE.md (que só documenta `identidade/` com
User/Tenant/TenantUser/GuestUser). Não é necessariamente um bug — pode ser um admin global
intencional — mas é uma duplicidade estrutural não documentada que **escapa das regras 2 e 3**
do CLAUDE.md (tenantId sempre via JWT; toda query filtrada por tenantId), porque `Usuario`
simplesmente não tem esse conceito. Vale uma decisão consciente do time: manter, documentar ou
descontinuar.

### 1.3 Model `Course` / enum `CourseStatus` — fora de domínio, zero uso

**Severidade: baixa (mas chamativa).** `schema.prisma:1562-1593` define um bounded context
"Courses" (`title`, `workloadHours`, `slug`, `status: DRAFT|PUBLISHED|ARCHIVED`) que não tem
nenhuma relação com o domínio legislativo do projeto. Confirmado **zero referências** a
`prisma.course` ou `CourseStatus` em `src/` (fora do schema). É quase certamente resíduo de um
template genérico (o mesmo padrão de domínio "Demand/Teacher/Course" usado como exemplo em
`TASKS-node.md`) que acabou colado no schema real. Só existe na tabela `Tenant.courses` como
relação e na migration; não há controller, use-case ou repositório.

### 1.4 `Ato.tenantId` ainda nullable — migração mencionada no schema não foi concluída

**Severidade: média.** O próprio schema documenta a intenção:
```
// tenantId nullable primeiro — populado antes de tornar NOT NULL
tenantId String?
```
([schema.prisma:1228-1229](../../../prisma/schema.prisma#L1228)). Isso é exatamente o gap G
listado no CLAUDE.md ("único model de negócio sem isolamento de tenant"). Auditei
[prisma-ato.repository.ts](../../../src/atos-administrativos/atos/infra/prisma/prisma-ato.repository.ts):
todas as queries atuais (`findById`, `findMany`, `update`, `remove`, `existsByNumero`) **filtram
por `tenantId` corretamente** — não achei vazamento cross-tenant ativo. O risco real é outro: como
a coluna aceita `NULL` e não há constraint de banco, um `Ato` criado sem tenantId (script manual,
seed, migration futura) fica **invisível para todos os tenants** (nenhum `where: { tenantId }`
bate com `NULL`), silenciosamente. A migração para `NOT NULL` mencionada no comentário do schema
parece ter ficado parada.

---

## 2. Achados informativos (uso confirmado como morto, sem indício de bug ativo)

| Model/campo legado | Status | Evidência |
|---|---|---|
| `MateriaCoautor` (coautor PT, chave `Parlamentar`) | **Morto** — 0 referências em `src/` (nem em specs) | superado por `MatterCoauthor`, que é o único usado em [prisma-materia.repository.ts:184](../../../src/legislativo/materias/infra/prisma/prisma-materia.repository.ts#L184) (`syncCoautores`) |
| `ComissaoMembro`, `FrenteMembro`, `MesaDiretoraMembro` (tabelas de vínculo PT) | **Congeladas** — nenhum `create`/`update`/`delete` em nenhum lugar do código | substituídas por `CommitteeMember`, `ParliamentaryFrontMember`, `BoardMember`; dados antigos preservados mas inacessíveis pelo app atual |
| `Pessoa`, `FrenteParlamentar`, `MesaDiretora`, `CargoMesa` | **Só leitura indireta** (via `include: { parlamentar: { include: { pessoa: true }}}` em relatórios/votação/sessão) | ex.: [relatorios.service.ts:153](../../../src/relatorios/relatorios.service.ts#L153), [prisma-votacao.repository.ts:65](../../../src/legislativo/votacoes/infra/prisma/prisma-votacao.repository.ts#L65) |
| `Parlamentar` | Ainda referenciado em 3 arquivos diretos + via relação em voto/presença/pauta legado | migração para `Parliamentarian` parcial — convivem os dois em `VotoParlamentar`, `PresencaSessao`, `Autor`, `Materia.primeiroAutorId/relatorId` |
| `cicloVidaJson` (SessaoPlenaria) | **Ainda ativo**, mas sem divergência: `executarCicloVida()` atualiza `statusSessao` (novo) e `cicloVidaJson` (legado) **na mesma escrita** ([prisma-sessao-plenaria.repository.ts:333-346](../../../src/legislativo/sessoes-plenarias/infra/prisma/prisma-sessao-plenaria.repository.ts#L333-L346)) | viola a regra 7 (não usar em código novo), mas não há um `SessaoHistorico` estruturado equivalente ao `TramitacaoHistorico` — hoje `cicloVidaJson` é a única trilha histórica de sessão que existe, então não dá pra simplesmente parar de escrever nele sem perder dado |
| `tramitacaoJson` (Materia) | Ativo, ver item 1.1 | é o caminho *majoritário* de escrita hoje, apesar de a regra 7 dizer para não usar em código novo |

## 3. Verificado e descartado como bug

- **Contadores de voto (`votosSim`/`votosNao`/`abstencoes`)** — regra 9 diz que devem ser
  calculados, nunca inseridos diretamente. Achei entrada manual em
  [voting-domain.service.ts:97-118](../../../src/legislativo/votacoes/domain/services/voting-domain.service.ts#L97-L118),
  mas é **guardada explicitamente**: `assertManualTotalsNotAllowed` bloqueia valores manuais para
  `NOMINAL`/`SECRETA`; só `SIMBOLICA` aceita totais manuais (votação sem registro individual por
  parlamentar). Não é violação da regra — é uma exceção deliberada e validada.
- **Dupla chave `parlamentarId`/`parliamentarianId`** em `VotoParlamentar` e `PresencaSessao` —
  a contagem de votos (`ContagemVotosService.calcularDeGroupBy`) agrupa por `voto`, não por qual
  chave foi usada, então votos gravados por qualquer um dos dois caminhos são contados
  corretamente. Mesmo raciocínio vale para presença/quórum. Não encontrei lugar que filtre só por
  uma das duas chaves e esqueça a outra.

## 4. Recomendações (não executadas — apenas para decisão do time)

1. Decidir **um único caminho** de tramitação de matéria (provavelmente unificar em torno de
   `tramitar()`/`TramitacaoHistorico`) e aposentar `tramitarMateria()`/`alterarStatus()` — ou, na
   direção oposta, ligar de vez `TramitacaoHistorico` em todos os pontos de escrita e expor
   `findByMateriaId()` em algum endpoint. Do jeito que está, nenhuma das duas fontes é confiável
   sozinha.
2. Documentar oficialmente o sistema `Usuario`/SIGL no CLAUDE.md (ou descontinuá-lo), já que hoje
   ele é invisível na documentação mas ativo em produção.
3. Remover `Course`/`CourseStatus` do schema **após confirmar com o time** que não há dado real
   nessa tabela em produção (não removido aqui, conforme solicitado).
4. Retomar a migração de `Ato.tenantId` para `NOT NULL` (o comentário no schema já indica que
   isso era o plano original).
5. Nenhuma ação recomendada para `MateriaCoautor`/`ComissaoMembro`/`FrenteMembro`/
   `MesaDiretoraMembro`/`Pessoa` além de manter como estão (regra 6) — servem histórico.
