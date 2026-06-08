Task 29 — Regras de Negócio de Atos Administrativos

Módulo: `src/atos-administrativos/atos`

## Objetivo

Formalizar Ato como manifestação administrativa oficial (portaria, nomeação, designação, etc.), distinta de norma jurídica, matéria legislativa, votação e sessão plenária.

## Regras principais

- Ato **não usa tenantId** — registro global com `@SkipTenant()`.
- Rota: `/api/atos`.
- Usa `TipoAto` e `ClassificacaoAto` (include obrigatório em consultas).
- **Sem relação** com Norma ou Matéria.
- Remoção: **hard delete** (schema sem `isRemoved`).

## Elementos jurídicos (MVP)

| Elemento | Representação no sistema |
|----------|-------------------------|
| Competência | `@WriteRoles()` (MASTER/ADMIN) |
| Finalidade | `mensagem` (opcional) |
| Forma | `tipoId`, `classificacaoId`, `numero`, datas, `mensagem` |
| Motivo | `mensagem` |
| Objeto | `mensagem` |

Documentação: `domain/types/ato-juridico.types.ts`

## Validações (criar/atualizar)

1. `tipoId` obrigatório e deve existir → 404
2. `classificacaoId` obrigatório e deve existir → 404
3. `numero` obrigatório e único → 409
4. `dataFim` ≥ `dataInicio` → 400
5. `dataPublicacaoFim` ≥ `dataPublicacaoInicio` → 400
6. `mensagem` opcional

## Permissões

- Consulta: `@ReadRoles()` (MASTER, ADMIN, OPERADOR)
- Criar/alterar/remover: `@WriteRoles()` (MASTER, ADMIN)

## Critério de aceite

- [x] Ato em `src/atos-administrativos/atos`, rota `/api/atos`, `@SkipTenant()`
- [x] Sem tenantId, sem relação com Norma/Matéria
- [x] TipoAto e ClassificacaoAto com include em consultas
- [x] Validações de datas aplicadas
- [x] Mensagens de erro em português
- [x] Regras jurídicas documentadas no domínio
- [x] Hard delete mantido
