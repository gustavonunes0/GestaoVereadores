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

- `TramitacaoHistorico` — crítico
- `AutorExterno` — crítico
- `PublicacaoOficial` — crítico
- Enum `StatusSessao { AGENDADA ABERTA SUSPENSA ENCERRADA }` — crítico
- Enum `StatusPautaItem { RASCUNHO PUBLICADA ENCERRADA }` — alto

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

```
TASK-001 (3 migrations schema) → desbloqueiam todos os outros
     ↓
TASK-002 (sessoes)  TASK-003 (votacoes)  TASK-004 (agenda)  TASK-005 (normas)
```

| Task | Módulo | Spec | Status |
|------|--------|------|--------|
| TASK-001 | Schema / Migrations | `docs/specs/materias/SPEC-001-materias.md` | 🔴 iniciar primeiro |
| TASK-002 | `legislativo/sessoes-plenarias/` | `docs/specs/sessoes/SPEC-002-sessoes.md` | bloqueada por TASK-001 |
| TASK-003 | `legislativo/votacoes/` | `docs/specs/votacoes/SPEC-003-votacoes.md` | bloqueada por TASK-001 |
| TASK-004 | `legislativo/agenda-legislativa/` | `docs/specs/agenda/SPEC-004-agenda.md` | bloqueada por TASK-001 |
| TASK-005 | `controle-juridico/normas/` | `docs/specs/normas/SPEC-005-normas.md` | bloqueada por TASK-001 |

## Comandos úteis

```bash
docker-compose up -d
npx prisma migrate dev --name <descricao>
npx prisma generate
npx jest --testPathPattern=legislativo/materias
npx tsc --noEmit
```
