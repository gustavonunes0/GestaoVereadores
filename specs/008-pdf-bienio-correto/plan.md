# Implementation Plan: PDF biênio correto

**Branch**: `008-pdf-bienio-correto` | **Date**: 2026-10-15 | **Spec**: [spec.md](./spec.md)

## Summary

Biênio do PDF vem de `Board.startDate`/`endDate` da Mesa vigente na data da matéria — não do ano da matéria nem da legislatura inteira.

## Technical Context

**Language/Version**: TypeScript / NestJS  
**Primary Dependencies**: `GenerateMateriaTextoOriginalPdfUseCase`, model `Board`  
**Storage**: boards  

## Constitution Check

PASS.

## Project Structure

```text
backend/.../generate-materia-texto-original-pdf.use-case.ts
```
