-- Fix security warnings by setting search_path on functions

-- Recreate validate_order_amounts function with search_path
CREATE OR REPLACE FUNCTION validate_order_amounts()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.importe_anticipo > NEW.precio_venta THEN
    RAISE EXCEPTION 'El anticipo no puede ser mayor al precio de venta';
  END IF;
  
  IF NEW.importe_anticipo < 0 OR NEW.precio_venta < 0 THEN
    RAISE EXCEPTION 'Los montos no pueden ser negativos';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate validate_stone_attributes function with search_path
CREATE OR REPLACE FUNCTION validate_stone_attributes()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;