# Implementation Plan: Cabeçalho matéria compacto

**Branch**: `006-cabecalho-materia-compacto` | **Date**: 2026-10-15 | **Spec**: [spec.md](./spec.md)

## Summary

Compactar cabeçalho do detalhe da pauta: linha 1 = Autor | Status | Votação; linha 2 = tags + título + ações. Espaço devolvido ao PDF.

## Technical Context

**Language/Version**: TypeScript / React / CSS  
**Primary Dependencies**: `PautaDetalhePanel`, `lex-sessao.css`  
**Storage**: N/A  
**Testing**: Build frontend  

## Constitution Check

PASS — UI only.

## Project Structure

```text
frontend/src/components/sessoes/pauta/PautaDetalhePanel.tsx
frontend/src/styles/lex-sessao.css
```
