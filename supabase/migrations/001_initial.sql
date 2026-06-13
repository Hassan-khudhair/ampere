-- ============================================================
-- Generator Subscription Management System - Initial Migration
-- ============================================================

-- Generators table
CREATE TABLE generators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  ampere_price numeric(15, 2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- User roles table (links auth.users to roles and generators)
CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('super_admin', 'generator_admin')),
  generator_id uuid REFERENCES generators(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Subscribers table
CREATE TABLE subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  generator_id uuid NOT NULL REFERENCES generators(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone_number text,
  address text,
  ampere_count numeric(10, 2) NOT NULL DEFAULT 0,
  join_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Monthly payments table
CREATE TABLE monthly_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  generator_id uuid NOT NULL REFERENCES generators(id) ON DELETE CASCADE,
  year integer NOT NULL,
  month integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  amount numeric(15, 2) NOT NULL DEFAULT 0,
  ampere_price_snapshot numeric(15, 2) NOT NULL DEFAULT 0,
  is_paid boolean NOT NULL DEFAULT false,
  paid_at timestamptz,
  is_prorated boolean NOT NULL DEFAULT false,
  days_in_period integer,
  total_days_in_month integer,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(subscriber_id, year, month)
);

-- Indexes
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_subscribers_generator_id ON subscribers(generator_id);
CREATE INDEX idx_subscribers_active ON subscribers(active);
CREATE INDEX idx_monthly_payments_subscriber_id ON monthly_payments(subscriber_id);
CREATE INDEX idx_monthly_payments_generator_id ON monthly_payments(generator_id);
CREATE INDEX idx_monthly_payments_year_month ON monthly_payments(year, month);
CREATE INDEX idx_monthly_payments_generator_year_month ON monthly_payments(generator_id, year, month);

-- ============================================================
-- Helper functions (SECURITY DEFINER bypasses RLS safely)
-- ============================================================

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM user_roles WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION get_my_generator_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT generator_id FROM user_roles WHERE user_id = auth.uid();
$$;

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE generators ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_payments ENABLE ROW LEVEL SECURITY;

-- ── generators ──────────────────────────────────────────────

CREATE POLICY "super_admin_generators_all" ON generators
  FOR ALL TO authenticated
  USING (get_my_role() = 'super_admin')
  WITH CHECK (get_my_role() = 'super_admin');

CREATE POLICY "generator_admin_generators_select" ON generators
  FOR SELECT TO authenticated
  USING (get_my_role() = 'generator_admin' AND id = get_my_generator_id());

CREATE POLICY "generator_admin_generators_update" ON generators
  FOR UPDATE TO authenticated
  USING (get_my_role() = 'generator_admin' AND id = get_my_generator_id())
  WITH CHECK (get_my_role() = 'generator_admin' AND id = get_my_generator_id());

-- ── user_roles ───────────────────────────────────────────────

CREATE POLICY "users_read_own_role" ON user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR get_my_role() = 'super_admin');

CREATE POLICY "super_admin_user_roles_insert" ON user_roles
  FOR INSERT TO authenticated
  WITH CHECK (get_my_role() = 'super_admin');

CREATE POLICY "super_admin_user_roles_update" ON user_roles
  FOR UPDATE TO authenticated
  USING (get_my_role() = 'super_admin')
  WITH CHECK (get_my_role() = 'super_admin');

CREATE POLICY "super_admin_user_roles_delete" ON user_roles
  FOR DELETE TO authenticated
  USING (get_my_role() = 'super_admin');

-- ── subscribers ──────────────────────────────────────────────

CREATE POLICY "super_admin_subscribers_all" ON subscribers
  FOR ALL TO authenticated
  USING (get_my_role() = 'super_admin')
  WITH CHECK (get_my_role() = 'super_admin');

CREATE POLICY "generator_admin_subscribers_all" ON subscribers
  FOR ALL TO authenticated
  USING (get_my_role() = 'generator_admin' AND generator_id = get_my_generator_id())
  WITH CHECK (get_my_role() = 'generator_admin' AND generator_id = get_my_generator_id());

-- ── monthly_payments ─────────────────────────────────────────

CREATE POLICY "super_admin_payments_all" ON monthly_payments
  FOR ALL TO authenticated
  USING (get_my_role() = 'super_admin')
  WITH CHECK (get_my_role() = 'super_admin');

CREATE POLICY "generator_admin_payments_all" ON monthly_payments
  FOR ALL TO authenticated
  USING (get_my_role() = 'generator_admin' AND generator_id = get_my_generator_id())
  WITH CHECK (get_my_role() = 'generator_admin' AND generator_id = get_my_generator_id());

-- ============================================================
-- Seed: Create super admin role entry after first user signs up
-- Run this manually after creating the super admin via Supabase Auth:
--
-- INSERT INTO user_roles (user_id, role)
-- VALUES ('<super-admin-auth-uid>', 'super_admin');
-- ============================================================
