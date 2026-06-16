-- Executa UMA ÚNICA VEZ após migration add_tenant_user_role
-- Ordem importa: ADMIN_STAFF primeiro, depois PARLIAMENTARIAN, depois STAFF

UPDATE tenant_users
SET role = 'ADMIN_STAFF'
WHERE is_tenant_admin = true AND is_removed = false;

UPDATE tenant_users
SET role = 'PARLIAMENTARIAN'
WHERE is_parliamentarian = true
  AND is_tenant_admin = false
  AND is_removed = false;

UPDATE tenant_users
SET role = 'STAFF'
WHERE is_tenant_staff = true
  AND is_tenant_admin = false
  AND is_parliamentarian = false
  AND is_removed = false;

-- Verificar: não deve retornar nenhuma linha (todos os registros ativos devem ter role)
SELECT id, user_id, tenant_id
FROM tenant_users
WHERE role IS NULL AND is_removed = false;
