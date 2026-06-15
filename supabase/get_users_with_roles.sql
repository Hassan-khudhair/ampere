-- Run this in Supabase → SQL Editor
-- Joins auth.users + user_roles + generators in one database call.
-- SECURITY DEFINER lets it read auth.users (normally restricted).

CREATE OR REPLACE FUNCTION public.get_users_with_roles()
RETURNS TABLE (
  id            uuid,
  email         text,
  created_at    timestamptz,
  role          text,
  generator_id  uuid,
  generator_name text,
  generator_price numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT
    au.id,
    au.email,
    au.created_at,
    ur.role,
    ur.generator_id,
    g.name   AS generator_name,
    g.ampere_price AS generator_price
  FROM auth.users aurt
  LEFT JOIN public.user_roles ur ON ur.user_id = au.id
  LEFT JOIN public.generators  g  ON g.id = ur.generator_id
  ORDER BY au.created_at;
$$;
