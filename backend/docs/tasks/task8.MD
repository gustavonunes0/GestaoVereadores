Legislative — Parlamentares
Task 8 — Regras de negócio de Parlamentares
Módulo
src/legislative/parlamentares
Objetivo

Consolidar parlamentar como perfil legislativo de TenantUser.

Regras
Parlamentar sempre tem tenantUserId.
TenantUser precisa ter isParliamentarian = true.
Parlamentar não usa Pessoa.
Parlamentar não usa userId direto.
Parlamentar pode ter partido.
Parlamentar pode ter mandatos por legislatura.
Entrega

Ajustar use cases de:

create
update
list
get
remove
Critério de aceite
Não cria parlamentar para TenantUser não parlamentar.
Não duplica parlamentar para o mesmo TenantUser.
Parlamentar lista dados básicos do User via TenantUser.