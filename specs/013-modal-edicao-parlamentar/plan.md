# Implementation Plan: Modal edição parlamentar

**Branch**: `013-modal-edicao-parlamentar` | **Date**: 2026-10-15 | **Spec**: [spec.md](./spec.md)

## Summary

Mesmo padrão visual da 012: modal ~90vw/1100px, duas colunas (Conta+Identificação | Mandato+suplência), footer Cancelar/Salvar fixo do Dialog, bloco suplente em destaque.

## Technical Context

**Language/Version**: React + PrimeReact  
**Primary Dependencies**: `ParlamentarEditDialog.tsx`, CSS compartilhado  

## Constitution Check

PASS.

## Project Structure

```text
frontend/src/components/parlamentares/ParlamentarEditDialog.tsx
frontend/src/styles/sigl-ui-patterns.css
```
