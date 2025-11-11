import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoneTimelineProps {
  orderId: string;
  currentStatus: string;
  onUpdate: () => void;
}

const STONE_STATUSES = [
  { value: "en_busqueda", label: "En proceso de búsqueda" },
  { value: "piedra_comprada", label: "Piedra comprada" },
  { value: "piedra_transito_pobox", label: "Piedra en tránsito a PO Box" },
  { value: "piedra_pobox", label: "Piedra en PO Box" },
  { value: "piedra_levant", label: "Piedra en Levant" },
  { value: "piedra_con_disenador", label: "Piedra con diseñador" },
  { value: "piedra_en_taller", label: "Piedra en taller" },
  { value: "piedra_montada", label: "Piedra montada" },
];

export const StoneTimeline = ({ orderId, currentStatus, onUpdate }: StoneTimelineProps) => {
  const currentIndex = STONE_STATUSES.findIndex((s) => s.value === currentStatus);

  const handleStatusClick = async (statusValue: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ estatus_piedra: statusValue })
        .eq("id", orderId);

      if (error) throw error;
      toast.success("Estado de piedra actualizado");
      onUpdate();
    } catch (error) {
      console.error("Error updating stone status:", error);
      toast.error("Error al actualizar el estado");
    }
  };

  return (
    <div className="space-y-2">
      {STONE_STATUSES.map((status, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isClickable = index <= currentIndex + 1;

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
              !isClickable && "opacity-50 cursor-not-allowed"
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
