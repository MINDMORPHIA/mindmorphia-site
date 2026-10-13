-- SAUVID Assessoria — modelo de dados de produção
-- PostgreSQL 15+
-- Não armazene CPF em texto puro. O backend deve gerar lookup_hash e ciphertext antes do INSERT.

create extension if not exists pgcrypto;

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  auth_subject text not null unique,
  email text,
  role text not null check (role in ('client','operator','admin','auditor')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  cpf_lookup_hash text not null unique,
  cpf_ciphertext text not null,
  cpf_last4 char(4) not null,
  email text,
  whatsapp text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists client_access (
  user_id uuid not null references app_users(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  access_role text not null default 'owner' check (access_role in ('owner','representative','viewer')),
  created_at timestamptz not null default now(),
  primary key (user_id, client_id)
);

create table if not exists cases (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  stage text not null check (stage in ('received','analysis','structured','filed','monitoring','review','completed','paused','cancelled')),
  public_stage_label text not null,
  next_action_public text,
  last_checked_at timestamptz,
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  created_by uuid references app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists case_organizations (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  organization text not null check (organization in ('SPC','SERASA','BOA_VISTA','PROTESTOS')),
  status_code text not null,
  public_status_label text not null,
  public_note text,
  last_checked_at timestamptz,
  evidence_state text not null default 'pending' check (evidence_state in ('pending','reported','reviewed','confirmed','not_applicable')),
  updated_by uuid references app_users(id),
  updated_at timestamptz not null default now(),
  unique(case_id, organization)
);

create table if not exists case_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  organization text check (organization is null or organization in ('SPC','SERASA','BOA_VISTA','PROTESTOS')),
  visibility text not null default 'internal' check (visibility in ('client','internal')),
  event_type text not null,
  title text not null,
  message text not null,
  occurred_at timestamptz not null,
  created_by uuid references app_users(id),
  created_at timestamptz not null default now()
);

create table if not exists case_files (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  event_id uuid references case_events(id) on delete set null,
  visibility text not null default 'internal' check (visibility in ('client','internal')),
  storage_key text not null unique,
  original_name text not null,
  mime_type text not null,
  byte_size bigint not null check (byte_size >= 0),
  sha256 text not null,
  uploaded_by uuid references app_users(id),
  created_at timestamptz not null default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  whatsapp text not null,
  cpf_lookup_hash text,
  cpf_ciphertext text,
  cpf_last4 char(4),
  situation_ciphertext text not null,
  source text not null default 'website',
  status text not null default 'new' check (status in ('new','contacted','qualified','converted','discarded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists audit_log (
  id bigserial primary key,
  actor_user_id uuid references app_users(id),
  action text not null,
  entity_type text not null,
  entity_id text not null,
  request_id text,
  ip_hash text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_cases_client on cases(client_id, opened_at desc);
create index if not exists idx_org_case on case_organizations(case_id);
create index if not exists idx_events_case_time on case_events(case_id, occurred_at desc);
create index if not exists idx_events_client_visible on case_events(case_id, occurred_at desc) where visibility='client';
create index if not exists idx_files_case on case_files(case_id, created_at desc);
create index if not exists idx_leads_status_time on leads(status, created_at desc);
create index if not exists idx_audit_entity on audit_log(entity_type, entity_id, created_at desc);

-- audit_log deve ser tratado como append-only pela aplicação.
-- O usuário de runtime não deve receber permissão de UPDATE/DELETE nessa tabela.
