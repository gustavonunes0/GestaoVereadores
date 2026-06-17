-- CreateEnum
CREATE TYPE "TenantUserRole" AS ENUM ('ADMIN_STAFF', 'STAFF', 'PARLIAMENTARIAN');

-- AlterTable tenant_users: add role column
ALTER TABLE "tenant_users" ADD COLUMN "role" "TenantUserRole" NOT NULL DEFAULT 'STAFF';

-- Migrate data from legacy boolean flags to role
UPDATE "tenant_users"
SET "role" = CASE
    WHEN "isTenantAdmin" = true THEN 'ADMIN_STAFF'::"TenantUserRole"
    WHEN "isParliamentarian" = true THEN 'PARLIAMENTARIAN'::"TenantUserRole"
    ELSE 'STAFF'::"TenantUserRole"
END;
