-- Add signature tracking columns to orders table
ALTER TABLE public.orders
ADD COLUMN signature_request_id text,
ADD COLUMN signature_status text DEFAULT NULL CHECK (signature_status IN ('pending', 'signed', 'declined', NULL)),
ADD COLUMN signed_document_url text,
ADD COLUMN signature_sent_at timestamp with time zone,
ADD COLUMN signature_completed_at timestamp with time zone;

-- Add comment to explain the signature_status values
COMMENT ON COLUMN public.orders.signature_status IS 'Estado de firma: pending (enviado a firmar), signed (firmado), declined (rechazado), NULL (no enviado)';
COMMENT ON COLUMN public.orders.signature_request_id IS 'ID de la solicitud de firma en Dropbox Sign';
COMMENT ON COLUMN public.orders.signed_document_url IS 'URL del documento firmado almacenado en Dropbox Sign';