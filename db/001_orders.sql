-- Modelo inicial PostgreSQL. NÃO executado; revisar e adaptar ao provedor definitivo.
CREATE TABLE IF NOT EXISTS customers (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 full_name TEXT NOT NULL CHECK (length(trim(full_name)) BETWEEN 2 AND 150),
 email TEXT NOT NULL CHECK (length(email) BETWEEN 3 AND 254),
 whatsapp TEXT NOT NULL CHECK (length(whatsapp) BETWEEN 10 AND 20),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS orders (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 customer_id UUID NOT NULL REFERENCES customers(id),
 plan_id TEXT NOT NULL CHECK (plan_id IN ('impacto','autoridade','magnitude','google-ai-pro-18','canva-pro-12','canva-pro-24')),
 amount_cents INTEGER NOT NULL CHECK(amount_cents > 0),
 currency TEXT NOT NULL DEFAULT 'BRL' CHECK(currency='BRL'),
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid','failed','cancelled','refunded')),
 idempotency_key TEXT NOT NULL UNIQUE,
 external_reference TEXT NOT NULL UNIQUE,
 provider_payment_id TEXT UNIQUE,
 provider_preference_id TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 paid_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE TABLE IF NOT EXISTS payment_events (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 provider_event_key TEXT NOT NULL UNIQUE,
 order_id UUID REFERENCES orders(id),
 event_type TEXT NOT NULL,
 result TEXT NOT NULL CHECK (result IN ('received','verified','rejected','ignored','error')),
 event_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Operar acesso exclusivamente no servidor com privilégios mínimos.
-- Para Supabase, ativar RLS e políticas antes de disponibilizar qualquer tabela via API.
-- Aplicação deve garantir que alteração para 'paid' ocorra só após consulta confirmatória ao Mercado Pago.
