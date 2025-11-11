-- Add missing columns to prospects table
ALTER TABLE prospects 
ADD COLUMN metal_tipo text,
ADD COLUMN incluye_piedra text,
ADD COLUMN largo_aprox text;