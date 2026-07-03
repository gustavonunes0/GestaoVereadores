-- Unicidade apenas entre membros ativos (permite novo ocupante após soft delete)
DROP INDEX IF EXISTS "board_members_boardId_boardRoleId_key";
DROP INDEX IF EXISTS "board_members_boardId_parliamentarianId_key";

CREATE UNIQUE INDEX "board_members_boardId_boardRoleId_active_key"
    ON "board_members"("boardId", "boardRoleId")
    WHERE "isRemoved" = false;

CREATE UNIQUE INDEX "board_members_boardId_parliamentarianId_active_key"
    ON "board_members"("boardId", "parliamentarianId")
    WHERE "isRemoved" = false;
