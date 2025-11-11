-- Add column to store payment receipt URLs
ALTER TABLE orders 
ADD COLUMN comprobantes_pago jsonb DEFAULT '[]'::jsonb;

-- Create storage bucket for payment receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-receipts', 'payment-receipts', false);

-- RLS policies for payment-receipts bucket
CREATE POLICY "Authenticated users can upload payment receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment-receipts');

CREATE POLICY "Authenticated users can view payment receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'payment-receipts');

CREATE POLICY "Authenticated users can delete payment receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'payment-receipts');