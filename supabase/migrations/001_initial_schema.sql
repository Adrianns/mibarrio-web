-- =====================================================
-- MI BARRIO DATABASE SCHEMA
-- Initial migration
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('visitor', 'provider')) DEFAULT 'visitor',
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    description TEXT,
    category_type TEXT NOT NULL CHECK (category_type IN ('service', 'business', 'both')) DEFAULT 'both',
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SUBSCRIPTION PLANS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    label TEXT NOT NULL,
    description TEXT,
    price_monthly INTEGER NOT NULL,
    features JSONB NOT NULL DEFAULT '[]',
    max_photos INTEGER DEFAULT 3,
    highlight_in_search BOOLEAN DEFAULT FALSE,
    show_contact_directly BOOLEAN DEFAULT TRUE,
    priority_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    mercadopago_plan_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PROVIDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Business/Provider info
    provider_type TEXT NOT NULL CHECK (provider_type IN ('individual', 'business')) DEFAULT 'individual',
    display_name TEXT NOT NULL,
    business_name TEXT,
    business_rut TEXT,
    logo_url TEXT,

    -- Description
    description TEXT,
    short_description TEXT,

    -- Contact info
    contact_phone TEXT,
    contact_whatsapp TEXT,
    contact_email TEXT,
    website_url TEXT,
    instagram_url TEXT,
    facebook_url TEXT,

    -- Location
    department TEXT NOT NULL,
    neighborhood TEXT,
    address TEXT,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),

    -- Photos
    photos TEXT[] DEFAULT '{}',

    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,

    -- Status
    is_active BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,

    -- Stats
    view_count INTEGER DEFAULT 0,
    contact_click_count INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id)
);

-- =====================================================
-- PROVIDER CATEGORIES (junction table)
-- =====================================================
CREATE TABLE IF NOT EXISTS provider_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(provider_id, category_id)
);

-- =====================================================
-- SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),

    -- MercadoPago integration
    mercadopago_preapproval_id TEXT,
    mercadopago_payer_id TEXT,
    mercadopago_status TEXT,

    -- Subscription dates
    status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'paused', 'cancelled', 'expired')) DEFAULT 'pending',
    started_at TIMESTAMPTZ,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,

    -- Payment tracking
    last_payment_at TIMESTAMPTZ,
    next_payment_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SUBSCRIPTION PAYMENTS (history)
-- =====================================================
CREATE TABLE IF NOT EXISTS subscription_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,

    amount INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'refunded')),
    mercadopago_payment_id TEXT,

    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,

    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CONTACT CLICKS (analytics)
-- =====================================================
CREATE TABLE IF NOT EXISTS contact_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    contact_type TEXT NOT NULL CHECK (contact_type IN ('phone', 'whatsapp', 'email', 'website', 'instagram', 'facebook')),
    visitor_ip TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_providers_department ON providers(department);
