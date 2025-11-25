import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { InternalOrder } from "@/types/internal-orders";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, Eye, Edit, FileDown, Image as ImageIcon, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";

interface InternalOrderListProps {
  onRefresh?: () => void;
}

export const InternalOrderList = ({ onRefresh }: InternalOrderListProps) => {
  const [orders, setOrders] = useState<InternalOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<InternalOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterEstatus, setFilterEstatus] = useState("todos");
  const { isAdmin } = useUserRole();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, searchTerm, filterTipo, filterEstatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('purchase_orders_internal')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data || []) as InternalOrder[]);
    } catch (error: any) {
      console.error('Error fetching internal orders:', error);
      toast.error("Error al cargar órdenes internas");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.proveedor_nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterTipo !== "todos") {
      filtered = filtered.filter(order => order.tipo_producto === filterTipo);
    }

    if (filterEstatus !== "todos") {
      filtered = filtered.filter(order => order.estatus === filterEstatus);
    }

    setFilteredOrders(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente':
        return 'bg-yellow-500';
      case 'en_transito':
        return 'bg-blue-500';
      case 'recibido':
        return 'bg-green-500';
      case 'cancelado':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente':
        return 'bg-yellow-500';
      case 'anticipo':
        return 'bg-orange-500';
      case 'pagado':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatProductType = (type: string) => {
    const types: Record<string, string> = {
      diamante: 'Diamante',
      gema: 'Gema',
      anillo: 'Anillo',
      collar: 'Collar',
      arete: 'Arete',
      dije: 'Dije',
      cadena: 'Cadena',
      componente: 'Componente',
      otro: 'Otro',
    };
    return types[type] || type;
  };

  const formatStatus = (status: string) => {
    const statuses: Record<string, string> = {
      pendiente: 'Pendiente',
      en_transito: 'En Tránsito',
      recibido: 'Recibido',
      cancelado: 'Cancelado',
    };
    return statuses[status] || status;
  };

  const handleDownloadInvoice = (url: string) => {
    window.open(url, '_blank');
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta orden?')) return;

    try {
      const { error } = await supabase
        .from('purchase_orders_internal')
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      toast.success("Orden eliminada exitosamente");
      fetchOrders();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error deleting order:', error);
      toast.error("Error al eliminar la orden");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterTipo} onValueChange={setFilterTipo}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Tipo de producto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="diamante">Diamante</SelectItem>
            <SelectItem value="gema">Gema</SelectItem>
            <SelectItem value="anillo">Anillo</SelectItem>
            <SelectItem value="collar">Collar</SelectItem>
            <SelectItem value="arete">Arete</SelectItem>
            <SelectItem value="dije">Dije</SelectItem>
            <SelectItem value="cadena">Cadena</SelectItem>
            <SelectItem value="componente">Componente</SelectItem>
            <SelectItem value="otro">Otro</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterEstatus} onValueChange={setFilterEstatus}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Estatus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="en_transito">En Tránsito</SelectItem>
            <SelectItem value="recibido">Recibido</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>

        {(searchTerm || filterTipo !== "todos" || filterEstatus !== "todos") && (
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setFilterTipo("todos");
              setFilterEstatus("todos");
            }}
          >
            Limpiar
          </Button>
        )}
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Estatus</TableHead>
              <TableHead>Fecha Compra</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No se encontraron órdenes internas
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {order.id.slice(0, 8)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{order.proveedor_nombre}</TableCell>
                  <TableCell>{formatProductType(order.tipo_producto)}</TableCell>
                  <TableCell>{order.cantidad}</TableCell>
                  <TableCell>
                    ${order.precio_compra.toLocaleString('es-MX')} {order.moneda}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge className={getStatusColor(order.estatus)}>
                        {formatStatus(order.estatus)}
                      </Badge>
                      <Badge className={getPaymentStatusColor(order.estatus_pago)} variant="outline">
                        {order.estatus_pago}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.fecha_compra), "PP", { locale: es })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadInvoice(order.factura_pdf_url)}>
                          <FileDown className="h-4 w-4 mr-2" />
                          Descargar Factura
                        </DropdownMenuItem>
                        {order.imagenes_producto.length > 0 && (
                          <DropdownMenuItem>
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Ver Imágenes ({order.imagenes_producto.length})
                          </DropdownMenuItem>
                        )}
                        {isAdmin() && (
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(order.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
