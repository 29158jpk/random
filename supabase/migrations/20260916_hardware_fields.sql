-- ==============================================================================
-- HORIZON AUTO PC - HARDWARE TABLE ENHANCEMENT & STORAGE POLICIES MIGRATION
-- Run this in Supabase SQL Editor if upgrading an existing database
-- ==============================================================================

-- 1. Add missing hardware fields safely (Idempotent)
ALTER TABLE IF EXISTS public.hardware ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE IF EXISTS public.hardware ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE IF EXISTS public.hardware ADD COLUMN IF NOT EXISTS power_consumption TEXT;
ALTER TABLE IF EXISTS public.hardware ADD COLUMN IF NOT EXISTS compatibility TEXT;
ALTER TABLE IF EXISTS public.hardware ADD COLUMN IF NOT EXISTS product_url TEXT;
ALTER TABLE IF EXISTS public.hardware ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Ensure active column matches status for existing rows
UPDATE public.hardware
SET active = (status = 'active')
WHERE active IS NULL;

-- 2. Create Storage Bucket for Hardware Images if not existing
INSERT INTO storage.buckets (id, name, public)
VALUES ('hardware-images', 'hardware-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Storage Policies for hardware-images bucket
-- Allow public read access to hardware images
DROP POLICY IF EXISTS "Public can view hardware images" ON storage.objects;
CREATE POLICY "Public can view hardware images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'hardware-images');

-- Allow authenticated Admins to upload hardware images
DROP POLICY IF EXISTS "Admins can upload hardware images" ON storage.objects;
CREATE POLICY "Admins can upload hardware images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'hardware-images' AND
    (public.is_admin() OR auth.role() = 'authenticated')
  );

-- Allow authenticated Admins to update hardware images
DROP POLICY IF EXISTS "Admins can update hardware images" ON storage.objects;
CREATE POLICY "Admins can update hardware images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'hardware-images' AND
    (public.is_admin() OR auth.role() = 'authenticated')
  );

-- Allow authenticated Admins to delete hardware images
DROP POLICY IF EXISTS "Admins can delete hardware images" ON storage.objects;
CREATE POLICY "Admins can delete hardware images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'hardware-images' AND
    (public.is_admin() OR auth.role() = 'authenticated')
  );
