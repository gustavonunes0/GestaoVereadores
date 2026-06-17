-- Remove PARLIAMENTARIAN from TenantUserRole enum
-- All TenantUsers with role=PARLIAMENTARIAN have been soft-deleted as part of M9 migration

ALTER TABLE tenant_users ALTER COLUMN role DROP DEFAULT;
ALTER TYPE "TenantUserRole" RENAME TO "TenantUserRole_old";
CREATE TYPE "TenantUserRole" AS ENUM ('ADMIN_STAFF', 'STAFF');
ALTER TABLE tenant_users ALTER COLUMN role TYPE "TenantUserRole" USING role::text::"TenantUserRole";
ALTER TABLE tenant_users ALTER COLUMN role SET DEFAULT 'STAFF'::"TenantUserRole";
DROP TYPE "TenantUserRole_old";
