-- Premium features: subscriptions, services, hours, promotions, banner
-- Re-creates subscription tables (previously dropped in 20260129205127)

-- ============================================================
-- 1. Subscription Plans
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mb_subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    description TEXT,
    price_monthly INTEGER NOT NULL,
    price_annual INTEGER NOT NULL,
    features JSONB NOT NULL DEFAULT '[]',
    max_services INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. Subscriptions (one per provider)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mb_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES public.mb_providers(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.mb_subscription_plans(id),
    status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'paused', 'cancelled', 'expired')) DEFAULT 'pending',
    billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'annual')),
    amount INTEGER,
    mp_payment_id TEXT,
    mp_preference_id TEXT,
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(provider_id)
);

-- ============================================================
-- 3. Subscription Payments (history)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mb_subscription_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES public.mb_subscriptions(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'refunded')),
    mp_payment_id TEXT,
    mp_preference_id TEXT,
    billing_cycle TEXT,
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. Provider Services/Products
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mb_provider_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES public.mb_providers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    price_label TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. Provider Business Hours
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mb_provider_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES public.mb_providers(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(provider_id, day_of_week)
);

-- ============================================================
-- 6. Provider Promotions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mb_provider_promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES public.mb_providers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    discount_text TEXT,
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. Banner URL on providers
-- ============================================================
ALTER TABLE public.mb_providers
ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- ============================================================
-- 8. Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_mb_subscriptions_provider ON public.mb_subscriptions(provider_id);
CREATE INDEX IF NOT EXISTS idx_mb_subscriptions_status ON public.mb_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_mb_subscription_payments_sub ON public.mb_subscription_payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_mb_provider_services_provider ON public.mb_provider_services(provider_id);
CREATE INDEX IF NOT EXISTS idx_mb_provider_hours_provider ON public.mb_provider_hours(provider_id);
CREATE INDEX IF NOT EXISTS idx_mb_provider_promotions_provider ON public.mb_provider_promotions(provider_id);

-- ============================================================
-- 9. RLS Policies
-- ============================================================

-- Subscription Plans: public read
ALTER TABLE public.mb_subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY mb_plans_read ON public.mb_subscription_plans
FOR SELECT USING (is_active = true);

-- Subscriptions: owner via provider
ALTER TABLE public.mb_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY mb_subscriptions_read ON public.mb_subscriptions
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.mb_providers p WHERE p.id = provider_id AND p.user_id = (SELECT auth.uid()))
);
CREATE POLICY mb_subscriptions_insert ON public.mb_subscriptions
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.mb_providers p WHERE p.id = provider_id AND p.user_id = (SELECT auth.uid()))
);
CREATE POLICY mb_subscriptions_update ON public.mb_subscriptions
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.mb_providers p WHERE p.id = provider_id AND p.user_id = (SELECT auth.uid()))
);

-- Subscription Payments: owner read via subscription → provider
ALTER TABLE public.mb_subscription_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY mb_subscription_payments_read ON public.mb_subscription_payments
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.mb_subscriptions s
        JOIN public.mb_providers p ON s.provider_id = p.id
        WHERE s.id = subscription_id AND p.user_id = (SELECT auth.uid())
    )
);
CREATE POLICY mb_subscription_payments_insert ON public.mb_subscription_payments
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.mb_subscriptions s
        JOIN public.mb_providers p ON s.provider_id = p.id
        WHERE s.id = subscription_id AND p.user_id = (SELECT auth.uid())
    )
);

-- Provider Services: public read active, owner CRUD
ALTER TABLE public.mb_provider_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY mb_services_read ON public.mb_provider_services
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.mb_providers p WHERE p.id = provider_id AND (p.is_active = true OR p.user_id = (SELECT auth.uid())))
);
CREATE POLICY mb_services_insert ON public.mb_provider_services
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.mb_providers p WHERE p.id = provider_id AND p.user_id = (SELECT auth.uid()))
);
CREATE POLICY mb_services_update ON public.mb_provider_services
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.mb_providers p WHERE p.id = provider_id AND p.user_id = (SELECT auth.uid()))
);
CREATE POLICY mb_services_delete ON public.mb_provider_services
FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.mb_providers p WHERE p.id = provider_id AND p.user_id = (SELECT auth.uid()))
);

-- Provider Hours: public read active, owner CRUD
ALTER TABLE public.mb_provider_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY mb_hours_read ON public.mb_provider_hours
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.mb_providers p WHERE p.id = provider_id AND (p.is_active = true OR p.user_id = (SELECT auth.uid())))
);
CREATE POLICY mb_hours_insert ON public.mb_provider_hours
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.mb_providers p WHERE p.id = provider_id AND p.user_id = (SELECT auth.uid()))
);
CREATE POLICY mb_hours_update ON public.mb_provider_hours
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.mb_providers p WHERE p.id = provider_id AND p.user_id = (SELECT auth.uid()))
);
CREATE POLICY mb_hours_delete ON public.mb_provider_hours
FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.mb_providers p WHERE p.id = provider_id AND p.user_id = (SELECT auth.uid()))
);

-- Provider Promotions: public read active premium, owner CRUD
ALTER TABLE public.mb_provider_promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY mb_promotions_read ON public.mb_provider_promotions
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.mb_providers p WHERE p.id = provider_id AND (p.is_active = true OR p.user_id = (SELECT auth.uid())))
);
CREATE POLICY mb_promotions_insert ON public.mb_provider_promotions
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.mb_providers p WHERE p.id = provider_id AND p.user_id = (SELECT auth.uid()))
);
CREATE POLICY mb_promotions_update ON public.mb_provider_promotions
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.mb_providers p WHERE p.id = provider_id AND p.user_id = (SELECT auth.uid()))
);
CREATE POLICY mb_promotions_delete ON public.mb_provider_promotions
FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.mb_providers p WHERE p.id = provider_id AND p.user_id = (SELECT auth.uid()))
);

-- ============================================================
-- 10. Updated_at triggers
-- ============================================================
CREATE TRIGGER mb_subscription_plans_updated_at
    BEFORE UPDATE ON public.mb_subscription_plans
    FOR EACH ROW EXECUTE FUNCTION public.mb_update_updated_at();

CREATE TRIGGER mb_subscriptions_updated_at
    BEFORE UPDATE ON public.mb_subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.mb_update_updated_at();

CREATE TRIGGER mb_provider_services_updated_at
    BEFORE UPDATE ON public.mb_provider_services
    FOR EACH ROW EXECUTE FUNCTION public.mb_update_updated_at();

CREATE TRIGGER mb_provider_promotions_updated_at
    BEFORE UPDATE ON public.mb_provider_promotions
    FOR EACH ROW EXECUTE FUNCTION public.mb_update_updated_at();

-- ============================================================
-- 11. Seed premium plan
-- ============================================================
INSERT INTO public.mb_subscription_plans (name, label, description, price_monthly, price_annual, features, max_services)
VALUES (
    'premium',
    'Premium',
    'Destaca tu negocio con herramientas profesionales',
    390,
    3900,
    '["Servicios/productos ilimitados", "Imagen de portada", "Promociones y ofertas", "Badge Premium"]',
    NULL
) ON CONFLICT (name) DO NOTHING;
