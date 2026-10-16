CREATE TABLE IF NOT EXISTS communications (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), request_key uuid NOT NULL UNIQUE,
 subject text NOT NULL, body_ciphertext text NOT NULL, kind text NOT NULL CHECK(kind IN ('message','notice','update')),
 state text NOT NULL DEFAULT 'draft' CHECK(state IN ('draft','approved')),
 created_by uuid NOT NULL REFERENCES app_users(id), approved_by uuid REFERENCES app_users(id),
 created_at timestamptz NOT NULL DEFAULT now(), approved_at timestamptz
);
CREATE TABLE IF NOT EXISTS communication_recipients (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), communication_id uuid NOT NULL REFERENCES communications(id),
 client_id uuid NOT NULL REFERENCES clients(id), email_ciphertext text,
 state text NOT NULL CHECK(state IN ('draft','queued','sending','sent','failed','uncertain','skipped')),
 reason text, provider_id text, attempted_at timestamptz, sent_at timestamptz,
 UNIQUE(communication_id,client_id)
);
CREATE INDEX IF NOT EXISTS communication_queue ON communication_recipients(communication_id,state);
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_recipients ENABLE ROW LEVEL SECURITY;
GRANT SELECT,INSERT,UPDATE ON communications,communication_recipients TO sauvid_runtime;
DROP POLICY IF EXISTS communications_read ON communications;
CREATE POLICY communications_read ON communications FOR SELECT TO sauvid_runtime USING(app_staff());
DROP POLICY IF EXISTS communications_insert ON communications;
CREATE POLICY communications_insert ON communications FOR INSERT TO sauvid_runtime WITH CHECK(app_writer() AND created_by=app_actor() AND state='draft');
DROP POLICY IF EXISTS communications_update ON communications;
CREATE POLICY communications_update ON communications FOR UPDATE TO sauvid_runtime USING(current_setting('app.role',true)='admin') WITH CHECK(current_setting('app.role',true)='admin');
DROP POLICY IF EXISTS recipients_read ON communication_recipients;
CREATE POLICY recipients_read ON communication_recipients FOR SELECT TO sauvid_runtime USING(app_staff());
DROP POLICY IF EXISTS recipients_insert ON communication_recipients;
CREATE POLICY recipients_insert ON communication_recipients FOR INSERT TO sauvid_runtime WITH CHECK(app_writer() AND state='draft' AND EXISTS(SELECT 1 FROM communications c WHERE c.id=communication_id AND c.state='draft' AND c.created_by=app_actor()));
DROP POLICY IF EXISTS recipients_update ON communication_recipients;
CREATE POLICY recipients_update ON communication_recipients FOR UPDATE TO sauvid_runtime USING(current_setting('app.role',true)='admin') WITH CHECK(current_setting('app.role',true)='admin');
DROP TRIGGER IF EXISTS operation_audit ON communications;
CREATE TRIGGER operation_audit AFTER INSERT OR UPDATE ON communications FOR EACH ROW EXECUTE FUNCTION operation_audit();
DROP TRIGGER IF EXISTS operation_audit ON communication_recipients;
CREATE TRIGGER operation_audit AFTER INSERT OR UPDATE ON communication_recipients FOR EACH ROW EXECUTE FUNCTION operation_audit();

ALTER TABLE communication_recipients ADD COLUMN IF NOT EXISTS delivery_status text CHECK(delivery_status IN ('accepted','delivered','bounced','complained','failed'));
ALTER TABLE communication_recipients ADD COLUMN IF NOT EXISTS provider_event_at timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS communication_provider_id ON communication_recipients(provider_id) WHERE provider_id IS NOT NULL;
CREATE TABLE IF NOT EXISTS communication_delivery_events(id text PRIMARY KEY,recipient_id uuid NOT NULL REFERENCES communication_recipients(id),event_type text NOT NULL,event_at timestamptz NOT NULL,received_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE communication_delivery_events ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON communication_delivery_events TO sauvid_runtime;
DROP POLICY IF EXISTS delivery_events_read ON communication_delivery_events;
CREATE POLICY delivery_events_read ON communication_delivery_events FOR SELECT TO sauvid_runtime USING(app_staff());
