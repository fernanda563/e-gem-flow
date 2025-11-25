-- Update RLS policies for purchase-order-documents bucket to allow authenticated users to view files

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can view purchase order documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload purchase order documents" ON storage.objects;

-- Allow authenticated users to SELECT (view) files in purchase-order-documents
CREATE POLICY "Authenticated users can view purchase order documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'purchase-order-documents');

-- Ensure authenticated users can INSERT (upload) files
CREATE POLICY "Authenticated users can upload purchase order documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'purchase-order-documents');