-- DropTable (idempotent: table may already be absent in some environments)
DROP TABLE IF EXISTS "courses";

-- DropEnum
DROP TYPE IF EXISTS "CourseStatus";
