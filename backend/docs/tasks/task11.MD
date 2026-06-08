Legislative — Partidos Políticos
Task 11 — Regras de negócio de Partidos Políticos
Módulo
src/legislative/partidos-politicos
Objetivo

Padronizar cadastro de partidos usados pelos parlamentares.

Regras
Partido pertence ao tenant.
Sigla é única por tenant.
Nome é único por tenant.
Partido pode ter ideologia e flagUrl.
Não remover partido vinculado a parlamentar ativo.
Critério de aceite
Parlamentar só pode vincular partido do mesmo tenant.
Partido removido não pode ser usado.
