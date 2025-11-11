import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface MountingTimelineProps {
  orderId: string;
  currentStatus: string;
  onUpdate: () => void;
}

const MOUNTING_STATUSES = [
  { value: "en_espera", label: "En espera de iniciar el proceso" },
  { value: "proceso_diseno", label: "En proceso de diseño" },
  { value: "impresion_modelo", label: "Impresión de modelo" },
  { value: "reimpresion_modelo", label: "Reimpresión de modelo" },
  { value: "traslado_modelo", label: "Traslado de modelo" },
  { value: "espera_taller", label: "En espera en taller" },
  { value: "proceso_vaciado", label: "En proceso de vaciado" },
  { value: "pieza_terminada_taller", label: "Pieza terminada en taller" },
  { value: "proceso_recoleccion", label: "En proceso de recolección" },
  { value: "recolectado", label: "Recolectado" },
  { value: "entregado_oyamel", label: "Entregado en Oyamel" },
  { value: "entregado_levant", label: "Entregado en Levant" },
  { value: "no_aplica", label: "No aplica" },
];

export const MountingTimeline = ({
  orderId,
  currentStatus,
  onUpdate,
}: MountingTimelineProps) => {
  const currentIndex = MOUNTING_STATUSES.findIndex((s) => s.value === currentStatus);

  const handleStatusClick = async (statusValue: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ estatus_montura: statusValue })
        .eq("id", orderId);

      if (error) throw error;
      toast.success("Estado de montura actualizado");
      onUpdate();
    } catch (error) {
      console.error("Error updating mounting status:", error);
      toast.error("Error al actualizar el estado");
    }
  };

  return (
    <div className="space-y-2">
      {MOUNTING_STATUSES.map((status, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isClickable = index <= currentIndex + 1 || status.value === "no_aplica";

        return (
          <button
            key={status.value}
            onClick={() => isClickable && handleStatusClick(status.value)}
            disabled={!isClickable}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all",
              isCurrent && "bg-primary/10 border-2 border-primary",
              isCompleted && "bg-muted",
              !isCompleted && !isCurrent && "hover:bg-muted/50",
              !isClickable && "opacity-50 cursor-not-allowed",
              status.value === "no_aplica" && "border border-dashed"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full border-2 flex-shrink-0",
                isCompleted && "bg-primary border-primary",
                isCurrent && "border-primary",
                !isCompleted && !isCurrent && "border-muted-foreground"
              )}
            >
              {isCompleted && <Check className="h-4 w-4 text-primary-foreground" />}
              {isCurrent && (
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              )}
            </div>
            <span
              className={cn(
                "text-sm",
                isCurrent && "font-semibold text-primary",
                isCompleted && "text-muted-foreground line-through",
                !isCompleted && !isCurrent && "text-foreground"
              )}
            >
              {status.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
