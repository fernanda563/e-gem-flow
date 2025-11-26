-- Función para actualizar el estatus de piedra al vincular orden de proveedor
CREATE OR REPLACE FUNCTION public.update_stone_status_on_supplier_link()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Si se está vinculando una orden de proveedor (de NULL a un valor)
  -- y el estatus actual es 'en_busqueda', actualizar a 'piedra_comprada'
  IF OLD.internal_order_id IS NULL AND NEW.internal_order_id IS NOT NULL THEN
    IF NEW.estatus_piedra = 'en_busqueda' OR NEW.estatus_piedra IS NULL THEN
      NEW.estatus_piedra := 'piedra_comprada';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Crear trigger que se ejecuta antes de actualizar una orden
CREATE TRIGGER trigger_update_stone_status_on_supplier_link
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  WHEN (OLD.internal_order_id IS DISTINCT FROM NEW.internal_order_id)
  EXECUTE FUNCTION public.update_stone_status_on_supplier_link();