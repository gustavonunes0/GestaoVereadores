# Implementation Plan: PDF fecho sem duplicação

**Branch**: `010-pdf-fecho-duplicado` | **Date**: 2026-10-15 | **Spec**: [spec.md](./spec.md)

## Summary

O template sempre injeta "Nestes Termos. / Pede e Aguarda Deferimento.". Se o texto digitado já traz a frase, ela aparece duplicada. Remover o fecho do corpo (ementa/justificativa) na geração e manter um único bloco `.fecho` no template.

## Technical Context

**Language/Version**: TypeScript / NestJS  
**Primary Dependencies**: `materia-texto-original.helpers.ts`, template  

## Constitution Check

PASS.

## Project Structure

```text
backend/src/common/pdf/templates/materia-texto-original.helpers.ts
backend/src/common/pdf/templates/materia-texto-original.template.ts
backend/src/common/pdf/templates/materia-texto-original.template.spec.ts
```
