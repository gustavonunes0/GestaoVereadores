# Implementation Plan: Status parlamentar consistente

**Branch**: `011-status-parlamentar-consistente` | **Date**: 2026-10-15 | **Spec**: [spec.md](./spec.md)

## Summary

Opção A (alinhada à 004): `Parliamentarian.status` é a fonte única para listagem, detalhe (selo legislativo) e painel. Revogar/reativar acesso sincroniza esse status. Rótulos em português. Filtro Ativos/Inativos já existe.

## Technical Context

**Language/Version**: TypeScript / NestJS + React  
**Primary Dependencies**: revoke/grant access use-cases, `ParlamentarListCard`, `ParlamentarVerDialog`  

## Constitution Check

PASS.

## Project Structure

```text
backend/.../revoke-parliamentarian-access.use-case.ts
backend/.../grant-parliamentarian-access.use-case.ts
frontend/.../ParlamentarListCard.tsx
frontend/.../ParlamentarVerDialog.tsx
```
