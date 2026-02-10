-- Fix provider-photos storage policies: scope to user's own folder
-- Previously any authenticated user could upload/delete any file in the bucket

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their photos" ON storage.objects;

-- INSERT: users can only upload to their own folder ({userId}/...)
CREATE POLICY "Users can upload own provider photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'provider-photos'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- DELETE: users can only delete from their own folder
CREATE POLICY "Users can delete own provider photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'provider-photos'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- UPDATE: users can only update their own files
CREATE POLICY "Users can update own provider photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'provider-photos'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Set bucket constraints: 5MB max, only image types
UPDATE storage.buckets
SET
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE id = 'provider-photos';
