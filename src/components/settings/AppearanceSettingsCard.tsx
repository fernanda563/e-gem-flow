import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Palette, Loader2 } from "lucide-react";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { Skeleton } from "@/components/ui/skeleton";

export function AppearanceSettingsCard() {
  const { settings, loading, updateSetting } = useSystemSettings('appearance');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    theme: 'system',
  });

  useEffect(() => {
    if (!loading && settings) {
      setFormData({
        theme: settings.theme || 'system',
      });
    }
  }, [loading, settings]);

  const handleSave = async () => {
    setSaving(true);
    
    await updateSetting('theme', formData.theme, 'appearance');
    
    setSaving(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-foreground" />
          <CardTitle>Personalización</CardTitle>
        </div>
        <CardDescription>
          Tema y apariencia de la aplicación
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="theme">Tema</Label>
          <Select value={formData.theme} onValueChange={(value) => setFormData({ ...formData, theme: value })}>
            <SelectTrigger id="theme">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">Sistema (predeterminado)</SelectItem>
              <SelectItem value="light">Claro</SelectItem>
              <SelectItem value="dark">Oscuro</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            El tema del sistema se ajustará automáticamente según la configuración de tu dispositivo
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Aplicar Tema
        </Button>
      </CardContent>
    </Card>
  );
}
