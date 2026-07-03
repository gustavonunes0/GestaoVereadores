-- Coautor: parlamentar ou instituição parceira (exatamente um por linha)
ALTER TABLE "matter_coauthors" ALTER COLUMN "parliamentarianId" DROP NOT NULL;

ALTER TABLE "matter_coauthors" ADD COLUMN "tenantPartnerId" TEXT;

ALTER TABLE "matter_coauthors"
    ADD CONSTRAINT "matter_coauthors_tenantPartnerId_fkey"
    FOREIGN KEY ("tenantPartnerId") REFERENCES "tenant_partners"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

DROP INDEX IF EXISTS "matter_coauthors_matterId_parliamentarianId_key";

CREATE UNIQUE INDEX "matter_coauthors_matterId_parliamentarianId_key"
    ON "matter_coauthors"("matterId", "parliamentarianId")
    WHERE "parliamentarianId" IS NOT NULL;

CREATE UNIQUE INDEX "matter_coauthors_matterId_tenantPartnerId_key"
    ON "matter_coauthors"("matterId", "tenantPartnerId")
    WHERE "tenantPartnerId" IS NOT NULL;

ALTER TABLE "matter_coauthors"
    ADD CONSTRAINT "matter_coauthors_author_kind_check"
    CHECK (
        ("parliamentarianId" IS NOT NULL AND "tenantPartnerId" IS NULL)
        OR ("parliamentarianId" IS NULL AND "tenantPartnerId" IS NOT NULL)
    );
