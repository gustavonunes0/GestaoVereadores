-- CreateEnum
CREATE TYPE "ParlamentarianUserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- DropForeignKey
ALTER TABLE "parliamentarians" DROP CONSTRAINT "parliamentarians_tenantUserId_fkey";

-- DropIndex
DROP INDEX "parliamentarians_tenantId_tenantUserId_key";

-- AlterTable
ALTER TABLE "parliamentarians" ALTER COLUMN "tenantUserId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "parliamentarian_users" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "parliamentarianId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ParlamentarianUserStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastAccessAt" TIMESTAMP(3),
    "isRemoved" BOOLEAN NOT NULL DEFAULT false,
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parliamentarian_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "parliamentarian_users_parliamentarianId_key" ON "parliamentarian_users"("parliamentarianId");

-- CreateIndex
CREATE UNIQUE INDEX "parliamentarian_users_userId_key" ON "parliamentarian_users"("userId");

-- CreateIndex
CREATE INDEX "parliamentarian_users_tenantId_idx" ON "parliamentarian_users"("tenantId");

-- CreateIndex
CREATE INDEX "parliamentarian_users_tenantId_isRemoved_idx" ON "parliamentarian_users"("tenantId", "isRemoved");

-- CreateIndex
CREATE INDEX "tenant_users_tenantId_role_idx" ON "tenant_users"("tenantId", "role");

-- AddForeignKey
ALTER TABLE "parliamentarians" ADD CONSTRAINT "parliamentarians_tenantUserId_fkey" FOREIGN KEY ("tenantUserId") REFERENCES "tenant_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parliamentarian_users" ADD CONSTRAINT "parliamentarian_users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parliamentarian_users" ADD CONSTRAINT "parliamentarian_users_parliamentarianId_fkey" FOREIGN KEY ("parliamentarianId") REFERENCES "parliamentarians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parliamentarian_users" ADD CONSTRAINT "parliamentarian_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
