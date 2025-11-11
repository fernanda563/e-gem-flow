import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  currentDisenadorId: string | null;
  currentJoyeroId: string | null;
  onSuccess: () => void;
}

export const AssignmentDialog = ({
  open,
  onOpenChange,
  orderId,
  currentDisenadorId,
  currentJoyeroId,
  onSuccess,
}: AssignmentDialogProps) => {
  const [disenadorId, setDisenadorId] = useState(currentDisenadorId || "");
  const [joyeroId, setJoyeroId] = useState(currentJoyeroId || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setDisenadorId(currentDisenadorId || "");
      setJoyeroId(currentJoyeroId || "");
    }
  }, [open, currentDisenadorId, currentJoyeroId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updates: any = {};
      if (disenadorId) updates.disenador_id = disenadorId;
      if (joyeroId) updates.joyero_id = joyeroId;

      const { error } = await supabase
        .from("orders")
        .update(updates)
        .eq("id", orderId);

      if (error) throw error;

      toast.success("Asignaciones actualizadas");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating assignments:", error);
      toast.error("Error al actualizar las asignaciones");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar Diseñador y Joyero</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="disenador">ID del Diseñador</Label>
            <Input
              id="disenador"
              value={disenadorId}
              onChange={(e) => setDisenadorId(e.target.value)}
              placeholder="Ingrese el ID del diseñador"
            />
            <p className="text-xs text-muted-foreground">
              Puedes obtener el ID desde la sección de usuarios
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="joyero">ID del Joyero</Label>
            <Input
              id="joyero"
              value={joyeroId}
              onChange={(e) => setJoyeroId(e.target.value)}
              placeholder="Ingrese el ID del joyero"
            />
            <p className="text-xs text-muted-foreground">
              Puedes obtener el ID desde la sección de usuarios
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Asignaciones"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
