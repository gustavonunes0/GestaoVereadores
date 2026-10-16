# Implementation Plan: Painel — troca automática

**Branch**: `018-painel-troca-automatica` | **Date**: 2026-10-15 | **Spec**: [spec.md](./spec.md)

## Summary

Persistir item atual da pauta na sessão; ao abrir sessão e ao selecionar item / abrir votação, o painel público troca de tela automaticamente (presença → matéria/espera → votação), sem intervenção no PC do telão.

## Technical Context

**Language/Version**: NestJS + Prisma + React  
**Primary Dependencies**: `SessaoPlenaria.pautaItemAtualId`, painel-publico, `SessaoPainelPage`, `PautaManager`

## Constitution Check

PASS.

## Project Structure

```text
backend: schema + set-pauta-item-atual + painel-publico + gateway
frontend: PautaManager, SessaoPainelPage (modo materia), realtime
```
