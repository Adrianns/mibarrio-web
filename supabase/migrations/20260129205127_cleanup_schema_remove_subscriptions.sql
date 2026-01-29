-- Remove unused subscription tables (app is 100% free)
-- Drop in order of dependencies

-- Drop subscription payments first (depends on subscriptions)
DROP TABLE IF EXISTS public.mb_subscription_payments CASCADE;

-- Drop subscriptions (depends on subscription_plans and providers)
DROP TABLE IF EXISTS public.mb_subscriptions CASCADE;

-- Drop subscription plans
DROP TABLE IF EXISTS public.mb_subscription_plans CASCADE;

-- Add missing index on mb_contact_clicks.provider_id
CREATE INDEX IF NOT EXISTS idx_mb_contact_clicks_provider_id
ON public.mb_contact_clicks(provider_id);

-- Drop functions to recreate with search_path (CASCADE to drop dependent triggers)
DROP FUNCTION IF EXISTS public.mb_increment_provider_view(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.mb_log_contact_click(uuid, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.mb_update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Fix function search_path for security
-- mb_increment_provider_view
CREATE FUNCTION public.mb_increment_provider_view(provider_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.mb_providers
  SET view_count = view_count + 1
  WHERE id = provider_uuid;
END;
$$;

-- mb_log_contact_click
CREATE FUNCTION public.mb_log_contact_click(
  p_provider_id uuid,
  p_contact_type text,
  p_visitor_ip text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.mb_contact_clicks (provider_id, contact_type, visitor_ip)
  VALUES (p_provider_id, p_contact_type, p_visitor_ip);

  UPDATE public.mb_providers
  SET contact_click_count = contact_click_count + 1
  WHERE id = p_provider_id;
END;
$$;

-- mb_update_updated_at
CREATE FUNCTION public.mb_update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers for updated_at
CREATE TRIGGER mb_providers_updated_at
  BEFORE UPDATE ON public.mb_providers
  FOR EACH ROW EXECUTE FUNCTION public.mb_update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.mb_update_updated_at();

-- handle_new_user
CREATE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  );
  RETURN NEW;
END;
$$;

-- Recreate trigger for handle_new_user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Optimize RLS policies by using (select auth.uid()) instead of auth.uid()
-- This prevents re-evaluation for each row

-- mb_providers policies
DROP POLICY IF EXISTS mb_providers_owner_read_all ON public.mb_providers;
DROP POLICY IF EXISTS mb_providers_public_read ON public.mb_providers;
DROP POLICY IF EXISTS mb_providers_owner_insert ON public.mb_providers;
DROP POLICY IF EXISTS mb_providers_owner_update ON public.mb_providers;
DROP POLICY IF EXISTS mb_providers_owner_delete ON public.mb_providers;

-- Consolidated public read (anyone can read active providers OR their own)
CREATE POLICY mb_providers_read ON public.mb_providers
FOR SELECT USING (
  is_active = true
  OR user_id = (SELECT auth.uid())
);

CREATE POLICY mb_providers_insert ON public.mb_providers
FOR INSERT WITH CHECK (
  user_id = (SELECT auth.uid())
);

CREATE POLICY mb_providers_update ON public.mb_providers
FOR UPDATE USING (
  user_id = (SELECT auth.uid())
);

CREATE POLICY mb_providers_delete ON public.mb_providers
FOR DELETE USING (
  user_id = (SELECT auth.uid())
);

-- mb_provider_categories policies
DROP POLICY IF EXISTS mb_provider_categories_owner_manage ON public.mb_provider_categories;
DROP POLICY IF EXISTS mb_provider_categories_public_read ON public.mb_provider_categories;

-- Consolidated read policy (public can read all)
CREATE POLICY mb_provider_categories_read ON public.mb_provider_categories
FOR SELECT USING (true);

-- Owner can manage their categories
CREATE POLICY mb_provider_categories_insert ON public.mb_provider_categories
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.mb_providers p
    WHERE p.id = provider_id AND p.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY mb_provider_categories_update ON public.mb_provider_categories
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.mb_providers p
    WHERE p.id = provider_id AND p.user_id = (SELECT auth.uid())
  )
);

CREATE POLICY mb_provider_categories_delete ON public.mb_provider_categories
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.mb_providers p
    WHERE p.id = provider_id AND p.user_id = (SELECT auth.uid())
  )
);

-- mb_contact_clicks policies
DROP POLICY IF EXISTS mb_contact_clicks_owner_read ON public.mb_contact_clicks;

CREATE POLICY mb_contact_clicks_read ON public.mb_contact_clicks
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.mb_providers p
    WHERE p.id = provider_id AND p.user_id = (SELECT auth.uid())
  )
);

-- profiles policies
DROP POLICY IF EXISTS profiles_owner_insert ON public.profiles;
DROP POLICY IF EXISTS profiles_owner_update ON public.profiles;

CREATE POLICY profiles_insert ON public.profiles
FOR INSERT WITH CHECK (
  id = (SELECT auth.uid())
);

CREATE POLICY profiles_update ON public.profiles
FOR UPDATE USING (
  id = (SELECT auth.uid())
);
