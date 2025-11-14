-- Tabla para guardar las conexiones de Google Calendar
CREATE TABLE IF NOT EXISTS public.google_calendar_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id TEXT NOT NULL,
  calendar_name TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  connected_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(calendar_id)
);

-- Tabla para mapear qué roles tienen acceso a qué calendarios
CREATE TABLE IF NOT EXISTS public.calendar_role_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_connection_id UUID REFERENCES public.google_calendar_connections(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(calendar_connection_id, role)
);

-- Enable RLS
ALTER TABLE public.google_calendar_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_role_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies para google_calendar_connections
CREATE POLICY "Admins can view all calendar connections"
ON public.google_calendar_connections
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'administrador'::app_role));

CREATE POLICY "Admins can insert calendar connections"
ON public.google_calendar_connections
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'administrador'::app_role));

CREATE POLICY "Admins can update calendar connections"
ON public.google_calendar_connections
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'administrador'::app_role));

CREATE POLICY "Admins can delete calendar connections"
ON public.google_calendar_connections
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'administrador'::app_role));

-- RLS Policies para calendar_role_access
CREATE POLICY "Admins can view all calendar role access"
ON public.calendar_role_access
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'administrador'::app_role));

CREATE POLICY "Admins can insert calendar role access"
ON public.calendar_role_access
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'administrador'::app_role));

CREATE POLICY "Admins can update calendar role access"
ON public.calendar_role_access
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'administrador'::app_role));

CREATE POLICY "Admins can delete calendar role access"
ON public.calendar_role_access
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'administrador'::app_role));

-- Trigger para actualizar updated_at
CREATE TRIGGER update_google_calendar_connections_updated_at
BEFORE UPDATE ON public.google_calendar_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();