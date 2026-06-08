Task 7 — Regras do usuário responsável da Câmara
Módulo
src/identidade/tenant-users
Objetivo

Formalizar que o usuário responsável por manter o sistema será um TenantUser com:

isTenantAdmin = true
ou
isTenantStaff = true
Regras

Esse usuário poderá manter:

parlamentares
legislaturas
partidos
mesa diretora
comissões
frentes
matérias
sessões
votações
normas
atos
agenda
Não fazer
Não criar novo tipo de usuário.
Não criar entidade SystemMaintainer.
Não usar enum único de role.
Critério de aceite
Guards/decorators conseguem validar admin/staff.
Módulos de negócio usam essa regra para create/update/delete.