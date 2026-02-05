-- RPC function to get category counts by neighborhood (for Montevideo internal linking)
CREATE OR REPLACE FUNCTION get_category_neighborhood_counts(p_category_name TEXT)
RETURNS TABLE(neighborhood TEXT, count BIGINT)
LANGUAGE sql
STABLE
AS $$
  SELECT
    p.neighborhood,
    COUNT(*)::BIGINT as count
  FROM mb_providers p
  INNER JOIN mb_provider_categories pc ON pc.provider_id = p.id
  WHERE p.is_active = true
    AND p.department = 'Montevideo'
    AND p.neighborhood IS NOT NULL
    AND pc.category_name = p_category_name
  GROUP BY p.neighborhood
  ORDER BY count DESC, p.neighborhood
$$;
