-- ============================================================
-- Construct Check — Supabase Schema
-- Run this once in the Supabase SQL Editor:
--   https://supabase.com/dashboard/project/vlpuiguahfnuzbtjtwut/sql
-- ============================================================

-- 1. User data table (one row per user)
CREATE TABLE IF NOT EXISTS public.user_data (
  user_id    uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan       text        NOT NULL DEFAULT 'free',
  uploads    integer     NOT NULL DEFAULT 0,
  projects   jsonb       NOT NULL DEFAULT '[]'::jsonb,
  versions   jsonb       NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Row Level Security — each user can only see and modify their own row
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_data" ON public.user_data;
CREATE POLICY "users_own_data" ON public.user_data
  FOR ALL
  TO authenticated
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Auto-create a row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_data (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Backfill rows for any users who signed up before the trigger existed
INSERT INTO public.user_data (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- Migration: Add Stripe billing columns
-- Run this in the Supabase SQL Editor after the initial schema.
-- ============================================================

ALTER TABLE public.user_data
  ADD COLUMN IF NOT EXISTS stripe_customer_id       text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id   text,
  ADD COLUMN IF NOT EXISTS stripe_status            text,
  ADD COLUMN IF NOT EXISTS stripe_current_period_end timestamptz;

-- Index for fast customer lookups from webhook handler
CREATE INDEX IF NOT EXISTS idx_user_data_stripe_customer
  ON public.user_data (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- ============================================================
-- Migration: Analytics events for admin dashboard
-- Tracks page views, session start/end, and engagement.
-- Run this in the Supabase SQL Editor.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id               bigserial    PRIMARY KEY,
  user_id          uuid         REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type       text         NOT NULL,   -- 'page_view' | 'session_start' | 'session_end'
  page             text,                    -- e.g. '/dashboard.html'
  session_id       text,                    -- random uuid per browser session
  duration_seconds integer,                 -- populated on session_end
  metadata         jsonb,
  created_at       timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_user
  ON public.analytics_events (user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created
  ON public.analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type
  ON public.analytics_events (event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_session
  ON public.analytics_events (session_id);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_insert_own_events" ON public.analytics_events;
CREATE POLICY "users_insert_own_events" ON public.analytics_events
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_read_own_events" ON public.analytics_events;
CREATE POLICY "users_read_own_events" ON public.analytics_events
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Note: the admin dashboard reads aggregated data via an Edge Function
-- using the service-role key, which bypasses RLS automatically.
