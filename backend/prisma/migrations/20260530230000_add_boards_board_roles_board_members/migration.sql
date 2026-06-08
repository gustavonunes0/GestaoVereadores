-- CreateEnum
CREATE TYPE "BoardStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'FINISHED');

-- CreateTable
CREATE TABLE "boards" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "legislatureId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "BoardStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "isRemoved" BOOLEAN NOT NULL DEFAULT false,
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "board_roles" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isRemoved" BOOLEAN NOT NULL DEFAULT false,
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "board_members" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "parliamentarianId" TEXT NOT NULL,
    "boardRoleId" TEXT NOT NULL,
    "isRemoved" BOOLEAN NOT NULL DEFAULT false,
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "boards_tenantId_idx" ON "boards"("tenantId");

-- CreateIndex
CREATE INDEX "boards_tenantId_legislatureId_idx" ON "boards"("tenantId", "legislatureId");

-- CreateIndex
CREATE INDEX "boards_tenantId_status_idx" ON "boards"("tenantId", "status");

-- CreateIndex
CREATE INDEX "boards_tenantId_isRemoved_idx" ON "boards"("tenantId", "isRemoved");

-- CreateIndex
CREATE UNIQUE INDEX "board_roles_tenantId_name_key" ON "board_roles"("tenantId", "name");

-- CreateIndex
CREATE INDEX "board_roles_tenantId_isRemoved_idx" ON "board_roles"("tenantId", "isRemoved");

-- CreateIndex
CREATE UNIQUE INDEX "board_members_boardId_boardRoleId_key" ON "board_members"("boardId", "boardRoleId");

-- CreateIndex
CREATE UNIQUE INDEX "board_members_boardId_parliamentarianId_key" ON "board_members"("boardId", "parliamentarianId");

-- CreateIndex
CREATE INDEX "board_members_tenantId_boardId_idx" ON "board_members"("tenantId", "boardId");

-- CreateIndex
CREATE INDEX "board_members_tenantId_isRemoved_idx" ON "board_members"("tenantId", "isRemoved");

-- AddForeignKey
ALTER TABLE "boards" ADD CONSTRAINT "boards_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boards" ADD CONSTRAINT "boards_legislatureId_fkey" FOREIGN KEY ("legislatureId") REFERENCES "legislatures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_roles" ADD CONSTRAINT "board_roles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_members" ADD CONSTRAINT "board_members_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_members" ADD CONSTRAINT "board_members_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_members" ADD CONSTRAINT "board_members_parliamentarianId_fkey" FOREIGN KEY ("parliamentarianId") REFERENCES "parliamentarians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_members" ADD CONSTRAINT "board_members_boardRoleId_fkey" FOREIGN KEY ("boardRoleId") REFERENCES "board_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
