-- Add batch tracking columns to purchase_orders_internal
ALTER TABLE purchase_orders_internal 
ADD COLUMN batch_id UUID,
ADD COLUMN is_batch_primary BOOLEAN NOT NULL DEFAULT true;

-- Add index for batch queries
CREATE INDEX idx_purchase_orders_batch ON purchase_orders_internal(batch_id) WHERE batch_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN purchase_orders_internal.batch_id IS 'Groups orders created from the same CSV bulk import';
COMMENT ON COLUMN purchase_orders_internal.is_batch_primary IS 'Identifies the primary order in a batch that counts toward total expenses';