# CLAUDE.md — GestaoVereadores

Lido automaticamente pelo Claude Code em toda sessão.
Contém o mapa completo do projeto, regras absolutas e estado atual do schema.

---

## Projeto

Sistema de Gestão Legislativa SaaS multi-tenant para câmaras municipais brasileiras.

```
GestaoVereadores/
├── docker-compose.yml              → postgres :5433 · api :3000 · frontend :8080
├── backend/
│   ├── prisma/schema.prisma        → fonte de verdade do banco
│   ├── docs/                       → specs · tasks · decisions · architecture
│   └── src/
│       ├── auth/
│       ├── identidade/             → User · Tenant · TenantUser · GuestUser
│       └── legislativo/
│           ├── materias/
│           ├── sessoes-plenarias/
│           ├── votacoes/
│           ├── agenda-legislativa/
│           ├── parlamentares/
│           ├── legislaturas/
│           ├── comissoes/
│           ├── mesa-diretora/
│           ├── frentes-parlamentares/
│           └── partidos-politicos/
│       ├── controle-juridico/normas/
│       └── atos-administrativos/
└── frontend/ → React + PrimeReact · 16 telas
```

---

## Arquitetura de cada submódulo

```
src/legislativo/<submodulo>/
├── application/
│   ├── controllers/
│   ├── dto/
│   ├── use-cases/
│   └── view-models/
├── domain/
│   ├── entities/        ← zero imports de @prisma/client ou @nestjs/*
│   ├── enums/
│   ├── repositories/    ← abstract class (contrato)
│   └── services/
└── infra/
    └── prisma/
        ├── prisma-<entity>.repository.ts
        └── mappers/
```

Fluxo: `controller → use-case → domain service → prisma repo`

---

## Schema atual — o que JÁ EXISTE

### Campos e models existentes relevantes

**Materia:**
- `status StatusMateria` (enum 9 valores já existe)
- `tramitacaoJson Json` → LEGADO, não usar em código novo
- `autorId? → Autor` ("AutorMateria") · `authorParliamentarianId? → Parliamentarian` ("MatterAuthor")
- `primeiroAutorId? → Parlamentar` (legado) · `relatorId? → Parlamentar` (legado)
- `@@unique([tenantId, tipoId, numero, anoId])` já existe

**Autor:** `parlamentarId? · parliamentarianId? · guestUserId?` — FALTA: `autorExternoId?`
**TipoMateria:** `id · tenantId · nome` — FALTA: `sigla · ordem · isRemoved`
**MatterCoauthor:** já existe (novo EN)
**MateriaCoautor:** já existe (legado PT)

**SessaoPlenaria:**
- `cicloVidaJson Json?` → LEGADO, não usar em código novo
- FALTA: `statusSessao enum · dataAbertura? · dataEncerramento? · dataSuspensao?`

**PautaItem:** FALTA: `publicadaEm DateTime? · statusPauta enum`

**Votacao:**
- `votosSim · votosNao · abstencoes` — PROBLEMA: contadores manuais, podem divergir
- FALTA: `encerradaAt · quorumPresente · responsavelId`

**VotoParlamentar:** usa `parlamentarId → Parlamentar` (legado)
- FALTA: `parliamentarianId?` para o modelo novo

**AgendaLegislativa:** FALTA: `sessaoPlenariaId? · local? · descricao?`
**Norma:** FALTA: `dataSancao? · dataVeto? · dataPromulgacao? · dataPublicacao? · dataVigencia? · dataRevogacao?`
**Ato:** FALTA: `tenantId` — único model de negócio sem isolamento de tenant

### Models que NÃO EXISTEM e precisam ser criados

> Revisado em 2026-07: `TramitacaoHistorico`, `AutorExterno`, `PublicacaoOficial`,
> `StatusSessao` e `StatusPautaItem` (antes listados aqui como faltantes) **já existem e estão em
> uso** — esta seção estava desatualizada. Ver `backend/src/docs/tasks/legado.md` para o estado
> real de cada um (alguns têm uso parcial/inconsistente, mas existem). Lista atualizada do que
> genuinamente falta, cruzada com o reconhecimento do concorrente IntGest
> (`../teste/relatorio_sessao.md`) e `Fluxo_Sessao_Pauta_Votacao_REVISADO.md`:

- `Ata` — crítico (ver `docs/specs/ata/SPEC-006-ata.md`) — maior gap de feature-parity, nenhuma forma existe hoje
- `SessaoHistorico` — crítico (ver `docs/specs/auditoria/SPEC-008-sessao-historico.md`) — não existe trilha estruturada de auditoria de sessão, só `cicloVidaJson` legado
- Extensão de `PedidoPalavra` (`tema`, `fase`, `tempoConcedidoSegundos`) — médio (ver `docs/specs/sessoes/SPEC-009-expediente-chamada-orador.md`)
- `BlocoVotacao` (N `PautaItem` : 1 `Votacao`) — **decisão pendente, não implementar sem confirmação** (ver ADR-013)

---

## Regras absolutas

