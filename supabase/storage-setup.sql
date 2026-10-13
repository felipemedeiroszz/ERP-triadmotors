-- TRIAD MOTO PARTS - Supabase Storage Setup
-- Instructions: Run this in Supabase SQL Editor after creating the bucket

-- ============================================================================
-- STORAGE BUCKET SETUP
-- ============================================================================

-- Create bucket for product images
-- Note: This must be done manually in Supabase Dashboard:
-- 1. Go to Storage
-- 2. Click "New bucket"
-- 3. Name: product-images
-- 4. Public bucket: No (false)
-- 5. File size limit: 5MB (or as configured in company_settings)

-- Create bucket for expense receipts
-- Note: This must be done manually in Supabase Dashboard:
-- 1. Go to Storage
-- 2. Click "New bucket"
-- 3. Name: expense-receipts
-- 4. Public bucket: Yes (true)
-- 5. File size limit: 5MB

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- Allow authenticated users to view images
DROP POLICY IF EXISTS "Authenticated users can view product images" ON storage.objects;
CREATE POLICY "Authenticated users can view product images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'product-images');

-- Allow admins to upload images
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to update images
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to delete images
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- EXPENSE RECEIPTS STORAGE POLICIES
-- ============================================================================

-- Allow authenticated users to view expense receipts
DROP POLICY IF EXISTS "Authenticated users can view expense receipts" ON storage.objects;
CREATE POLICY "Authenticated users can view expense receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'expense-receipts');

-- Allow admins to upload expense receipts
DROP POLICY IF EXISTS "Admins can upload expense receipts" ON storage.objects;
CREATE POLICY "Admins can upload expense receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'expense-receipts' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to update expense receipts
DROP POLICY IF EXISTS "Admins can update expense receipts" ON storage.objects;
CREATE POLICY "Admins can update expense receipts"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'expense-receipts' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to delete expense receipts
DROP POLICY IF EXISTS "Admins can delete expense receipts" ON storage.objects;
CREATE POLICY "Admins can delete expense receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'expense-receipts' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- STORAGE FOLDER STRUCTURE (DOCUMENTATION)
-- ============================================================================

-- Recommended folder structure:
-- product-images/
--   {product_id}/
--     image-1.webp
--     image-2.webp
--     image-3.webp

-- expense-receipts/
--   {expense_id}/
--     receipt-1.webp
--     receipt-2.webp

-- Example:
-- product-images/
--   550e8400-e29b-41d4-a716-446655440000/
--     primary.webp
--     secondary-1.webp
--     secondary-2.webp

-- expense-receipts/
--   12345678-1234-1234-1234-123456789012/
--     receipt.webp

-- ============================================================================
-- HELPER FUNCTION TO GET PUBLIC URL
-- ============================================================================

-- Function to get public URL for product images
CREATE OR REPLACE FUNCTION get_product_image_url(image_path TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT public_url
    FROM storage.objects
    WHERE bucket_id = 'product-images' AND name = image_path
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
