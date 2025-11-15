import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Globe, Loader2 } from "lucide-react";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export function RegionalSettingsCard() {
  const { settings, loading, updateSetting } = useSystemSettings('regional');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    timezone: 'America/Mexico_City',
    date_format: 'DD/MM/YYYY',
    currency: 'MXN',
    language: 'es',
  });

  useEffect(() => {
    if (!loading && settings) {
      setFormData({
        timezone: settings.timezone || 'America/Mexico_City',
        date_format: settings.date_format || 'DD/MM/YYYY',
        currency: settings.currency || 'MXN',
        language: settings.language || 'es',
      });
    }
  }, [loading, settings]);

  const handleSave = async () => {
    setSaving(true);
    
    await Promise.all([
      updateSetting('timezone', formData.timezone, 'regional'),
      updateSetting('date_format', formData.date_format, 'regional'),
      updateSetting('currency', formData.currency, 'regional'),
      updateSetting('language', formData.language, 'regional'),
    ]);
    
    setSaving(false);
  };

  const getDatePreview = () => {
    const now = new Date();
    switch (formData.date_format) {
      case 'DD/MM/YYYY':
        return format(now, 'dd/MM/yyyy');
      case 'MM/DD/YYYY':
        return format(now, 'MM/dd/yyyy');
      case 'YYYY-MM-DD':
        return format(now, 'yyyy-MM-dd');
      default:
        return format(now, 'dd/MM/yyyy');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <CardTitle>Regionalización</CardTitle>
        </div>
        <CardDescription>
          Idioma, zona horaria y formato de fecha
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="timezone">Zona Horaria</Label>
          <Select value={formData.timezone} onValueChange={(value) => setFormData({ ...formData, timezone: value })}>
            <SelectTrigger id="timezone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="America/Mexico_City">Ciudad de México (GMT-6)</SelectItem>
              <SelectItem value="America/Tijuana">Tijuana (GMT-8)</SelectItem>
              <SelectItem value="America/Monterrey">Monterrey (GMT-6)</SelectItem>
              <SelectItem value="America/Cancun">Cancún (GMT-5)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date_format">Formato de Fecha</Label>
          <Select value={formData.date_format} onValueChange={(value) => setFormData({ ...formData, date_format: value })}>
            <SelectTrigger id="date_format">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Vista previa: {getDatePreview()}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Moneda</Label>
          <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
            <SelectTrigger id="currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
              <SelectItem value="USD">USD - Dólar Estadounidense</SelectItem>
              <SelectItem value="EUR">EUR - Euro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">Idioma</Label>
          <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
            <SelectTrigger id="language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar Preferencias
        </Button>
      </CardContent>
    </Card>
  );
}
