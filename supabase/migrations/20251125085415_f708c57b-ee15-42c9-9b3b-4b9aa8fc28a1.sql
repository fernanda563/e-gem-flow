-- Make purchase-order-documents bucket public to allow viewing of invoices and images
UPDATE storage.buckets 
SET public = true 
WHERE id = 'purchase-order-documents';