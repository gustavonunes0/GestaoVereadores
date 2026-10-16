# Implementation Plan: Modal detalhe parlamentar

**Branch**: `012-modal-detalhe-parlamentar` | **Date**: 2026-10-15 | **Spec**: [spec.md](./spec.md)

## Summary

Ampliar o modal de detalhe (~90vw / 1100px), layout em duas colunas, aviso de substituição em andamento no topo, card de substituição com destaque e botão "+ Nova substituição".

## Technical Context

**Language/Version**: React + PrimeReact  
**Primary Dependencies**: `ParlamentarVerDialog`, `ParlamentarSubstituicoesSection`, CSS em `sigl-ui-patterns.css`  

## Constitution Check

PASS.

## Project Structure

```text
frontend/src/components/parlamentares/ParlamentarVerDialog.tsx
frontend/src/components/parlamentares/substituicoes/ParlamentarSubstituicoesSection.tsx
frontend/src/styles/sigl-ui-patterns.css
```
