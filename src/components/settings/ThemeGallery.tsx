import { useState } from 'react';
import { ImportedTheme } from '@/lib/theme-presets';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Calendar, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ThemeGalleryProps {
  importedThemes: ImportedTheme[];
  activeThemeId?: string;
  onApply: (themeId: string) => Promise<void>;
}

export function ThemeGallery({ importedThemes, activeThemeId, onApply }: ThemeGalleryProps) {
  const [applying, setApplying] = useState<string | null>(null);

  const handleApply = async (themeId: string) => {
    setApplying(themeId);
    try {
      await onApply(themeId);
    } finally {
      setApplying(null);
    }
  };

  if (importedThemes.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No hay temas importados. Ve a la pestaña "Importar TweakCN" para agregar temas.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {importedThemes.map((theme) => {
          const isActive = activeThemeId === theme.id;
          const isApplying = applying === theme.id;
          const importDate = new Date(theme.importedAt);
          const formattedDate = importDate.toLocaleString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <Card
              key={theme.id}
              className={isActive ? 'ring-2 ring-primary' : ''}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{theme.name}</CardTitle>
                    <CardDescription className="text-xs mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formattedDate}
                    </CardDescription>
                    {theme.url && (
                      <CardDescription className="text-xs mt-1 flex items-center gap-1 truncate">
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{theme.url}</span>
                      </CardDescription>
                    )}
                  </div>
                  {isActive && <Check className="h-5 w-5 text-primary flex-shrink-0 ml-2" />}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Preview de colores */}
                <div className="space-y-2">
                  <p className="text-xs font-medium">Modo Claro</p>
                  <div className="flex gap-1 h-8 rounded overflow-hidden border">
                    <div
                      className="flex-1"
                      style={{ backgroundColor: `hsl(${theme.light.background})` }}
                    />
                    <div
                      className="flex-1"
                      style={{ backgroundColor: `hsl(${theme.light.primary})` }}
                    />
                    <div
                      className="flex-1"
                      style={{ backgroundColor: `hsl(${theme.light.secondary})` }}
                    />
                    <div
                      className="flex-1"
                      style={{ backgroundColor: `hsl(${theme.light.accent})` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium">Modo Oscuro</p>
                  <div className="flex gap-1 h-8 rounded overflow-hidden border">
                    <div
                      className="flex-1"
                      style={{ backgroundColor: `hsl(${theme.dark.background})` }}
                    />
                    <div
                      className="flex-1"
                      style={{ backgroundColor: `hsl(${theme.dark.primary})` }}
                    />
                    <div
                      className="flex-1"
                      style={{ backgroundColor: `hsl(${theme.dark.secondary})` }}
                    />
                    <div
                      className="flex-1"
                      style={{ backgroundColor: `hsl(${theme.dark.accent})` }}
                    />
                  </div>
                </div>

                <Button
                  onClick={() => handleApply(theme.id)}
                  disabled={isApplying || isActive}
                  variant={isActive ? 'secondary' : 'default'}
                  size="sm"
                  className="w-full"
                >
                  {isApplying
                    ? 'Aplicando...'
                    : isActive
                    ? 'Activo'
                    : 'Aplicar Tema'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
