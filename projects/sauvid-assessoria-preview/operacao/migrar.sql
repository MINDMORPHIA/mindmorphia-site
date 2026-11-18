-- Executar via psql, como proprietário, com ON_ERROR_STOP=1.
BEGIN;
CREATE SCHEMA IF NOT EXISTS sauvid_credito;
REVOKE ALL ON SCHEMA sauvid_credito FROM PUBLIC;
SET LOCAL search_path = sauvid_credito;
\ir ../portal_credito/schema.sql
REVOKE ALL ON ALL TABLES IN SCHEMA sauvid_credito FROM PUBLIC;
DO $$ DECLARE perfil text; BEGIN
 FOREACH perfil IN ARRAY ARRAY['anon','authenticated'] LOOP
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname=perfil) THEN
   EXECUTE format('REVOKE ALL ON SCHEMA sauvid_credito FROM %I',perfil);
   EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA sauvid_credito FROM %I',perfil);
  END IF;
 END LOOP;
END $$;
COMMIT;
