-- Function to verify user's current password
-- This is used for password change verification without re-authentication
CREATE OR REPLACE FUNCTION public.verify_user_password(password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Get the current user's ID
  user_id := auth.uid();

  IF user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Verify password using Supabase's auth schema
  RETURN EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = user_id
      AND encrypted_password = crypt(password, encrypted_password)
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.verify_user_password(text) TO authenticated;
