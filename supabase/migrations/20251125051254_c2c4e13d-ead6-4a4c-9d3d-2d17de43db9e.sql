-- Create enums for internal orders
CREATE TYPE order_type AS ENUM ('externa', 'interna');
CREATE TYPE product_type AS ENUM ('diamante', 'gema', 'anillo', 'collar', 'arete', 'dije', 'cadena', 'componente', 'otro');
CREATE TYPE internal_order_status AS ENUM ('pendiente', 'en_transito', 'recibido', 'cancelado');
CREATE TYPE internal_payment_status AS ENUM ('pendiente', 'anticipo', 'pagado');

-- Create purchase_orders_internal table
CREATE TABLE purchase_orders_internal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Classification
  tipo_orden order_type NOT NULL DEFAULT 'interna',
  tipo_producto product_type NOT NULL,
  
  -- Supplier information
  proveedor_nombre TEXT NOT NULL,
  proveedor_contacto TEXT,
  numero_factura TEXT NOT NULL UNIQUE,
  numero_reporte TEXT,
  
  -- Financial information
  precio_compra DECIMAL(10,2) NOT NULL CHECK (precio_compra > 0),
  moneda TEXT NOT NULL DEFAULT 'MXN',
  estatus_pago internal_payment_status NOT NULL DEFAULT 'pendiente',
  
  -- Diamond specific fields
  quilataje DECIMAL(8,2),
  color TEXT,
  claridad TEXT,
  corte TEXT,
  forma TEXT,
  certificado TEXT,
  
  -- Additional fields
  cantidad INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  descripcion TEXT,
  notas_adicionales TEXT,
  
  -- Dates
  fecha_compra DATE NOT NULL,
  fecha_entrega_esperada DATE,
  
  -- Status
  estatus internal_order_status NOT NULL DEFAULT 'pendiente',
  
  -- Files
  factura_pdf_url TEXT NOT NULL,
  imagenes_producto JSONB DEFAULT '[]'::jsonb,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Constraint for diamond data validation
  CONSTRAINT valid_diamond_data CHECK (
    tipo_producto != 'diamante' OR (
      quilataje IS NOT NULL AND 
      color IS NOT NULL AND 
      claridad IS NOT NULL AND 
      corte IS NOT NULL AND 
      forma IS NOT NULL
    )
  )
);

-- Create indexes for better performance
CREATE INDEX idx_purchase_orders_internal_proveedor ON purchase_orders_internal(proveedor_nombre);
CREATE INDEX idx_purchase_orders_internal_tipo_producto ON purchase_orders_internal(tipo_producto);
CREATE INDEX idx_purchase_orders_internal_estatus ON purchase_orders_internal(estatus);
CREATE INDEX idx_purchase_orders_internal_fecha_compra ON purchase_orders_internal(fecha_compra);
CREATE INDEX idx_purchase_orders_internal_created_by ON purchase_orders_internal(created_by);

-- Trigger to update updated_at
CREATE TRIGGER update_purchase_orders_internal_updated_at
  BEFORE UPDATE ON purchase_orders_internal
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Validation trigger for diamond purchases
CREATE OR REPLACE FUNCTION validate_diamond_purchase()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tipo_producto = 'diamante' THEN
    IF NEW.quilataje IS NULL OR 
       NEW.color IS NULL OR 
       NEW.claridad IS NULL OR 
       NEW.corte IS NULL OR 
       NEW.forma IS NULL THEN
      RAISE EXCEPTION 'Para diamantes, todos los campos son obligatorios';
    END IF;
    
    IF NEW.quilataje <= 0 OR NEW.quilataje >= 1000 THEN
      RAISE EXCEPTION 'Quilataje debe estar entre 0.01 y 999.99';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER ensure_diamond_data
  BEFORE INSERT OR UPDATE ON purchase_orders_internal
  FOR EACH ROW
  EXECUTE FUNCTION validate_diamond_purchase();

-- Validation trigger for dates
CREATE OR REPLACE FUNCTION validate_purchase_dates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.fecha_compra > CURRENT_DATE THEN
    RAISE EXCEPTION 'La fecha de compra no puede ser futura';
  END IF;
  
  IF NEW.fecha_entrega_esperada IS NOT NULL AND 
     NEW.fecha_entrega_esperada < NEW.fecha_compra THEN
    RAISE EXCEPTION 'La fecha de entrega no puede ser anterior a la fecha de compra';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER ensure_valid_dates
  BEFORE INSERT OR UPDATE ON purchase_orders_internal
  FOR EACH ROW
  EXECUTE FUNCTION validate_purchase_dates();

-- Enable RLS
ALTER TABLE purchase_orders_internal ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view internal orders"
  ON purchase_orders_internal
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create internal orders"
  ON purchase_orders_internal
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update internal orders"
  ON purchase_orders_internal
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can delete internal orders"
  ON purchase_orders_internal
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'administrador'::app_role));

-- Create storage bucket for purchase order documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('purchase-order-documents', 'purchase-order-documents', false);

-- Storage policies
CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'purchase-order-documents');

CREATE POLICY "Authenticated users can view documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'purchase-order-documents');

CREATE POLICY "Only admins can delete documents"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'purchase-order-documents' AND
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'administrador'::app_role
    )
  );

-- Comments for documentation
COMMENT ON TABLE purchase_orders_internal IS 'Órdenes de compra internas a proveedores externos';
COMMENT ON COLUMN purchase_orders_internal.tipo_producto IS 'Tipo de producto: diamante, gema, joya terminada, componente, etc.';
COMMENT ON COLUMN purchase_orders_internal.numero_reporte IS 'Número de certificado para diamantes (GIA, IGI, etc.)';