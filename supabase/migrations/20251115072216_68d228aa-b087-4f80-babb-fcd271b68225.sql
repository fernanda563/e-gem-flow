-- Add imported_themes column to system_settings table
ALTER TABLE system_settings 
ADD COLUMN IF NOT EXISTS imported_themes JSONB DEFAULT '[]'::jsonb;

-- Add a comment to document the structure
COMMENT ON COLUMN system_settings.imported_themes IS 'Array of up to 4 imported themes from TweakCN. Structure: [{id, name, url, importedAt, light: ThemeColors, dark: ThemeColors}]';