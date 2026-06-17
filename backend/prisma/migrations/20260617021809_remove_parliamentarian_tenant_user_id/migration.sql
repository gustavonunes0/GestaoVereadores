/*
  Warnings:

  - You are about to drop the column `tenantUserId` on the `parliamentarians` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "parliamentarians" DROP CONSTRAINT "parliamentarians_tenantUserId_fkey";

-- DropIndex
DROP INDEX "parliamentarians_tenantUserId_key";

-- AlterTable
ALTER TABLE "parliamentarians" DROP COLUMN "tenantUserId";
