# Implementation Plan: Painel votação — cards maiores sem título Placar

**Branch**: `016-painel-votacao-cards` | **Date**: 2026-10-15 | **Spec**: [spec.md](./spec.md)

## Summary

Aumentar densidade visual dos cards de vereadores e Mesa no `VotingPanel` (CSS), indicadores de voto maiores, e remover o rótulo "Placar" do footer sem deixar buraco. Sem regressão das specs 001–003.

## Technical Context

**Language/Version**: React + CSS  
**Primary Dependencies**: `voting-panel.css`, `VoteFooter.tsx`, `VotingPanel`  

## Constitution Check

PASS.

## Project Structure

```text
frontend/src/styles/voting-panel.css
frontend/src/components/sessoes/painel/voting/VoteFooter.tsx
```
