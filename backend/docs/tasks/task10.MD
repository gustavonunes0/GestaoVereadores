list-parlamentar-mandatos.use-case.ts
finish-parlamentar-mandato.use-case.ts
Critério de aceite
Sessões e votações conseguem validar se parlamentar tem mandato ativo.
Legislative — Legislaturas
Task 11 — Regras de negócio de Legislaturas
Módulo
src/legislative/legislaturas
Objetivo

Definir a legislatura como período institucional da Câmara.

Regras
Legislatura pertence a um tenant.
Legislatura tem número, dataInicio e dataFim.
Apenas uma legislatura pode ser atual por tenant.
Não remover fisicamente.
Critério de aceite
Não permite duas legislaturas atuais no mesmo tenant.
Não permite número duplicado por tenant.