CREATE INDEX idx_providers_neighborhood ON providers(neighborhood);
CREATE INDEX idx_providers_is_active ON providers(is_active);
CREATE INDEX idx_providers_is_featured ON providers(is_featured);
CREATE INDEX idx_provider_categories_provider ON provider_categories(provider_id);
CREATE INDEX idx_provider_categories_category ON provider_categories(category_id);
CREATE INDEX idx_subscriptions_provider ON subscriptions(provider_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_contact_clicks_provider ON contact_clicks(provider_id);
CREATE INDEX idx_contact_clicks_created ON contact_clicks(created_at);
CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_categories_type ON categories(category_type);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, self update
CREATE POLICY "Profiles viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Providers: active providers are public
CREATE POLICY "Active providers are public" ON providers FOR SELECT USING (is_active = true);
CREATE POLICY "Own provider always visible" ON providers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own provider" ON providers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own provider" ON providers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own provider" ON providers FOR DELETE USING (auth.uid() = user_id);

-- Provider categories: follow provider visibility
CREATE POLICY "Provider categories for active providers" ON provider_categories FOR SELECT USING (
    EXISTS (SELECT 1 FROM providers WHERE id = provider_id AND is_active = true)
);
CREATE POLICY "Own provider categories visible" ON provider_categories FOR SELECT USING (
    EXISTS (SELECT 1 FROM providers WHERE id = provider_id AND user_id = auth.uid())
);
CREATE POLICY "Users can manage own provider categories" ON provider_categories FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM providers WHERE id = provider_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update own provider categories" ON provider_categories FOR UPDATE USING (
    EXISTS (SELECT 1 FROM providers WHERE id = provider_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete own provider categories" ON provider_categories FOR DELETE USING (
    EXISTS (SELECT 1 FROM providers WHERE id = provider_id AND user_id = auth.uid())
);

-- Subscriptions: own only
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (
    EXISTS (SELECT 1 FROM providers WHERE id = provider_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert own subscriptions" ON subscriptions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM providers WHERE id = provider_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update own subscriptions" ON subscriptions FOR UPDATE USING (
    EXISTS (SELECT 1 FROM providers WHERE id = provider_id AND user_id = auth.uid())
);

-- Subscription payments: own only
CREATE POLICY "Users can view own subscription payments" ON subscription_payments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM subscriptions s
        JOIN providers p ON s.provider_id = p.id
        WHERE s.id = subscription_id AND p.user_id = auth.uid()
    )
);

-- Categories & Plans: public read
CREATE POLICY "Categories are public" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Subscription plans are public" ON subscription_plans FOR SELECT USING (is_active = true);

-- Contact clicks: insert only for visitors
CREATE POLICY "Anyone can insert contact clicks" ON contact_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Providers can view own contact clicks" ON contact_clicks FOR SELECT USING (
    EXISTS (SELECT 1 FROM providers WHERE id = provider_id AND user_id = auth.uid())
);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'visitor'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Increment view count (called via RPC)
CREATE OR REPLACE FUNCTION increment_provider_view(p_provider_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE providers SET view_count = view_count + 1 WHERE id = p_provider_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log contact click and increment count
CREATE OR REPLACE FUNCTION log_contact_click(
    p_provider_id UUID,
    p_contact_type TEXT,
    p_visitor_ip TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    INSERT INTO contact_clicks (provider_id, contact_type, visitor_ip)
    VALUES (p_provider_id, p_contact_type, p_visitor_ip);

    UPDATE providers SET contact_click_count = contact_click_count + 1 WHERE id = p_provider_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Activate/deactivate provider based on subscription
CREATE OR REPLACE FUNCTION sync_provider_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'active' THEN
        UPDATE providers SET is_active = true WHERE id = NEW.provider_id;
    ELSIF NEW.status IN ('cancelled', 'expired', 'paused') THEN
        UPDATE providers SET is_active = false WHERE id = NEW.provider_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_provider_on_subscription_change
    AFTER UPDATE OF status ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION sync_provider_status();

-- Also activate on insert if status is active
CREATE TRIGGER sync_provider_on_subscription_insert
    AFTER INSERT ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION sync_provider_status();

-- =====================================================
-- SEED DATA: SUBSCRIPTION PLANS
-- =====================================================
INSERT INTO subscription_plans (name, label, description, price_monthly, features, max_photos, highlight_in_search, priority_order) VALUES
('basico', 'Básico', 'Ideal para empezar', 390, '["Aparecé en el directorio", "Hasta 3 fotos", "Contacto por teléfono y WhatsApp", "Estadísticas básicas"]', 3, false, 0),
('profesional', 'Profesional', 'Para negocios en crecimiento', 690, '["Todo del plan Básico", "Hasta 8 fotos", "Destacado en búsquedas", "Estadísticas detalladas", "Badge Profesional"]', 8, true, 1),
('premium', 'Premium', 'Máxima visibilidad', 990, '["Todo del plan Profesional", "Fotos ilimitadas", "Aparecés primero en tu zona", "Badge Premium", "Soporte prioritario"]', 99, true, 2);

-- =====================================================
-- SEED DATA: CATEGORIES
-- =====================================================
INSERT INTO categories (name, label, icon, color, category_type, display_order) VALUES
-- Professional Services
('electricista', 'Electricistas', 'Zap', 'bg-yellow-500', 'service', 1),
('plomero', 'Plomeros', 'Droplets', 'bg-blue-500', 'service', 2),
('albanil', 'Albañiles', 'Hammer', 'bg-orange-500', 'service', 3),
('pintor', 'Pintores', 'Paintbrush', 'bg-purple-500', 'service', 4),
('carpintero', 'Carpinteros', 'Axe', 'bg-amber-600', 'service', 5),
('jardinero', 'Jardineros', 'Flower2', 'bg-green-500', 'service', 6),
('mecanico', 'Mecánicos', 'Wrench', 'bg-zinc-600', 'service', 7),
('tecnico-pc', 'Técnicos PC', 'Monitor', 'bg-slate-600', 'service', 8),
('cerrajero', 'Cerrajeros', 'Key', 'bg-gray-600', 'service', 9),
('mudanzas', 'Mudanzas', 'Truck', 'bg-sky-500', 'service', 10),
('limpieza', 'Limpieza', 'Sparkles', 'bg-cyan-500', 'service', 11),
('cuidado-personas', 'Cuidadores', 'Heart', 'bg-red-400', 'service', 12),
('veterinario', 'Veterinarios', 'Stethoscope', 'bg-emerald-500', 'service', 13),
('abogado', 'Abogados', 'Scale', 'bg-gray-700', 'service', 14),
('contador', 'Contadores', 'Calculator', 'bg-cyan-600', 'service', 15),
-- Local Businesses
('restaurante', 'Restaurantes', 'UtensilsCrossed', 'bg-orange-500', 'business', 16),
('cafe', 'Cafés', 'Coffee', 'bg-amber-700', 'business', 17),
('panaderia', 'Panaderías', 'Croissant', 'bg-yellow-600', 'business', 18),
('carniceria', 'Carnicerías', 'Beef', 'bg-red-600', 'business', 19),
('verduleria', 'Verdulerías', 'Apple', 'bg-green-600', 'business', 20),
('farmacia', 'Farmacias', 'Pill', 'bg-emerald-600', 'business', 21),
('ferreteria', 'Ferreterías', 'Hammer', 'bg-stone-600', 'business', 22),
('peluqueria', 'Peluquerías', 'Scissors', 'bg-pink-500', 'business', 23),
('gimnasio', 'Gimnasios', 'Dumbbell', 'bg-lime-500', 'business', 24),
('veterinaria', 'Veterinarias', 'PawPrint', 'bg-orange-400', 'business', 25),
('lavadero', 'Lavaderos', 'WashingMachine', 'bg-blue-400', 'business', 26),
('kiosco', 'Kioscos', 'Store', 'bg-violet-500', 'business', 27),
('mercado', 'Mercados', 'ShoppingCart', 'bg-teal-500', 'business', 28),
('taller', 'Talleres', 'Settings', 'bg-zinc-500', 'business', 29),
('imprenta', 'Imprentas', 'Printer', 'bg-indigo-500', 'business', 30),
('floreria', 'Florerías', 'Flower', 'bg-rose-500', 'business', 31),
('libreria', 'Librerías', 'BookOpen', 'bg-amber-500', 'business', 32),
('optica', 'Ópticas', 'Glasses', 'bg-sky-600', 'business', 33),
('otro', 'Otros', 'MoreHorizontal', 'bg-gray-500', 'both', 99);
