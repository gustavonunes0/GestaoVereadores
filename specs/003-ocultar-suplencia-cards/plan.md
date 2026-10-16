# Implementation Plan: Ocultar suplência nos cards do painel

**Branch**: `003-ocultar-suplencia-cards` | **Date**: 2026-10-15 | **Spec**: [spec.md](./spec.md)

## Summary

Remover texto "Suplente · subst. …" dos cards do painel público (presença e votação). Vínculo permanece no cadastro/API. Presença do suplente já vem do registro do ocupante (`emExercicioId`).

## Technical Context

**Language/Version**: TypeScript / React  
**Primary Dependencies**: `SessaoPainelPage`, `CouncilorRow`  
**Storage**: N/A  
**Testing**: Build frontend  
**Constraints**: Deploy lock; não alterar cadastro de substituições  

## Constitution Check

PASS — só UI do painel público.

## Project Structure

```text
frontend/src/components/sessoes/painel/SessaoPainelPage.tsx
frontend/src/components/sessoes/painel/voting/CouncilorRow.tsx
```