1. **Domain layer** nunca importa `@prisma/client` ou `@nestjs/*`
2. `tenantId` nunca vem do body/query/params — sempre `@CurrentTenant()` do JWT
3. Todo query filtra `{ tenantId, isRemoved: false }`
4. Nunca `prisma.<entity>.delete()` — sempre soft delete
5. Nunca alterar migrations já aplicadas
6. Nunca remover models legados (Parlamentar, Legislatura, Comissao, MateriaCoautor...)
7. `tramitacaoJson` e `cicloVidaJson` são legados — não usar em código novo
8. `TramitacaoHistorico` é append-only — nunca recebe update
9. Contadores de voto são calculados via query, nunca inseridos diretamente
10. View Models nunca expõem: `tenantId · isRemoved · removedAt · tramitacaoJson · cicloVidaJson`
11. Mensagens de erro em **português brasileiro**
12. Sem `any`. Guards: `@UseGuards(JwtAuthGuard, TenantGuard)` em todas as rotas

---

## Estado de implementação e ordem de execução

> **Nota (2026-07):** TASK-001 a TASK-005 estão **concluídas e em produção** — os checkboxes
> `[ ]` dentro desses arquivos `TASK-*.md` estão desatualizados (marcam tudo como pendente), não
> refletem o código real. A implementação real também diverge da estrutura de arquivos descrita
> nas specs (ex.: pauta/votação/presença/pedido de palavra vivem todos dentro de um único
> `sessoes.controller.ts`, não em controllers separados por submódulo como o SPEC-002 descreve).
> Não usar os checkboxes desses arquivos para decidir o que falta — confirmar sempre contra o
> código antes de assumir algo como pendente.

```
TASK-001..005 — concluídas (ver nota acima)

TASK-008 (SessaoHistorico) — sem dependências, começar primeiro (fundação de auditoria)
     │
     ├──> TASK-009 (chamada dos vereadores / voto de qualidade / orador) — independente, usa TASK-008 só para logar eventos
     │
     └──> TASK-006 (Ata) — independente, usa TASK-008 só para logar eventos
              │
              └──> TASK-007 (Portal Público + geração de PDF) — resumo público e lista de
                   presença em PDF não dependem de nada além da lib de PDF (ADR-012); só a rota
                   de PDF da Ata depende de TASK-006 estar pronta
```

| Task | Módulo | Spec | Status |
|------|--------|------|--------|
| TASK-001 | Schema / Migrations | `docs/specs/materias/SPEC-001-materias.md` | ✅ concluída |
| TASK-002 | `legislativo/sessoes-plenarias/` | `docs/specs/sessoes/SPEC-002-sessoes.md` | ✅ concluída (estrutura difere da spec) |
| TASK-003 | `legislativo/votacoes/` | `docs/specs/votacoes/SPEC-003-votacoes.md` | ✅ concluída (rotas nested em sessões, não em `/votacoes`) |
| TASK-004 | `legislativo/agenda-legislativa/` | `docs/specs/agenda/SPEC-004-agenda.md` | ✅ concluída (recorrência: campos existem, geração de ocorrências não) |
| TASK-005 | `controle-juridico/normas/` | `docs/specs/normas/SPEC-005-normas.md` | ✅ concluída |
| TASK-008 | `legislativo/sessoes-plenarias/historico/` (novo) | `docs/specs/auditoria/SPEC-008-sessao-historico.md` | 🔴 não iniciada — começar por aqui |
| TASK-009 | `legislativo/sessoes-plenarias/` (extensão) | `docs/specs/sessoes/SPEC-009-expediente-chamada-orador.md` | 🔴 não iniciada |
| TASK-006 | `legislativo/sessoes-plenarias/ata/` (novo) | `docs/specs/ata/SPEC-006-ata.md` | 🔴 não iniciada |
| TASK-007 | `common/pdf/` (novo) + `relatorios/` + `sessoes-plenarias/` | `docs/specs/transparencia/SPEC-007-portal-publico.md` | 🔴 não iniciada — depende de TASK-006 para a rota `/ata/pdf` |

Frontend correspondente (`frontend/src/docs/tasks/`, convenção nova estabelecida em 2026-07,
pasta existia vazia): `TASK-F06-ata-editor.md`, `TASK-F07-portal-publico.md`,
`TASK-F08-sessao-historico-timeline.md`, `TASK-F09-expediente-chamada-orador.md` — cada um só
pode começar depois do backend correspondente ter os endpoints prontos (não é front-first).

Decisões arquiteturais destas 4 tasks: `docs/decisions/ADR-009-013.md` (continuação de
`ADR-001-008.md`). Origem da análise: comparação com o concorrente IntGest
(`../teste/relatorio_sessao.md`, fora deste repo) e `Fluxo_Sessao_Pauta_Votacao_REVISADO.md`.

## Comandos úteis

```bash
docker-compose up -d
npx prisma migrate dev --name <descricao>
npx prisma generate
npx jest --testPathPattern=legislativo/materias
npx tsc --noEmit
```
