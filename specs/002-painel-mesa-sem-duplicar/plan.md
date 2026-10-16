# Implementation Plan: Mesa Diretora fora da grade de presença

**Branch**: `002-painel-mesa-sem-duplicar` | **Date**: 2026-10-15 | **Spec**: [spec.md](./spec.md)

## Summary

No painel inicial, `vereadores={all}` duplica membros da Mesa na grade. Filtrar IDs da Mesa da grade; exibir PRESENTE/AUSENTE nos cards da Mesa; contadores incluem Mesa (FR-006). Só frontend.

## Technical Context

**Language/Version**: TypeScript / React 18  
**Primary Dependencies**: `SessaoPainelPage`, `usePainelElenco`, CSS `sigl-ui-patterns.css`  
**Storage**: N/A  
**Testing**: Build frontend + quickstart visual  
**Target Platform**: Painel público desktop/projeção  
**Project Type**: Web app  
**Constraints**: Deploy lock; não alterar VotingPanel além do necessário; multi-tenant inalterado  

## Constitution Check

PASS — só UI; FR-006 esclarecido (contadores com Mesa).

## Project Structure

```text
frontend/src/components/sessoes/painel/SessaoPainelPage.tsx
frontend/src/styles/sigl-ui-patterns.css
specs/002-painel-mesa-sem-duplicar/{plan,research,data-model,quickstart,contracts,tasks}.md
```

## Complexity Tracking

Nenhuma violação.
