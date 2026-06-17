-- M9: Migração de dados — TenantUser PARLIAMENTARIAN → ParlamentarianUser
-- Executar APÓS migration add_parliamentarian_user_nullable_tenantuser
-- Executar ANTES de remove_parliamentarian_tenant_user_id

-- 1. Criar ParlamentarianUser para cada TenantUser com role = PARLIAMENTARIAN
INSERT INTO parliamentarian_users (
  id, tenant_id, parliamentarian_id, user_id, status, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  tu.tenant_id,
  p.id,
  tu.user_id,
  'ACTIVE',
  NOW(),
  NOW()
FROM tenant_users tu
JOIN parliamentarians p ON p.tenant_user_id = tu.id
WHERE tu.role = 'PARLIAMENTARIAN'
  AND tu.is_removed = false
ON CONFLICT (parliamentarian_id) DO NOTHING;

-- 2. Verificar resultado
SELECT
  COUNT(*) AS parliamentarian_users_criados
FROM parliamentarian_users;

-- 3. Soft-delete os TenantUsers que eram parlamentares
UPDATE tenant_users
SET is_removed = true, removed_at = NOW()
WHERE role = 'PARLIAMENTARIAN'
  AND is_removed = false;

-- 4. Verificar isolamento — deve retornar 0
SELECT COUNT(*) AS parlamentares_tenantuser_ativos
FROM tenant_users
WHERE role = 'PARLIAMENTARIAN' AND is_removed = false;

-- 5. Nullificar tenantUserId nos Parliamentarians já migrados
UPDATE parliamentarians p
SET tenant_user_id = NULL
FROM parliamentarian_users pu
WHERE pu.parliamentarian_id = p.id;

-- 6. Verificar — deve retornar 0
SELECT COUNT(*) AS parlamentares_com_tenantuser
FROM parliamentarians
WHERE tenant_user_id IS NOT NULL;
