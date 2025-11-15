import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type SettingCategory = 'company' | 'notifications' | 'regional' | 'appearance';

export const useSystemSettings = (category?: SettingCategory) => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      let query = supabase.from('system_settings').select('*');
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const settingsMap = data?.reduce((acc, setting) => {
        const value = setting.value as { value: any };
        acc[setting.key] = value.value;
        return acc;
      }, {} as Record<string, any>) || {};
      
      setSettings(settingsMap);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las configuraciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any, settingCategory: SettingCategory) => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({ 
          value: { value },
          category: settingCategory 
        })
        .eq('key', key);
      
      if (error) throw error;
      
      setSettings(prev => ({ ...prev, [key]: value }));
      
      toast({
        title: "Éxito",
        description: "Configuración actualizada correctamente",
      });
      
      return true;
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [category]);

  return {
    settings,
    loading,
    updateSetting,
    refetch: fetchSettings,
  };
};
