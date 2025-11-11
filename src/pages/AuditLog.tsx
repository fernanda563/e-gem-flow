import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar, Search, FileText, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Profile {
  id: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
}

interface DeletionLog {
  id: string;
  order_id: string;
  order_custom_id: string | null;
  deleted_by: string;
  deleted_at: string;
  order_data: any;
  client_name: string;
  deleted_by_profile?: Profile;
}

const AuditLog = () => {
  const [logs, setLogs] = useState<DeletionLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<DeletionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Profile[]>([]);
  
  // Filtros
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [clientSearch, setClientSearch] = useState("");
  
  // Modal
  const [selectedLog, setSelectedLog] = useState<DeletionLog | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    fetchLogs();
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, startDate, endDate, selectedUser, clientSearch]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("order_deletion_logs")
        .select("*")
        .order("deleted_at", { ascending: false });

      if (error) throw error;
      
      // Fetch profiles separately
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(log => log.deleted_by))];
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, nombre, apellido_paterno, apellido_materno")
          .in("id", userIds);

        // Merge profiles with logs
        const logsWithProfiles = data.map(log => ({
          ...log,
          deleted_by_profile: profilesData?.find(p => p.id === log.deleted_by)
        }));

        setLogs(logsWithProfiles);
        setFilteredLogs(logsWithProfiles);
      } else {
        setLogs(data || []);
        setFilteredLogs(data || []);
      }
    } catch (error: any) {
      console.error("Error al cargar logs:", error);
      toast.error("Error al cargar el log de auditoría");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, nombre, apellido_paterno, apellido_materno")
      .order("nombre");
    
    if (data) setUsers(data);
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // Filtro por rango de fechas
    if (startDate) {
      filtered = filtered.filter(log => 
        new Date(log.deleted_at) >= startDate
      );
    }
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      filtered = filtered.filter(log => 
        new Date(log.deleted_at) <= endOfDay
      );
    }

    // Filtro por usuario
    if (selectedUser !== "all") {
      filtered = filtered.filter(log => log.deleted_by === selectedUser);
    }

    // Filtro por cliente
    if (clientSearch) {
      filtered = filtered.filter(log =>
        log.client_name.toLowerCase().includes(clientSearch.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  };

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedUser("all");
    setClientSearch("");
  };

  const getUserName = (profile?: Profile) => {
    if (!profile) return "Usuario desconocido";
    const fullName = `${profile.nombre} ${profile.apellido_paterno}`;
    return profile.apellido_materno ? `${fullName} ${profile.apellido_materno}` : fullName;
  };

  const formatOrderData = (orderData: any) => {
    if (!orderData) return {};
    
    return {
      "ID Personalizado": orderData.custom_id || "N/A",
      "Tipo de Accesorio": orderData.tipo_accesorio || "N/A",
      "Talla": orderData.talla || "N/A",
      "Precio de Venta": `$${orderData.precio_venta?.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
      "Anticipo": `$${orderData.importe_anticipo?.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
      "Forma de Pago": orderData.forma_pago || "N/A",
      "Estatus de Pago": orderData.estatus_pago || "N/A",
      "Metal": `${orderData.metal_tipo}${orderData.metal_pureza ? ` - ${orderData.metal_pureza}` : ""}${orderData.metal_color ? ` ${orderData.metal_color}` : ""}`,
      "Piedra": orderData.piedra_tipo || "N/A",
      "Cliente": orderData.client_info ? `${orderData.client_info.nombre} ${orderData.client_info.apellido}` : "N/A",
      "Email Cliente": orderData.client_info?.email || "N/A",
      "Fecha de Creación": orderData.created_at ? format(new Date(orderData.created_at), "PPp", { locale: es }) : "N/A",
    };
  };

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Log de Auditoría</h1>
        <p className="text-muted-foreground mt-2">
          Historial completo de órdenes eliminadas del sistema
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
          <CardDescription>
            Filtra los registros por fecha, usuario y cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Fecha Inicio */}
            <div className="space-y-2">
              <Label>Fecha Inicio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP", { locale: es }) : "Seleccionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Fecha Fin */}
            <div className="space-y-2">
              <Label>Fecha Fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP", { locale: es }) : "Seleccionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Usuario */}
            <div className="space-y-2">
              <Label>Usuario que Eliminó</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los usuarios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los usuarios</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {getUserName(user)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cliente */}
            <div className="space-y-2">
              <Label>Buscar Cliente</Label>
              <Input
                placeholder="Nombre del cliente..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={clearFilters}>
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Eliminaciones</CardTitle>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredLogs.length}</div>
            <p className="text-xs text-muted-foreground">
              Registros en el periodo seleccionado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Eliminación</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredLogs.length > 0
                ? format(new Date(filteredLogs[0].deleted_at), "dd/MM/yy")
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredLogs.length > 0
                ? format(new Date(filteredLogs[0].deleted_at), "HH:mm", { locale: es })
                : "Sin registros"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(filteredLogs.map(log => log.deleted_by)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Usuarios con eliminaciones
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Eliminación</CardTitle>
          <CardDescription>
            Haz clic en una fila para ver los detalles completos de la orden
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron registros con los filtros aplicados
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha y Hora</TableHead>
                    <TableHead>ID Orden</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow 
                      key={log.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        setSelectedLog(log);
                        setIsDetailOpen(true);
                      }}
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {format(new Date(log.deleted_at), "PPP", { locale: es })}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(log.deleted_at), "HH:mm:ss", { locale: es })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {log.order_custom_id || log.order_id.slice(0, 8)}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.client_name}</TableCell>
                      <TableCell>
                        {getUserName(log.deleted_by_profile as Profile)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                            setIsDetailOpen(true);
                          }}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalle */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Detalles de Orden Eliminada</DialogTitle>
            <DialogDescription>
              Snapshot completo de la orden al momento de su eliminación
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Metadata de la eliminación */}
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase">
                    Información de Auditoría
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium">Eliminado por:</span>
                      <p className="text-sm text-muted-foreground">
                        {getUserName(selectedLog.deleted_by_profile as Profile)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Fecha de eliminación:</span>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(selectedLog.deleted_at), "PPPp", { locale: es })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Datos de la orden */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase">
                    Datos de la Orden
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(formatOrderData(selectedLog.order_data)).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <span className="text-sm font-medium">{key}:</span>
                        <p className="text-sm text-muted-foreground">{value as string}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Datos adicionales */}
                {selectedLog.order_data?.notas && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase">
                      Notas Adicionales
                    </h3>
                    <p className="text-sm bg-muted/50 p-3 rounded">
                      {selectedLog.order_data.notas}
                    </p>
                  </div>
                )}

                {/* JSON completo (colapsable) */}
                <details className="space-y-2">
                  <summary className="cursor-pointer font-semibold text-sm text-muted-foreground uppercase">
                    Ver JSON Completo
                  </summary>
                  <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
                    {JSON.stringify(selectedLog.order_data, null, 2)}
                  </pre>
                </details>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditLog;
