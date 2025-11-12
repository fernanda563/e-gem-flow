import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";

interface STLUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function STLUploadDialog({ open, onOpenChange, onSuccess }: STLUploadDialogProps) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipoAccesorio, setTipoAccesorio] = useState("");
  const [stlFile, setStlFile] = useState<File | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editFileType, setEditFileType] = useState("");
  const [uploading, setUploading] = useState(false);

  const resetForm = () => {
    setNombre("");
    setDescripcion("");
    setTipoAccesorio("");
    setStlFile(null);
    setEditFile(null);
    setEditFileType("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      toast.error("El nombre del archivo es obligatorio");
      return;
    }

    if (!stlFile) {
      toast.error("Debes seleccionar un archivo STL");
      return;
    }

    if (!tipoAccesorio) {
      toast.error("Debes seleccionar un tipo de accesorio");
      return;
    }

    try {
      setUploading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      // Upload STL file
      const stlFileName = `${Date.now()}_${stlFile.name}`;
      const { data: stlData, error: stlError } = await supabase.storage
        .from("3d-files")
        .upload(`stl/${stlFileName}`, stlFile);

      if (stlError) throw stlError;

      const { data: { publicUrl: stlUrl } } = supabase.storage
        .from("3d-files")
        .getPublicUrl(stlData.path);

      // Upload edit file if provided
      let editUrl = null;
      if (editFile) {
        const editFileName = `${Date.now()}_${editFile.name}`;
        const { data: editData, error: editError } = await supabase.storage
          .from("3d-files")
          .upload(`edit/${editFileName}`, editFile);

        if (editError) throw editError;

        const { data: { publicUrl } } = supabase.storage
          .from("3d-files")
          .getPublicUrl(editData.path);
        editUrl = publicUrl;
      }

      // Insert record into database
      const { error: dbError } = await supabase
        .from("stl_files")
        .insert({
          nombre,
          descripcion: descripcion || null,
          tipo_accesorio: tipoAccesorio,
          stl_file_url: stlUrl,
          edit_file_url: editUrl,
          edit_file_type: editFile && editFileType ? editFileType : null,
          created_by: user.id,
        });

      if (dbError) throw dbError;

      toast.success("Archivo subido exitosamente");
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error al subir el archivo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Subir Archivo STL</DialogTitle>
          <DialogDescription>
            Agrega un nuevo archivo 3D y editable a la colección
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del archivo *</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Anillo Solitario Clásico"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción detallada del archivo..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipoAccesorio">Tipo de accesorio *</Label>
            <Select value={tipoAccesorio} onValueChange={setTipoAccesorio} required>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anillo">Anillo</SelectItem>
                <SelectItem value="collar">Collar</SelectItem>
                <SelectItem value="pulsera">Pulsera</SelectItem>
                <SelectItem value="aretes">Aretes</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stlFile">Archivo STL *</Label>
            <Input
              id="stlFile"
              type="file"
              accept=".stl"
              onChange={(e) => setStlFile(e.target.files?.[0] || null)}
              required
            />
            {stlFile && (
              <p className="text-sm text-muted-foreground">
                Archivo seleccionado: {stlFile.name} ({(stlFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="editFile">Archivo Editable (opcional)</Label>
            <Input
              id="editFile"
              type="file"
              accept=".3dm,.blend"
              onChange={(e) => setEditFile(e.target.files?.[0] || null)}
            />
            {editFile && (
              <p className="text-sm text-muted-foreground">
                Archivo seleccionado: {editFile.name} ({(editFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {editFile && (
            <div className="space-y-2">
              <Label htmlFor="editFileType">Tipo de archivo editable</Label>
              <Select value={editFileType} onValueChange={setEditFileType}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rhino">Rhino (.3dm)</SelectItem>
                  <SelectItem value="blender">Blender (.blend)</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Subir archivo
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
