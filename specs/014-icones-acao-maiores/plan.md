# Implementation Plan: Ícones de ação 4px maiores

**Branch**: `014-icones-acao-maiores` | **Date**: 2026-10-15 | **Spec**: [spec.md](./spec.md)

## Summary

Definir tokens CSS centrais para ícones de ação (+4px no glifo, hit area ≥32×32) e aplicá-los em Prime icon-only buttons e controles de ação da Pauta (↑↓, remover). Ícones decorativos/informativos e PDF viewer fora do escopo.

## Technical Context

**Language/Version**: React + CSS tokens  
**Primary Dependencies**: `prime-theme-tokens.css`, `prime-overrides.css`, `sigl-ui-patterns.css`, `lex-sessao.css`  
**Storage**: N/A  
**Testing**: Build frontend (`npm run build`)  
**Target Platform**: Web  
**Project Type**: Web application (frontend)

## Constitution Check

PASS — mudança só de apresentação; sem tenantId, soft-delete ou domain.

## Project Structure

```text
frontend/src/styles/prime-theme-tokens.css
frontend/src/styles/prime-overrides.css
frontend/src/styles/sigl-ui-patterns.css
frontend/src/styles/lex-sessao.css
```
