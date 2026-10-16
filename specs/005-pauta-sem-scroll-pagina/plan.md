# Implementation Plan: Pauta sem scroll de página

**Branch**: `005-pauta-sem-scroll-pagina` | **Date**: 2026-10-15 | **Spec**: [spec.md](./spec.md)

## Summary

Trocar o painel empilhado (`PautaListaDetalhe`) por painel único (`PautaDetalhePanel`) e travar a altura da aba Pauta à viewport; lista e PDF rolam internamente.

## Technical Context

**Language/Version**: TypeScript / React  
**Primary Dependencies**: `PautaManager`, `PautaDetalhePanel`, `lex-sessao.css`  
**Storage**: N/A  
**Testing**: Build frontend  
**Constraints**: Deploy lock  

## Constitution Check

PASS — só layout da gestão de sessão.

## Project Structure

```text
frontend/src/components/sessoes/pauta/PautaManager.tsx
frontend/src/components/sessoes/pauta/PautaDetalhePanel.tsx
frontend/src/styles/lex-sessao.css
```
