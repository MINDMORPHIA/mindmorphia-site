CREATE TABLE IF NOT EXISTS registration_imports (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), source_sha256 text NOT NULL UNIQUE,
 source_name text NOT NULL, total_rows integer NOT NULL, created_by uuid REFERENCES app_users(id),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS registration_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), import_id uuid NOT NULL REFERENCES registration_imports(id),
 source_row integer NOT NULL, source_page integer NOT NULL,
 full_name text NOT NULL, payload_ciphertext text NOT NULL, reasons text[] NOT NULL DEFAULT '{}',
 client_id uuid REFERENCES clients(id), case_id uuid REFERENCES cases(id),
 state text NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','complete')),
 updated_by uuid REFERENCES app_users(id), created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(import_id,source_row)
);
CREATE INDEX IF NOT EXISTS registration_pending ON registration_items(state,source_row);
ALTER TABLE registration_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_items ENABLE ROW LEVEL SECURITY;
GRANT SELECT,INSERT ON registration_imports TO sauvid_runtime;
GRANT SELECT,INSERT,UPDATE ON registration_items TO sauvid_runtime;
DROP POLICY IF EXISTS import_read ON registration_imports;
CREATE POLICY import_read ON registration_imports FOR SELECT TO sauvid_runtime USING(app_staff());
DROP POLICY IF EXISTS import_insert ON registration_imports;
CREATE POLICY import_insert ON registration_imports FOR INSERT TO sauvid_runtime WITH CHECK(current_setting('app.role',true)='admin');
DROP POLICY IF EXISTS registration_read ON registration_items;
CREATE POLICY registration_read ON registration_items FOR SELECT TO sauvid_runtime USING(app_staff());
DROP POLICY IF EXISTS registration_write ON registration_items;
CREATE POLICY registration_write ON registration_items FOR ALL TO sauvid_runtime USING(app_writer()) WITH CHECK(app_writer());
DROP TRIGGER IF EXISTS operation_audit ON registration_items;
CREATE TRIGGER operation_audit AFTER INSERT OR UPDATE ON registration_items FOR EACH ROW EXECUTE FUNCTION operation_audit();
DROP TRIGGER IF EXISTS operation_audit ON registration_imports;
CREATE TRIGGER operation_audit AFTER INSERT ON registration_imports FOR EACH ROW EXECUTE FUNCTION operation_audit();
