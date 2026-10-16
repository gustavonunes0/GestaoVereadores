# Implementation Plan: Remover horário do cabeçalho

**Branch**: `015-remover-horario-cabecalho` | **Date**: 2026-10-15 | **Spec**: [spec.md](./spec.md)

## Summary

Remover a exibição do horário abaixo do título no cabeçalho da gestão da sessão. Manter `dataInicio` no cadastro e em atas/convocações/relatórios. Escopo só do cabeçalho de detalhe (FR-004).

## Technical Context

**Language/Version**: TypeScript / React  
**Primary Dependencies**: `sessaoDetalheSubtitulo` em `types/sessoes.ts`, `SessaoDetalhePage.tsx`  
**Storage**: N/A  

## Constitution Check

PASS.

## Project Structure

```text
frontend/src/types/sessoes.ts
frontend/src/components/sessoes/SessaoDetalhePage.tsx
```
