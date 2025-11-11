-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  
  -- Financial information
  precio_venta DECIMAL(10, 2) NOT NULL,
  importe_anticipo DECIMAL(10, 2) NOT NULL,
  forma_pago TEXT NOT NULL,
  estatus_pago TEXT NOT NULL DEFAULT 'anticipo_recibido' CHECK (estatus_pago IN ('anticipo_recibido', 'liquidado')),
  
  -- Metal configuration
  metal_tipo TEXT NOT NULL CHECK (metal_tipo IN ('oro', 'plata', 'platino')),
  metal_pureza TEXT CHECK (metal_pureza IN ('10k', '14k', '18k')),
  metal_color TEXT CHECK (metal_color IN ('amarillo', 'blanco', 'rosado')),
  
  -- Stone configuration
  piedra_tipo TEXT NOT NULL CHECK (piedra_tipo IN ('diamante', 'gema')),
  
  -- Diamond attributes (only if piedra_tipo = 'diamante')
  diamante_color TEXT,
  diamante_claridad TEXT,
  diamante_corte TEXT,
  diamante_quilataje DECIMAL(5, 2),
  diamante_forma TEXT CHECK (diamante_forma IN ('redondo', 'esmeralda', 'radiante', 'marqui', 'oval', 'princesa', 'cojin', 'pera', 'corazon', 'asscher')),
  
  -- Gem attributes (only if piedra_tipo = 'gema')
  gema_observaciones TEXT,
  
  -- Production tracking
  estatus_piedra TEXT DEFAULT 'en_busqueda' CHECK (estatus_piedra IN (
    'en_busqueda',
    'piedra_comprada',
    'en_transito_po_box',
    'en_po_box',
    'en_levant',
    'con_disenador',
    'en_taller',
    'piedra_montada'
  )),
  estatus_montura TEXT DEFAULT 'en_espera' CHECK (estatus_montura IN (
    'en_espera',
    'en_diseno',
    'impresion_modelo',
    'reimpresion_modelo',
    'traslado_modelo',
    'en_espera_taller',
    'en_vaciado',
    'pieza_terminada_taller',
    'en_recoleccion',
    'recolectado',
    'entregado_oyamel',
    'entregado_levant',
    'no_aplica'
  )),
  
  -- Staff assignment (will be implemented in user management module)
  disenador_id UUID,
  joyero_id UUID,
  
  -- General notes
  notas TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies for orders table
CREATE POLICY "Authenticated users can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete orders"
ON public.orders
FOR DELETE
TO authenticated
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_orders_client_id ON public.orders(client_id);
CREATE INDEX idx_orders_estatus_pago ON public.orders(estatus_pago);
CREATE INDEX idx_orders_estatus_piedra ON public.orders(estatus_piedra);
CREATE INDEX idx_orders_estatus_montura ON public.orders(estatus_montura);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

-- Add validation trigger to ensure anticipo is less than precio_venta
CREATE OR REPLACE FUNCTION validate_order_amounts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.importe_anticipo > NEW.precio_venta THEN
    RAISE EXCEPTION 'El anticipo no puede ser mayor al precio de venta';
  END IF;
  
  IF NEW.importe_anticipo < 0 OR NEW.precio_venta < 0 THEN
    RAISE EXCEPTION 'Los montos no pueden ser negativos';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_order_amounts_trigger
BEFORE INSERT OR UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION validate_order_amounts();

-- Add validation trigger for diamond/gem specific fields
CREATE OR REPLACE FUNCTION validate_stone_attributes()
RETURNS TRIGGER AS $$
BEGIN
  -- If diamond, ensure diamond fields are provided
  IF NEW.piedra_tipo = 'diamante' THEN
    IF NEW.diamante_forma IS NULL OR NEW.diamante_quilataje IS NULL THEN
      RAISE EXCEPTION 'Para diamantes se requiere especificar forma y quilataje';
    END IF;
  END IF;
  
  -- If only oro, pureza and color are required
  IF NEW.metal_tipo = 'oro' THEN
    IF NEW.metal_pureza IS NULL OR NEW.metal_color IS NULL THEN
      RAISE EXCEPTION 'Para oro se requiere especificar pureza y color';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_stone_attributes_trigger
BEFORE INSERT OR UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION validate_stone_attributes();