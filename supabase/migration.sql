-- =================================================================
-- AMPERE SYSTEM — FULL DATABASE MIGRATION
-- Run this in Supabase → SQL Editor (safe to re-run anytime)
-- =================================================================


-- ─────────────────────────────────────────────────────────────────
-- 1. TABLES  (IF NOT EXISTS — skips if already present)
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.generators (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text        NOT NULL,
  ampere_price  numeric     NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role          text        NOT NULL CHECK (role IN ('super_admin', 'generator_admin')),
  generator_id  uuid        REFERENCES public.generators(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subscribers (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  generator_id  uuid        NOT NULL REFERENCES public.generators(id) ON DELETE CASCADE,
  full_name     text        NOT NULL,
  phone_number  text,
  address       text,
  ampere_count  numeric     NOT NULL,
  join_date     date        NOT NULL,
  notes         text,
  active        boolean     NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.monthly_payments (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id         uuid        NOT NULL REFERENCES public.subscribers(id) ON DELETE CASCADE,
  generator_id          uuid        NOT NULL REFERENCES public.generators(id) ON DELETE CASCADE,
  year                  integer     NOT NULL,
  month                 integer     NOT NULL,
  amount                numeric     NOT NULL,
  ampere_price_snapshot numeric     NOT NULL,
  is_paid               boolean     NOT NULL DEFAULT false,
  paid_at               timestamptz,
  is_prorated           boolean     NOT NULL DEFAULT false,
  days_in_period        integer,
  total_days_in_month   integer,
  created_at            timestamptz NOT NULL DEFAULT now()
);


-- ─────────────────────────────────────────────────────────────────
-- 2. UNIQUE CONSTRAINT (required for payments upsert)
-- ─────────────────────────────────────────────────────────────────

ALTER TABLE public.monthly_payments
  DROP CONSTRAINT IF EXISTS monthly_payments_subscriber_id_year_month_key;

ALTER TABLE public.monthly_payments
  ADD CONSTRAINT monthly_payments_subscriber_id_year_month_key
  UNIQUE (subscriber_id, year, month);


-- ─────────────────────────────────────────────────────────────────
-- 3. HELPER FUNCTIONS (SECURITY DEFINER — bypasses RLS to avoid
--    circular dependency when policies call these functions)
-- ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_my_generator_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT generator_id FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;


-- ─────────────────────────────────────────────────────────────────
-- 4. ENABLE ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────

ALTER TABLE public.generators       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_payments ENABLE ROW LEVEL SECURITY;


-- ─────────────────────────────────────────────────────────────────
-- 5. DROP ALL OLD POLICIES (clean slate)
-- ─────────────────────────────────────────────────────────────────

DO $$ DECLARE r record; BEGIN
  FOR r IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('generators','user_roles','subscribers','monthly_payments')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;


-- ─────────────────────────────────────────────────────────────────
-- 6. RLS POLICIES
-- ─────────────────────────────────────────────────────────────────

-- ── user_roles ───────────────────────────────────────────────────
-- Each user can read only their own row.
-- All writes are done via service-role (admin client) in server actions.
CREATE POLICY "select own role"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid());


-- ── generators ───────────────────────────────────────────────────
-- generator_admin: read and update their own generator only.
-- super_admin:     read and update any generator.
CREATE POLICY "generator_admin select own generator"
  ON public.generators FOR SELECT
  USING (id = public.get_my_generator_id());

CREATE POLICY "super_admin select all generators"
  ON public.generators FOR SELECT
  USING (public.get_my_role() = 'super_admin');

CREATE POLICY "generator_admin update own generator"
  ON public.generators FOR UPDATE
  USING (id = public.get_my_generator_id())
  WITH CHECK (id = public.get_my_generator_id());

CREATE POLICY "super_admin update all generators"
  ON public.generators FOR UPDATE
  USING (public.get_my_role() = 'super_admin')
  WITH CHECK (public.get_my_role() = 'super_admin');


-- ── subscribers ──────────────────────────────────────────────────
-- generator_admin: full CRUD on their own generator's subscribers.
-- super_admin:     read-only across all generators.
CREATE POLICY "generator_admin all own subscribers"
  ON public.subscribers FOR ALL
  USING (generator_id = public.get_my_generator_id())
  WITH CHECK (generator_id = public.get_my_generator_id());

CREATE POLICY "super_admin select all subscribers"
  ON public.subscribers FOR SELECT
  USING (public.get_my_role() = 'super_admin');


-- ── monthly_payments ─────────────────────────────────────────────
-- generator_admin: full CRUD on their own generator's payments.
-- super_admin:     read all payments + toggle paid status (UPDATE).
CREATE POLICY "generator_admin all own payments"
  ON public.monthly_payments FOR ALL
  USING (generator_id = public.get_my_generator_id())
  WITH CHECK (generator_id = public.get_my_generator_id());

CREATE POLICY "super_admin select all payments"
  ON public.monthly_payments FOR SELECT
  USING (public.get_my_role() = 'super_admin');

CREATE POLICY "super_admin update all payments"
  ON public.monthly_payments FOR UPDATE
  USING (public.get_my_role() = 'super_admin')
  WITH CHECK (public.get_my_role() = 'super_admin');
