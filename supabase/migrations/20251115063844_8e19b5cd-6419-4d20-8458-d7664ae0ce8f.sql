-- Crear tabla para configuraciones del sistema
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  category text NOT NULL,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- RLS policies
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Solo administradores pueden leer
CREATE POLICY "Admins can read system_settings"
  ON system_settings FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'administrador'::app_role));

-- Solo administradores pueden insertar
CREATE POLICY "Admins can insert system_settings"
  ON system_settings FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'administrador'::app_role));

-- Solo administradores pueden actualizar
CREATE POLICY "Admins can update system_settings"
  ON system_settings FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'administrador'::app_role));

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_system_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER system_settings_timestamp
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_system_settings_timestamp();

-- Insertar configuraciones por defecto
INSERT INTO system_settings (key, value, category) VALUES
  ('company_name', '{"value": "Joyería Relevée"}'::jsonb, 'company'),
  ('company_address', '{"value": ""}'::jsonb, 'company'),
  ('company_phone', '{"value": ""}'::jsonb, 'company'),
  ('company_email', '{"value": ""}'::jsonb, 'company'),
  ('company_logo_url', '{"value": ""}'::jsonb, 'company'),
  
  ('notifications_enabled', '{"value": true}'::jsonb, 'notifications'),
  ('email_notifications', '{"value": true}'::jsonb, 'notifications'),
  ('reminder_notifications', '{"value": true}'::jsonb, 'notifications'),
  ('production_alerts', '{"value": true}'::jsonb, 'notifications'),
  
  ('timezone', '{"value": "America/Mexico_City"}'::jsonb, 'regional'),
  ('date_format', '{"value": "DD/MM/YYYY"}'::jsonb, 'regional'),
  ('currency', '{"value": "MXN"}'::jsonb, 'regional'),
  ('language', '{"value": "es"}'::jsonb, 'regional'),
  
  ('theme', '{"value": "system"}'::jsonb, 'appearance'),
  ('primary_color', '{"value": "hsl(var(--primary))"}'::jsonb, 'appearance')
ON CONFLICT (key) DO NOTHING;