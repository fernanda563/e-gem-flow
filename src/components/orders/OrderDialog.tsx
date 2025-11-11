import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Order } from "@/pages/Orders";
import type { Client } from "@/pages/CRM";

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: Order | null;
  onSuccess: () => void;
}

const OrderDialog = ({ open, onOpenChange, order, onSuccess }: OrderDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);

  // Financial data
  const [selectedClientId, setSelectedClientId] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [importeAnticipo, setImporteAnticipo] = useState("");
  const [formaPago, setFormaPago] = useState("");
  const [estatusPago, setEstatusPago] = useState("anticipo_recibido");

  // Metal data
  const [metalTipo, setMetalTipo] = useState<"oro" | "plata" | "platino">("oro");
  const [metalPureza, setMetalPureza] = useState<string>("");
  const [metalColor, setMetalColor] = useState<string>("");

  // Stone data
  const [piedraTipo, setPiedraTipo] = useState<"diamante" | "gema">("diamante");
  
  // Diamond data
  const [diamanteColor, setDiamanteColor] = useState("");
  const [diamanteClaridad, setDiamanteClaridad] = useState("");
  const [diamanteCorte, setDiamanteCorte] = useState("");
  const [diamanteQuilataje, setDiamanteQuilataje] = useState("");
  const [diamanteForma, setDiamanteForma] = useState("");

  // Gem data
  const [gemaObservaciones, setGemaObservaciones] = useState("");

  // Notes
  const [notas, setNotas] = useState("");

  useEffect(() => {
    if (open) {
      fetchClients();
      if (order) {
        // Load order data
        setSelectedClientId(order.client_id);
        setPrecioVenta(order.precio_venta.toString());
        setImporteAnticipo(order.importe_anticipo.toString());
        setFormaPago(order.forma_pago);
        setEstatusPago(order.estatus_pago);
        setMetalTipo(order.metal_tipo as any);
        setMetalPureza(order.metal_pureza || "");
        setMetalColor(order.metal_color || "");
        setPiedraTipo(order.piedra_tipo as any);
        setDiamanteColor(order.diamante_color || "");
        setDiamanteClaridad(order.diamante_claridad || "");
        setDiamanteCorte(order.diamante_corte || "");
        setDiamanteQuilataje(order.diamante_quilataje?.toString() || "");
        setDiamanteForma(order.diamante_forma || "");
        setGemaObservaciones(order.gema_observaciones || "");
        setNotas(order.notas || "");
      } else {
        resetForm();
      }
    }
  }, [open, order]);

  const resetForm = () => {
    setSelectedClientId("");
    setPrecioVenta("");
    setImporteAnticipo("");
    setFormaPago("");
    setEstatusPago("anticipo_recibido");
    setMetalTipo("oro");
    setMetalPureza("");
    setMetalColor("");
    setPiedraTipo("diamante");
    setDiamanteColor("");
    setDiamanteClaridad("");
    setDiamanteCorte("");
    setDiamanteQuilataje("");
    setDiamanteForma("");
    setGemaObservaciones("");
    setNotas("");
  };

  const fetchClients = async () => {
    const { data } = await supabase
      .from("clients")
      .select("*")
      .order("nombre");
    if (data) setClients(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClientId) {
      toast.error("Selecciona un cliente");
      return;
    }

    if (parseFloat(importeAnticipo) > parseFloat(precioVenta)) {
      toast.error("El anticipo no puede ser mayor al precio de venta");
      return;
    }

    setLoading(true);

    try {
      const orderData: any = {
        client_id: selectedClientId,
        precio_venta: parseFloat(precioVenta),
        importe_anticipo: parseFloat(importeAnticipo),
        forma_pago: formaPago,
        estatus_pago: estatusPago,
        metal_tipo: metalTipo,
        metal_pureza: metalTipo === "oro" ? metalPureza : null,
        metal_color: metalTipo === "oro" ? metalColor : null,
        piedra_tipo: piedraTipo,
        notas: notas || null,
      };

      if (piedraTipo === "diamante") {
        orderData.diamante_color = diamanteColor || null;
        orderData.diamante_claridad = diamanteClaridad || null;
        orderData.diamante_corte = diamanteCorte || null;
        orderData.diamante_quilataje = diamanteQuilataje ? parseFloat(diamanteQuilataje) : null;
        orderData.diamante_forma = diamanteForma;
        orderData.gema_observaciones = null;
      } else {
        orderData.diamante_color = null;
        orderData.diamante_claridad = null;
        orderData.diamante_corte = null;
        orderData.diamante_quilataje = null;
        orderData.diamante_forma = null;
        orderData.gema_observaciones = gemaObservaciones || null;
      }

      if (order) {
        const { error } = await supabase
          .from("orders")
          .update(orderData)
          .eq("id", order.id);

        if (error) throw error;
        toast.success("Orden actualizada exitosamente");
      } else {
        const { error } = await supabase.from("orders").insert([orderData]);

        if (error) throw error;
        toast.success("Orden creada exitosamente");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Error al guardar orden");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{order ? "Editar Orden" : "Nueva Orden de Compra"}</DialogTitle>
          <DialogDescription>
            {order
              ? "Modifica los detalles de la orden"
              : "Completa la información para crear una nueva orden"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="client" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="client">Cliente y Pago</TabsTrigger>
              <TabsTrigger value="metal">Metal</TabsTrigger>
              <TabsTrigger value="stone">Piedra</TabsTrigger>
              <TabsTrigger value="notes">Notas</TabsTrigger>
            </TabsList>

            {/* Tab 1: Client and Payment */}
            <TabsContent value="client" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="client">Cliente *</Label>
                <Select
                  value={selectedClientId}
                  onValueChange={setSelectedClientId}
                  disabled={loading || !!order}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nombre} {c.apellido}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="precio">Precio de Venta *</Label>
                  <Input
                    id="precio"
                    type="number"
                    step="0.01"
                    min="0"
                    value={precioVenta}
                    onChange={(e) => setPrecioVenta(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="anticipo">Anticipo *</Label>
                  <Input
                    id="anticipo"
                    type="number"
                    step="0.01"
                    min="0"
                    value={importeAnticipo}
                    onChange={(e) => setImporteAnticipo(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="forma_pago">Forma de Pago *</Label>
                  <Select value={formaPago} onValueChange={setFormaPago} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="transferencia">Transferencia</SelectItem>
                      <SelectItem value="tarjeta">Tarjeta</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estatus_pago">Estatus de Pago *</Label>
                  <Select value={estatusPago} onValueChange={setEstatusPago} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anticipo_recibido">Anticipo Recibido</SelectItem>
                      <SelectItem value="liquidado">Liquidado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {precioVenta && importeAnticipo && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium text-foreground">Saldo Pendiente:</p>
                  <p className="text-2xl font-bold text-warning">
                    ${(parseFloat(precioVenta) - parseFloat(importeAnticipo)).toLocaleString("es-MX")}
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Tab 2: Metal */}
            <TabsContent value="metal" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Tipo de Metal *</Label>
                <Select
                  value={metalTipo}
                  onValueChange={(value: any) => setMetalTipo(value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oro">Oro</SelectItem>
                    <SelectItem value="plata">Plata</SelectItem>
                    <SelectItem value="platino">Platino</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {metalTipo === "oro" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pureza del Oro *</Label>
                    <Select
                      value={metalPureza}
                      onValueChange={setMetalPureza}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10k">10k</SelectItem>
                        <SelectItem value="14k">14k</SelectItem>
                        <SelectItem value="18k">18k</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Color del Oro *</Label>
                    <Select value={metalColor} onValueChange={setMetalColor} disabled={loading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="amarillo">Amarillo</SelectItem>
                        <SelectItem value="blanco">Blanco</SelectItem>
                        <SelectItem value="rosado">Rosado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Tab 3: Stone */}
            <TabsContent value="stone" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Tipo de Piedra *</Label>
                <Select
                  value={piedraTipo}
                  onValueChange={(value: any) => setPiedraTipo(value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diamante">Diamante</SelectItem>
                    <SelectItem value="gema">Gema</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {piedraTipo === "diamante" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Forma *</Label>
                      <Select
                        value={diamanteForma}
                        onValueChange={setDiamanteForma}
                        disabled={loading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="redondo">Redondo</SelectItem>
                          <SelectItem value="esmeralda">Esmeralda</SelectItem>
                          <SelectItem value="radiante">Radiante</SelectItem>
                          <SelectItem value="marqui">Marquí</SelectItem>
                          <SelectItem value="oval">Oval</SelectItem>
                          <SelectItem value="princesa">Princesa</SelectItem>
                          <SelectItem value="cojin">Cojín</SelectItem>
                          <SelectItem value="pera">Pera</SelectItem>
                          <SelectItem value="corazon">Corazón</SelectItem>
                          <SelectItem value="asscher">Asscher</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Quilataje *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={diamanteQuilataje}
                        onChange={(e) => setDiamanteQuilataje(e.target.value)}
                        disabled={loading}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Color</Label>
                      <Input
                        value={diamanteColor}
                        onChange={(e) => setDiamanteColor(e.target.value)}
                        disabled={loading}
                        placeholder="Ej: D, E, F..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Claridad</Label>
                      <Input
                        value={diamanteClaridad}
                        onChange={(e) => setDiamanteClaridad(e.target.value)}
                        disabled={loading}
                        placeholder="Ej: IF, VVS1..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Corte</Label>
                      <Input
                        value={diamanteCorte}
                        onChange={(e) => setDiamanteCorte(e.target.value)}
                        disabled={loading}
                        placeholder="Ej: Excellent..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {piedraTipo === "gema" && (
                <div className="space-y-2">
                  <Label>Observaciones de la Gema</Label>
                  <Textarea
                    value={gemaObservaciones}
                    onChange={(e) => setGemaObservaciones(e.target.value)}
                    disabled={loading}
                    placeholder="Describe la gema, su tipo, características, etc."
                    rows={5}
                  />
                </div>
              )}
            </TabsContent>

            {/* Tab 4: Notes */}
            <TabsContent value="notes" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Notas Adicionales</Label>
                <Textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  disabled={loading}
                  placeholder="Detalles adicionales sobre la orden..."
                  rows={8}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>{order ? "Actualizar Orden" : "Crear Orden"}</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDialog;
