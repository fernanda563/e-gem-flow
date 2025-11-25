-- Remove unique constraint from numero_factura to allow multiple orders with same invoice number
-- This is necessary for batch imports where all orders share the same invoice

ALTER TABLE purchase_orders_internal 
DROP CONSTRAINT IF EXISTS purchase_orders_internal_numero_factura_key;

-- Add a comment explaining why this field is no longer unique
COMMENT ON COLUMN purchase_orders_internal.numero_factura IS 'Invoice number - can be shared across multiple orders in a batch import';