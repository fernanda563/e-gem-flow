import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Trash2, Settings } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type CalendarConnection = {
  id: string;
  calendar_id: string;
  calendar_name: string;
  is_active: boolean;
  created_at: string;
  roles: string[];
};

const AVAILABLE_ROLES = [
  { value: "administrador", label: "Administrador" },
  { value: "disenador", label: "Diseñador" },
  { value: "joyero", label: "Joyero" },
  { value: "gerente_tienda", label: "Gerente de Tienda" },
  { value: "contador", label: "Contador" },
];

const CalendarAdmin = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [calendars, setCalendars] = useState<CalendarConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [editingRoles, setEditingRoles] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  useEffect(() => {
    if (!roleLoading && !isAdmin()) {
      navigate("/");
      return;
    }

    if (isAdmin()) {
      fetchCalendars();
    }
  }, [isAdmin, roleLoading, navigate]);

  const fetchCalendars = async () => {
    try {
      const { data: connections, error } = await supabase
        .from("google_calendar_connections")
        .select(`
          *,
          calendar_role_access(role)
        `);

      if (error) throw error;

      const formatted = connections?.map(conn => ({
        id: conn.id,
        calendar_id: conn.calendar_id,
        calendar_name: conn.calendar_name,
        is_active: conn.is_active,
        created_at: conn.created_at,
        roles: conn.calendar_role_access?.map((r: any) => r.role) || [],
      })) || [];

      setCalendars(formatted);
    } catch (error) {
      console.error("Error fetching calendars:", error);
      toast.error("Error al cargar calendarios");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectCalendar = async () => {
    setConnecting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("No estás autenticado");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar-auth?action=start`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al conectar');
      }

      if (data?.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error("Error connecting calendar:", error);
      toast.error("Error al conectar calendario");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (calendarId: string) => {
    try {
      const { error } = await supabase
        .from("google_calendar_connections")
        .delete()
        .eq("id", calendarId);

      if (error) throw error;

      toast.success("Calendario desconectado");
      fetchCalendars();
    } catch (error) {
      console.error("Error disconnecting calendar:", error);
      toast.error("Error al desconectar calendario");
    }
  };

  const handleEditRoles = (calendar: CalendarConnection) => {
    setEditingRoles(calendar.id);
    setSelectedRoles(calendar.roles);
  };

  const handleSaveRoles = async (calendarId: string) => {
    try {
      await supabase
        .from("calendar_role_access")
        .delete()
        .eq("calendar_connection_id", calendarId);

      if (selectedRoles.length > 0) {
        const { error } = await supabase
          .from("calendar_role_access")
          .insert(
            selectedRoles.map(role => ({
              calendar_connection_id: calendarId,
              role: role as Database["public"]["Enums"]["app_role"],
            }))
          );

        if (error) throw error;
      }

      toast.success("Roles actualizados");
      setEditingRoles(null);
      fetchCalendars();
    } catch (error) {
      console.error("Error saving roles:", error);
      toast.error("Error al guardar roles");
    }
  };

  const toggleRole = (role: string) => {
    setSelectedRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  if (roleLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Administración de Calendarios</h1>
          <p className="text-muted-foreground mt-2">
            Conecta y administra calendarios de Google Calendar
          </p>
        </div>
        <Button onClick={handleConnectCalendar} disabled={connecting}>
          <Plus className="mr-2 h-4 w-4" />
          {connecting ? "Conectando..." : "Conectar Calendario"}
        </Button>
      </div>

      {calendars.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No hay calendarios conectados
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {calendars.map(calendar => (
            <Card key={calendar.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {calendar.calendar_name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {calendar.calendar_id}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {calendar.is_active ? (
                      <Badge variant="default">Activo</Badge>
                    ) : (
                      <Badge variant="secondary">Inactivo</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editingRoles === calendar.id ? (
                  <div className="space-y-4">
                    <Label>Roles con acceso:</Label>
                    <div className="grid gap-2">
                      {AVAILABLE_ROLES.map(role => (
                        <div key={role.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${calendar.id}-${role.value}`}
                            checked={selectedRoles.includes(role.value)}
                            onCheckedChange={() => toggleRole(role.value)}
                          />
                          <label
                            htmlFor={`${calendar.id}-${role.value}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {role.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleSaveRoles(calendar.id)}>
                        Guardar
                      </Button>
                      <Button variant="outline" onClick={() => setEditingRoles(null)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Roles con acceso:
                      </Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {calendar.roles.length === 0 ? (
                          <Badge variant="outline">Sin roles asignados</Badge>
                        ) : (
                          calendar.roles.map(role => (
                            <Badge key={role} variant="secondary">
                              {AVAILABLE_ROLES.find(r => r.value === role)?.label || role}
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditRoles(calendar)}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Configurar Roles
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDisconnect(calendar.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Desconectar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarAdmin;