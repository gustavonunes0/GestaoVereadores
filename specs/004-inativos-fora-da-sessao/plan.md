# Implementation Plan: Sessão — inativos fora da sessão

**Branch**: `004-inativos-fora-da-sessao` | **Date**: 2026-10-15 | **Spec**: [spec.md](./spec.md)

## Summary

Garantir que `Parliamentarian.status = INACTIVE` não aparece nem participa em sessões ao vivo (presença, mesa, votação, quórum). Backend já tem `assertPodeExercerNaSessao` + filtro de ocupantes; fechar gaps no elenco congelado ao vivo e no painel público. Sem migration de `inactivatedAt` — gap histórico documentado.

## Technical Context

**Language/Version**: TypeScript / NestJS + React  
**Primary Dependencies**: `ExercicioMandatoService`, `GetPainelPublicoSessaoUseCase`  
**Storage**: Prisma `Parliamentarian.status` (sem `inactivatedAt`)  
**Testing**: Specs existentes de exercício; build backend  
**Constraints**: Deploy lock; FR-008 = status do parlamentar; FR-009 = voto anterior continua valendo  

## Constitution Check

PASS — regra de domínio no bounded context de parlamentares/sessões; tenant isolation preservado.

## Project Structure

```text
backend/.../substituicoes/infra/prisma/exercicio-mandato.service.ts
backend/.../sessoes-plenarias/.../get-painel-publico-sessao.use-case.ts
specs/004-inativos-fora-da-sessao/*
```
