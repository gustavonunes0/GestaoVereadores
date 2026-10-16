# Implementation Plan: Painel da sessão — Pauta no rodapé e Presença expandida

**Branch**: `001-painel-layout-pauta-rodape` | **Date**: 2026-10-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-painel-layout-pauta-rodape/spec.md`

## Summary

Reposicionar o layout da tela inicial do painel público (`/sessoes/{id}/painel`): hoje é um grid de 3 colunas (Mesa | Presença | Pauta em carrossel vertical). A Pauta passa para uma faixa horizontal de largura total no rodapé; Mesa e Presença ficam no topo (esquerda / direita), com a grade de presença aproveitando a largura liberada. Escopo só de frontend (CSS + estrutura JSX do `PainelInicioSessao` / `PainelPautaCarrossel`). Sem alteração de API, Prisma ou realtime.

## Technical Context

**Language/Version**: TypeScript 5.x (React 18), CSS (sem preprocessor)

**Primary Dependencies**: React/Vite, PrimeReact (painel não depende de DataTable aqui), CSS em `sigl-ui-patterns.css`

**Storage**: N/A (sem persistência nova)

**Testing**: Validação visual/manual via `quickstart.md`; build `frontend` (`tsc -b && vite build`)

**Target Platform**: Browser desktop / projeção 1920×1080 (fullscreen); fallback legível em 1366×768

**Project Type**: Web application (frontend React + backend NestJS existente)

**Performance Goals**: Atualização de presença em ≤2s (já existente via realtime); layout sem scroll em fullscreen 1920×1080

**Constraints**:
- Multi-tenant: sem enviar `tenantId` no body; JWT já cobre o painel público
- Não alterar fluxo de votação / mesa de apresentação nesta spec
- Respeitar trava de deploy: sem `git push` nem deploy VPS sem pedido explícito
- Não misturar outra UI library

**Scale/Scope**: 1 página (`SessaoPainelPage`), ~1 componente de layout + CSS; 9–20 cards de presença; até 6 itens de pauta sem paginação, >6 com paginação horizontal

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

A constitution em `.specify/memory/constitution.md` ainda está no template (placeholders). Gates aplicáveis neste projeto:

| Gate | Status | Nota |
|------|--------|------|
| Escopo mínimo / YAGNI | PASS | Só rearranjo de layout; sem backend |
| Multi-tenant (cursor rules) | PASS | Sem novos endpoints; JWT inalterado |
| Soft-delete / regras legislativas | N/A | Sem dados novos |
| Deploy lock | PASS | Implementação local; commit/push/deploy só sob pedido |
| Não quebrar realtime/presença | PASS | Contadores e AO VIVO permanecem nos mesmos hooks |

**Post-design re-check**: PASS — contratos são só de UI; sem migrations.

## Project Structure

### Documentation (this feature)

```text
specs/001-painel-layout-pauta-rodape/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-layout.md
└── tasks.md             # gerado por /speckit-tasks
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/sessoes/painel/
│   │   └── SessaoPainelPage.tsx   # PainelInicioSessao, PainelPautaCarrossel, grade
│   └── styles/
│       └── sigl-ui-patterns.css   # .sessao-painel-inicio*, carrossel → faixa
```

**Structure Decision**: Web app existente; mudanças concentradas no componente da tela inicial do painel e no CSS correspondente. Sem novos módulos.

## Complexity Tracking

> Nenhuma violação — tabela omitida.
