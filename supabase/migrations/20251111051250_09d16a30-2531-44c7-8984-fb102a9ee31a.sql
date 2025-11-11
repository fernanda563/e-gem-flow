-- Add country code columns to clients table
ALTER TABLE public.clients 
ADD COLUMN telefono_principal_codigo_pais text DEFAULT '+52',
ADD COLUMN telefono_adicional_codigo_pais text DEFAULT '+52';

-- Update existing records to have default country code
UPDATE public.clients 
SET telefono_principal_codigo_pais = '+52',
    telefono_adicional_codigo_pais = '+52'
WHERE telefono_principal_codigo_pais IS NULL;