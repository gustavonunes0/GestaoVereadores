Task 17 — Base de Frentes Parlamentares

Módulo:
src/legislative/frentes-parlamentares

Objetivo:
Implementar frentes como grupos suprapartidários pertencentes à Câmara Municipal.

Regras:
- Frente pertence ao tenant, ou seja, à Câmara Municipal.
- Frente não pertence diretamente a TenantUser.
- Frente não pertence diretamente a partido político.
- Frente possui nome, tema, descrição, dataInicio, dataFim e status.
- Frente pode ter coordenador parlamentar.
- Frente pode registrar o TenantUser responsável pela criação.
- Frente possui membros parlamentares.
- Frente permite parlamentares de partidos diferentes.
- Frente não substitui comissão.
- Frente não emite parecer obrigatório.

Critério de aceite:
É possível cadastrar frente parlamentar por tema ou causa dentro de uma Câmara.
Regra de validação importante

Ao adicionar membro:

1. Buscar Frente por id + tenantId.
2. Buscar Parlamentar por id + tenantId.
3. Garantir que o parlamentar pertence à mesma Câmara.
4. Impedir parlamentar duplicado na mesma frente.

Resumo direto:

FrenteParlamentar pertence ao Tenant/Câmara.
TenantUser apenas cria ou mantém.
Parlamentar participa como membro.
Partido não é dono da frente.