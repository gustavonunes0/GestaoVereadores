# Implementation Plan: Etapa Chamada com quórum

**Branch**: `017-etapa-chamada-quorum` | **Date**: 2026-10-15 | **Spec**: [spec.md](./spec.md)

## Summary

Introduzir status `CHAMADA` entre Agendada e Aberta; endpoint iniciar-chamada; abrir só com quórum a partir de Chamada; UI de ações/selo; painel com cabeçalho CHAMADA e indicador de quórum.

## Technical Context

**Language/Version**: NestJS + Prisma + React  
**Storage**: PostgreSQL (`StatusSessao`, `dataInicioChamada`, evento histórico)  

## Constitution Check

PASS — tenantId do JWT; soft-delete intacto; domain sem Prisma.

## Project Structure

```text
backend/prisma/schema.prisma + migration
backend/.../status-sessao.enum.ts, sessao-plenaria.entity.ts
backend/.../iniciar-chamada.use-case.ts, abrir-sessao.use-case.ts
frontend types, SessaoAcoesMenu, badges, PresencaPanel, SessaoPainelPage
```
