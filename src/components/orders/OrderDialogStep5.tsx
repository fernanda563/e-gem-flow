import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STLViewer } from "@/components/stl/STLViewer";
import { Box } from "lucide-react";

interface STLFile {
  id: string;
  nombre: string;
  descripcion: string | null;
  stl_file_url: string;
  tipo_accesorio: string | null;
}

interface OrderDialogStep5Props {
  notas: string;
  setNotas: (value: string) => void;
  selectedSTLFileId: string;
  setSelectedSTLFileId: (value: string) => void;
  availableSTLFiles: STLFile[];
  loading: boolean;
}

export function OrderDialogStep5({
  notas,
  setNotas,
  selectedSTLFileId,
  setSelectedSTLFileId,
  availableSTLFiles,
  loading,
}: OrderDialogStep5Props) {
  const selectedSTLFile = availableSTLFiles.find(f => f.id === selectedSTLFileId);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Notas Adicionales</Label>
        <Textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          disabled={loading}
          placeholder="Detalles adicionales sobre la orden..."
          rows={4}
        />
      </div>

      {/* STL File Selection */}
      <div className="space-y-3 pt-4 border-t">
        <div className="flex items-center gap-2">
          <Box className="h-5 w-5 text-accent" />
          <Label className="text-base">Archivo STL del Repositorio (Opcional)</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Si este diseño ya existe en el repositorio 3D, selecciónalo aquí. De lo contrario, déjalo en blanco.
        </p>
        
        <Select
          value={selectedSTLFileId}
          onValueChange={setSelectedSTLFileId}
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar archivo STL existente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Ninguno (dejar en blanco)</SelectItem>
            {availableSTLFiles.map((file) => (
              <SelectItem key={file.id} value={file.id}>
                {file.nombre}
                {file.tipo_accesorio && (
                  <span className="text-muted-foreground ml-2 capitalize">
                    ({file.tipo_accesorio})
                  </span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* STL Preview */}
        {selectedSTLFile && (
          <div className="space-y-2 mt-4">
            <p className="text-sm font-medium">Vista previa del archivo STL</p>
            <STLViewer fileUrl={selectedSTLFile.stl_file_url} height="350px" />
            {selectedSTLFile.descripcion && (
              <p className="text-sm text-muted-foreground mt-2">
                {selectedSTLFile.descripcion}
              </p>
            )}
          </div>
        )}

        {availableSTLFiles.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Box className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay archivos STL disponibles en el repositorio</p>
            <p className="text-xs mt-1">Los diseñadores pueden subir archivos 3D desde la vista de producción</p>
          </div>
        )}
      </div>
    </div>
  );
}
