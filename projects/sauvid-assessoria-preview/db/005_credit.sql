ALTER TABLE cases ADD COLUMN IF NOT EXISTS protocol text, ADD COLUMN IF NOT EXISTS batch text, ADD COLUMN IF NOT EXISTS scope text, ADD COLUMN IF NOT EXISTS creation_key uuid;
UPDATE cases c SET protocol=l.protocol FROM leads l WHERE l.case_id=c.id AND c.protocol IS NULL AND l.protocol IS NOT NULL AND NOT EXISTS(SELECT 1 FROM leads other WHERE other.case_id=c.id AND other.id<>l.id);
CREATE UNIQUE INDEX IF NOT EXISTS cases_creation_key ON cases(creation_key);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS person_type text, ADD COLUMN IF NOT EXISTS verified_at timestamptz;
ALTER TABLE case_organizations ADD COLUMN IF NOT EXISTS revision integer NOT NULL DEFAULT 0, ADD COLUMN IF NOT EXISTS extent text, ADD COLUMN IF NOT EXISTS fact_date date, ADD COLUMN IF NOT EXISTS checked_date date, ADD COLUMN IF NOT EXISTS publication_id uuid REFERENCES case_events(id);
CREATE TABLE IF NOT EXISTS credit_drafts (
 id uuid PRIMARY KEY, case_id uuid NOT NULL REFERENCES cases(id), organization text NOT NULL,
 base_version integer NOT NULL, revision integer NOT NULL DEFAULT 1, payload jsonb NOT NULL,
 before_state jsonb NOT NULL, event_id uuid UNIQUE REFERENCES case_events(id),
 reviewed_by uuid REFERENCES app_users(id), published_at timestamptz,
 FOREIGN KEY(case_id,organization) REFERENCES case_organizations(case_id,organization)
);
CREATE OR REPLACE FUNCTION credit_client_access(target uuid, enable boolean) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE account_id uuid;
BEGIN
 IF current_setting('app.role',true) IS DISTINCT FROM 'admin' THEN RAISE EXCEPTION 'Acesso restrito'; END IF;
 SELECT u.id INTO account_id FROM clients c JOIN app_users u ON lower(u.email)=lower(c.email) WHERE c.id=target AND c.active AND c.verified_at IS NOT NULL AND u.role='client' AND u.active;
 IF account_id IS NULL THEN RETURN false; END IF;
 IF enable THEN INSERT INTO client_access(user_id,client_id) VALUES(account_id,target) ON CONFLICT DO NOTHING;
 ELSE DELETE FROM client_access WHERE user_id=account_id AND client_id=target; END IF;
 INSERT INTO audit_log(actor_user_id,action,entity_type,entity_id) VALUES(app_actor(),CASE WHEN enable THEN 'link_granted' ELSE 'link_revoked' END,'clients',target::text);
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION credit_client_access(uuid,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION credit_client_access(uuid,boolean) TO sauvid_runtime;
ALTER TABLE credit_drafts ENABLE ROW LEVEL SECURITY;
GRANT SELECT,INSERT,UPDATE ON credit_drafts TO sauvid_runtime;
DROP POLICY IF EXISTS credit_admin ON credit_drafts;
CREATE POLICY credit_admin ON credit_drafts TO sauvid_runtime USING(current_setting('app.role',true)='admin') WITH CHECK(current_setting('app.role',true)='admin');
DROP TRIGGER IF EXISTS operation_audit ON credit_drafts;
CREATE TRIGGER operation_audit AFTER INSERT OR UPDATE ON credit_drafts FOR EACH ROW EXECUTE FUNCTION operation_audit();
