-- Add imagenes_referencia column to orders table
ALTER TABLE orders ADD COLUMN imagenes_referencia JSONB DEFAULT '[]'::jsonb;

-- Create reference-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('reference-images', 'reference-images', false);

-- RLS policies for reference-images bucket
CREATE POLICY "Usuarios autenticados pueden subir imágenes de referencia"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'reference-images');

CREATE POLICY "Usuarios autenticados pueden ver imágenes de referencia"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'reference-images');

CREATE POLICY "Usuarios autenticados pueden eliminar imágenes de referencia"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'reference-images');