-- Drop legacy SIGL auth table and enum (replaced by User + TenantUser)

DROP TABLE IF EXISTS "Usuario";

DROP TYPE IF EXISTS "RoleUsuario";
