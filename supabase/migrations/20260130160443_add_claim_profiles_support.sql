-- Migration: Add support for imported/unclaimed profiles
-- This allows scraping data from external sources and letting users claim their profiles

-- ===========================================
-- 1. Modify mb_providers table for unclaimed profiles
-- ===========================================

-- Make user_id nullable (imported profiles don't have an owner yet)
ALTER TABLE mb_providers ALTER COLUMN user_id DROP NOT NULL;

-- Remove unique constraint on user_id (multiple unclaimed profiles can exist)
ALTER TABLE mb_providers DROP CONSTRAINT IF EXISTS mb_providers_user_id_key;

-- Add tracking fields for imported profiles
ALTER TABLE mb_providers ADD COLUMN IF NOT EXISTS is_claimed BOOLEAN DEFAULT TRUE;
ALTER TABLE mb_providers ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;
ALTER TABLE mb_providers ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';
ALTER TABLE mb_providers ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE mb_providers ADD COLUMN IF NOT EXISTS external_id TEXT;

-- Index for finding unclaimed profiles
CREATE INDEX IF NOT EXISTS idx_mb_providers_is_claimed ON mb_providers(is_claimed) WHERE is_claimed = FALSE;
CREATE INDEX IF NOT EXISTS idx_mb_providers_source ON mb_providers(source);

-- ===========================================
-- 2. Create mb_claim_requests table
-- ===========================================

CREATE TABLE IF NOT EXISTS mb_claim_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES mb_providers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    message TEXT,
    admin_notes TEXT,
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(provider_id, user_id)
);

-- Index for admin queries
CREATE INDEX IF NOT EXISTS idx_mb_claim_requests_status ON mb_claim_requests(status);
CREATE INDEX IF NOT EXISTS idx_mb_claim_requests_provider ON mb_claim_requests(provider_id);

-- Trigger for updated_at
CREATE TRIGGER update_mb_claim_requests_updated_at
    BEFORE UPDATE ON mb_claim_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ===========================================
-- 3. RLS Policies for mb_claim_requests
-- ===========================================

ALTER TABLE mb_claim_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own claim requests
CREATE POLICY "Users can view own claim requests"
    ON mb_claim_requests FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create claim requests
CREATE POLICY "Users can create claim requests"
    ON mb_claim_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admins can view all claim requests
CREATE POLICY "Admins can view all claim requests"
    ON mb_claim_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Admins can update claim requests
CREATE POLICY "Admins can update claim requests"
    ON mb_claim_requests FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- ===========================================
-- 4. Update providers RLS for unclaimed profiles
-- ===========================================

-- Drop existing select policy and recreate to include unclaimed
DROP POLICY IF EXISTS "Providers are viewable by everyone if active" ON mb_providers;

CREATE POLICY "Active and unclaimed providers are viewable by everyone"
    ON mb_providers FOR SELECT
    USING (is_active = TRUE OR user_id = auth.uid());

-- ===========================================
-- 5. Function to approve claim request
-- ===========================================

CREATE OR REPLACE FUNCTION approve_claim_request(
    p_request_id UUID,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_request mb_claim_requests%ROWTYPE;
    v_admin_id UUID;
BEGIN
    v_admin_id := auth.uid();

    -- Verify admin
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_admin_id AND is_admin = TRUE) THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;

    -- Get the request
    SELECT * INTO v_request FROM mb_claim_requests WHERE id = p_request_id;

    IF v_request IS NULL THEN
        RAISE EXCEPTION 'Claim request not found';
    END IF;

    IF v_request.status != 'pending' THEN
        RAISE EXCEPTION 'Claim request already processed';
    END IF;

    -- Update provider with new owner
    UPDATE mb_providers SET
        user_id = v_request.user_id,
        is_claimed = TRUE,
        claimed_at = NOW(),
        updated_at = NOW()
    WHERE id = v_request.provider_id;

    -- Update claim request
    UPDATE mb_claim_requests SET
        status = 'approved',
        admin_notes = p_admin_notes,
        reviewed_by = v_admin_id,
        reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_request_id;

    -- Update user to be a provider
    UPDATE profiles SET
        is_mibarrio_provider = TRUE,
        updated_at = NOW()
    WHERE id = v_request.user_id AND is_mibarrio_provider = FALSE;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- 6. Function to reject claim request
-- ===========================================

CREATE OR REPLACE FUNCTION reject_claim_request(
    p_request_id UUID,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_admin_id UUID;
BEGIN
    v_admin_id := auth.uid();

    -- Verify admin
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_admin_id AND is_admin = TRUE) THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;

    -- Update claim request
    UPDATE mb_claim_requests SET
        status = 'rejected',
        admin_notes = p_admin_notes,
        reviewed_by = v_admin_id,
        reviewed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_request_id AND status = 'pending';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Claim request not found or already processed';
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
