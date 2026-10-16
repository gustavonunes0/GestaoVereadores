# Implementation Plan: PDF data do protocolo

**Branch**: `009-pdf-data-protocolo` | **Date**: 2026-10-15 | **Spec**: [spec.md](./spec.md)

## Summary

O campo "DATA DO PROTOCOLO" na capa do PDF usa hoje `dataProtocoloLabel` (número `I - DDMM####/AAAA`). Corrigir para exibir a data legível `DD/MM/AAAA` (`dataProtocoloCurta`). O prefixo `I -` permanece só no número de protocolo.

## Technical Context

**Language/Version**: TypeScript / NestJS  
**Primary Dependencies**: `materia-texto-original.template.ts`, `GenerateMateriaTextoOriginalPdfUseCase`  
**Storage**: `Materia.dataProtocolo` existente  

## Constitution Check

PASS.

## Project Structure

```text
backend/src/common/pdf/templates/materia-texto-original.template.ts
backend/src/legislativo/materias/application/use-cases/generate-materia-texto-original-pdf.use-case.ts
backend/src/common/pdf/templates/materia-texto-original.template.spec.ts
```
