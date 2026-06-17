-- Move politicalPartyId from parliamentarians to parliamentarian_users

ALTER TABLE "parliamentarian_users" ADD COLUMN "politicalPartyId" TEXT;

UPDATE "parliamentarian_users" pu
SET "politicalPartyId" = p."politicalPartyId"
FROM "parliamentarians" p
WHERE pu."parliamentarianId" = p.id
  AND p."politicalPartyId" IS NOT NULL;

ALTER TABLE "parliamentarian_users"
ADD CONSTRAINT "parliamentarian_users_politicalPartyId_fkey"
FOREIGN KEY ("politicalPartyId") REFERENCES "political_parties"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "parliamentarian_users_tenantId_politicalPartyId_idx"
ON "parliamentarian_users"("tenantId", "politicalPartyId");

DROP INDEX IF EXISTS "parliamentarians_tenantId_politicalPartyId_idx";

ALTER TABLE "parliamentarians" DROP CONSTRAINT IF EXISTS "parliamentarians_politicalPartyId_fkey";

ALTER TABLE "parliamentarians" DROP COLUMN "politicalPartyId";
