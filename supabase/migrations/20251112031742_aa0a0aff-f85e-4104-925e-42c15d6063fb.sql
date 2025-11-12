-- Create stl_files table
CREATE TABLE public.stl_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  stl_file_url TEXT NOT NULL,
  edit_file_url TEXT,
  edit_file_type TEXT CHECK (edit_file_type IN ('rhino', 'blender', 'otro')),
  thumbnail_url TEXT,
  tipo_accesorio TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stl_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view STL files"
ON public.stl_files
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Designers and admins can insert STL files"
ON public.stl_files
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'disenador'::app_role) OR 
  public.has_role(auth.uid(), 'administrador'::app_role)
);

CREATE POLICY "Designers can update their STL files, admins can update all"
ON public.stl_files
FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid() OR 
  public.has_role(auth.uid(), 'administrador'::app_role)
);

CREATE POLICY "Only admins can delete STL files"
ON public.stl_files
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'administrador'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_stl_files_updated_at
BEFORE UPDATE ON public.stl_files
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add stl_file_id column to orders table
ALTER TABLE public.orders ADD COLUMN stl_file_id UUID REFERENCES public.stl_files(id) ON DELETE SET NULL;

-- Create 3d-files storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('3d-files', '3d-files', false);

-- Storage policies for 3d-files bucket
CREATE POLICY "Authenticated users can view 3D files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = '3d-files');

CREATE POLICY "Designers and admins can upload 3D files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = '3d-files' AND
  (
    public.has_role(auth.uid(), 'disenador'::app_role) OR 
    public.has_role(auth.uid(), 'administrador'::app_role)
  )
);

CREATE POLICY "Designers can update their 3D files, admins can update all"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = '3d-files' AND
  (
    auth.uid()::text = (storage.foldername(name))[1] OR
    public.has_role(auth.uid(), 'administrador'::app_role)
  )
);

CREATE POLICY "Only admins can delete 3D files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = '3d-files' AND
  public.has_role(auth.uid(), 'administrador'::app_role)
);