# Implementation Plan: PDF coautores

**Branch**: `007-pdf-coautores` | **Date**: 2026-10-15 | **Spec**: [spec.md](./spec.md)

## Summary

Template e geração já listam coautores em AUTORIA e assinaturas. Fechar gap: regenerar PDF ao adicionar/remover coautor.

## Technical Context

**Language/Version**: TypeScript / NestJS  
**Primary Dependencies**: `materia-texto-original.template`, `manage-matter-coauthors`, `GenerateMateriaTextoOriginalPdfUseCase`  
**Storage**: `MatterCoauthor` + arquivo PDF  

## Constitution Check

PASS.

## Project Structure

```text
backend/src/common/pdf/templates/materia-texto-original.template.ts
backend/.../manage-matter-coauthors.use-case.ts
backend/.../generate-materia-texto-original-pdf.use-case.ts
```
