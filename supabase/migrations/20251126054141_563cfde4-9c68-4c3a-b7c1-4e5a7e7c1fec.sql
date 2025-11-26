-- Add column to track if the embedded sign URL has been accessed by the client
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS embedded_sign_url_accessed BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.orders.embedded_sign_url_accessed IS 'Tracks if the client has opened the embedded signature URL';