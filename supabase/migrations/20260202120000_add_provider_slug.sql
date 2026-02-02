-- Migration: Add slug field to mb_providers for friendly URLs
-- Slug format: lowercase, alphanumeric + hyphens, 3-30 chars, unique

-- 1. Add slug column (nullable for existing providers)
ALTER TABLE mb_providers ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. Add unique index (only for non-null slugs)
CREATE UNIQUE INDEX IF NOT EXISTS idx_mb_providers_slug_unique
ON mb_providers(slug) WHERE slug IS NOT NULL;

-- 3. Add check constraint for slug format validation
ALTER TABLE mb_providers ADD CONSTRAINT mb_providers_slug_format CHECK (
  slug IS NULL OR (
    slug ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$'
    AND slug !~ '--'
    AND LENGTH(slug) >= 3
    AND LENGTH(slug) <= 30
  )
);

-- 4. Table of reserved slugs (system routes, brand names)
CREATE TABLE IF NOT EXISTS mb_reserved_slugs (
  slug TEXT PRIMARY KEY,
  reason TEXT NOT NULL
);

INSERT INTO mb_reserved_slugs (slug, reason) VALUES
  ('admin', 'System route'),
  ('api', 'System route'),
  ('auth', 'System route'),
  ('directorio', 'System route'),
  ('mapa', 'System route'),
  ('mi-negocio', 'System route'),
  ('perfil', 'System route'),
  ('planes', 'System route'),
  ('privacy', 'System route'),
  ('terms', 'System route'),
  ('registrar-negocio', 'System route'),
  ('sitemap', 'System route'),
  ('mibarrio', 'Brand name'),
  ('mi-barrio', 'Brand name'),
  ('soporte', 'Reserved'),
  ('ayuda', 'Reserved'),
  ('contacto', 'Reserved'),
  ('about', 'Reserved'),
  ('blog', 'Reserved'),
  ('app', 'Reserved')
ON CONFLICT (slug) DO NOTHING;

-- 5. Function to check slug availability
CREATE OR REPLACE FUNCTION mb_check_slug_availability(
  p_slug TEXT,
  p_exclude_provider_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_normalized_slug TEXT;
  v_exists BOOLEAN;
  v_reserved BOOLEAN;
BEGIN
  -- Normalize slug to lowercase and trim
  v_normalized_slug := LOWER(TRIM(p_slug));

  -- Check minimum length
  IF LENGTH(v_normalized_slug) < 3 THEN
    RETURN jsonb_build_object('available', false, 'reason', 'too_short');
  END IF;

  -- Check maximum length
  IF LENGTH(v_normalized_slug) > 30 THEN
    RETURN jsonb_build_object('available', false, 'reason', 'too_long');
  END IF;

  -- Check if slug is reserved
  SELECT EXISTS(
    SELECT 1 FROM mb_reserved_slugs WHERE slug = v_normalized_slug
  ) INTO v_reserved;

  IF v_reserved THEN
    RETURN jsonb_build_object('available', false, 'reason', 'reserved');
  END IF;

  -- Check if slug exists in providers (excluding current provider if updating)
  IF p_exclude_provider_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM mb_providers
      WHERE slug = v_normalized_slug AND id != p_exclude_provider_id
    ) INTO v_exists;
  ELSE
    SELECT EXISTS(
      SELECT 1 FROM mb_providers WHERE slug = v_normalized_slug
    ) INTO v_exists;
  END IF;

  IF v_exists THEN
    RETURN jsonb_build_object('available', false, 'reason', 'taken');
  END IF;

  RETURN jsonb_build_object('available', true, 'reason', NULL);
END;
$$;

-- Grant execute permission for the function
GRANT EXECUTE ON FUNCTION mb_check_slug_availability TO authenticated;
GRANT EXECUTE ON FUNCTION mb_check_slug_availability TO anon;
