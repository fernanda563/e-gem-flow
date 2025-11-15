import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Building2, Loader2 } from "lucide-react";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { Skeleton } from "@/components/ui/skeleton";

export function CompanySettingsCard() {
  const { settings, loading, updateSetting } = useSystemSettings('company');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    company_address: '',
    company_phone: '',
    company_email: '',
  });

  useState(() => {
    if (!loading && settings) {
      setFormData({
        company_name: settings.company_name || '',
        company_address: settings.company_address || '',
        company_phone: settings.company_phone || '',
        company_email: settings.company_email || '',
      });
    }
  });

  const handleSave = async () => {
    setSaving(true);
    
    await Promise.all([
      updateSetting('company_name', formData.company_name, 'company'),
      updateSetting('company_address', formData.company_address, 'company'),
      updateSetting('company_phone', formData.company_phone, 'company'),
      updateSetting('company_email', formData.company_email, 'company'),
    ]);
    
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
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <CardTitle>Información de la Empresa</CardTitle>
        </div>
        <CardDescription>
          Configura los datos básicos de Joyería Relevée
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="company_name">Nombre de la Empresa</Label>
          <Input
            id="company_name"
            value={formData.company_name}
            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
            placeholder="Joyería Relevée"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_address">Dirección</Label>
          <Textarea
            id="company_address"
            value={formData.company_address}
            onChange={(e) => setFormData({ ...formData, company_address: e.target.value })}
            placeholder="Calle, número, colonia, ciudad"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company_phone">Teléfono</Label>
            <Input
              id="company_phone"
              type="tel"
              value={formData.company_phone}
              onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
              placeholder="+52 123 456 7890"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_email">Email</Label>
            <Input
              id="company_email"
              type="email"
              value={formData.company_email}
              onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
              placeholder="contacto@joyeriarelevee.com"
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar Cambios
        </Button>
      </CardContent>
    </Card>
  );
}
