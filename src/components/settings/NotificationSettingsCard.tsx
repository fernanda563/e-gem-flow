import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, Loader2 } from "lucide-react";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { Skeleton } from "@/components/ui/skeleton";

export function NotificationSettingsCard() {
  const { settings, loading, updateSetting } = useSystemSettings('notifications');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    notifications_enabled: true,
    email_notifications: true,
    reminder_notifications: true,
    production_alerts: true,
  });

  useEffect(() => {
    if (!loading && settings) {
      setFormData({
        notifications_enabled: settings.notifications_enabled ?? true,
        email_notifications: settings.email_notifications ?? true,
        reminder_notifications: settings.reminder_notifications ?? true,
        production_alerts: settings.production_alerts ?? true,
      });
    }
  }, [loading, settings]);

  const handleSave = async () => {
    setSaving(true);
    
    await Promise.all([
      updateSetting('notifications_enabled', formData.notifications_enabled, 'notifications'),
      updateSetting('email_notifications', formData.email_notifications, 'notifications'),
      updateSetting('reminder_notifications', formData.reminder_notifications, 'notifications'),
      updateSetting('production_alerts', formData.production_alerts, 'notifications'),
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
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <CardTitle>Notificaciones</CardTitle>
        </div>
        <CardDescription>
          Gestiona las notificaciones del sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notifications_enabled">Notificaciones Generales</Label>
            <p className="text-sm text-muted-foreground">
              Habilitar todas las notificaciones del sistema
            </p>
          </div>
          <Switch
            id="notifications_enabled"
            checked={formData.notifications_enabled}
            onCheckedChange={(checked) => setFormData({ ...formData, notifications_enabled: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email_notifications">Notificaciones por Email</Label>
            <p className="text-sm text-muted-foreground">
              Recibir notificaciones por correo electrónico
            </p>
          </div>
          <Switch
            id="email_notifications"
            checked={formData.email_notifications}
            onCheckedChange={(checked) => setFormData({ ...formData, email_notifications: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="reminder_notifications">Recordatorios Automáticos</Label>
            <p className="text-sm text-muted-foreground">
              Alertas de recordatorios y citas pendientes
            </p>
          </div>
          <Switch
            id="reminder_notifications"
            checked={formData.reminder_notifications}
            onCheckedChange={(checked) => setFormData({ ...formData, reminder_notifications: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="production_alerts">Alertas de Producción</Label>
            <p className="text-sm text-muted-foreground">
              Notificaciones sobre el estado de producción
            </p>
          </div>
          <Switch
            id="production_alerts"
            checked={formData.production_alerts}
            onCheckedChange={(checked) => setFormData({ ...formData, production_alerts: checked })}
          />
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar Configuración
        </Button>
      </CardContent>
    </Card>
  );
}
