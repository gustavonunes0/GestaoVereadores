-- Refactor TenantUser: flags + soft delete removedAt; rename table; GuestUser

-- CreateEnum
CREATE TYPE "GuestUserType" AS ENUM (
    'CITIZEN',
    'GUEST',
    'EXTERNAL_AUTHORITY',
    'ORGANIZATION_REPRESENTATIVE',
    'ATTORNEY',
    'SPEAKER',
    'EXTERNAL_AUTHOR'
);

CREATE TYPE "GuestUserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');

-- AlterTable TenantUser: add new columns
ALTER TABLE "TenantUser" ADD COLUMN "isTenantAdmin" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "TenantUser" ADD COLUMN "isTenantStaff" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "TenantUser" ADD COLUMN "isParliamentarian" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "TenantUser" ADD COLUMN "removedAt" TIMESTAMP(3);

-- Migrate role/isAdmin to flags
UPDATE "TenantUser"
SET
    "isTenantAdmin" = CASE
        WHEN "isAdmin" = true OR "role" IN ('OWNER', 'ADMIN') THEN true
        ELSE false
    END,
    "isTenantStaff" = CASE
        WHEN "role" IN ('OWNER', 'ADMIN', 'MANAGER') THEN true
        ELSE false
    END;

-- Drop legacy columns
ALTER TABLE "TenantUser" DROP COLUMN "role";
ALTER TABLE "TenantUser" DROP COLUMN "isAdmin";

-- Drop legacy enum
DROP TYPE "TenantUserRole";

-- Rename table
ALTER TABLE "TenantUser" RENAME TO "tenant_users";

-- Rename indexes/constraints (PostgreSQL keeps internal names; add new indexes per spec)
CREATE INDEX "tenant_users_tenantId_isTenantAdmin_idx" ON "tenant_users"("tenantId", "isTenantAdmin");
CREATE INDEX "tenant_users_tenantId_isTenantStaff_idx" ON "tenant_users"("tenantId", "isTenantStaff");
CREATE INDEX "tenant_users_tenantId_isParliamentarian_idx" ON "tenant_users"("tenantId", "isParliamentarian");
CREATE INDEX "tenant_users_tenantId_isRemoved_idx" ON "tenant_users"("tenantId", "isRemoved");

-- CreateTable guest_users
CREATE TABLE "guest_users" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "cpf" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "type" "GuestUserType" NOT NULL DEFAULT 'CITIZEN',
    "status" "GuestUserStatus" NOT NULL DEFAULT 'ACTIVE',
    "organizationName" TEXT,
    "positionName" TEXT,
    "notes" TEXT,
    "isRemoved" BOOLEAN NOT NULL DEFAULT false,
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guest_users_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "guest_users_tenantId_idx" ON "guest_users"("tenantId");
CREATE INDEX "guest_users_tenantId_type_idx" ON "guest_users"("tenantId", "type");
CREATE INDEX "guest_users_tenantId_status_idx" ON "guest_users"("tenantId", "status");
CREATE INDEX "guest_users_tenantId_isRemoved_idx" ON "guest_users"("tenantId", "isRemoved");

CREATE UNIQUE INDEX "guest_users_tenantId_cpf_key" ON "guest_users"("tenantId", "cpf");

ALTER TABLE "guest_users" ADD CONSTRAINT "guest_users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
