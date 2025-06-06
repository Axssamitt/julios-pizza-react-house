
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HomeConfig {
  id: string;
  titulo_hero: string;
  subtitulo_hero: string;
}

export const HomeConfigManager = () => {
  const [config, setConfig] = useState<HomeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    titulo_hero: 'As Melhores Pizzas de Londrina',
    subtitulo_hero: 'Sabor autêntico que vai até você. Pizzas artesanais feitas com ingredientes frescos e muito amor.'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('home_config')
        .select('*')
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar configurações:', error);
        throw error;
      }
      
      if (data) {
        setConfig(data);
        setFormData({
          titulo_hero: data.titulo_hero,
          subtitulo_hero: data.subtitulo_hero
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações da home.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (config) {
        // Atualizar configuração existente
        const { error } = await supabase
          .from('home_config')
          .update({
            titulo_hero: formData.titulo_hero,
            subtitulo_hero: formData.subtitulo_hero,
            updated_at: new Date().toISOString()
          })
          .eq('id', config.id);

        if (error) throw error;
      } else {
        // Criar nova configuração
        const { data, error } = await supabase
          .from('home_config')
          .insert({
            titulo_hero: formData.titulo_hero,
            subtitulo_hero: formData.subtitulo_hero
          })
          .select()
          .single();

        if (error) throw error;
        setConfig(data);
      }

      toast({
        title: "Sucesso",
        description: "Configurações da home atualizadas com sucesso!",
      });
      fetchConfig();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-700 rounded w-1/4"></div>
            <div className="h-10 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-1/4"></div>
            <div className="h-20 bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Configurações da Página Principal</CardTitle>
        <CardDescription className="text-gray-400">
          Edite os textos exibidos na seção principal da home
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="titulo_hero" className="text-gray-300">Título Principal</Label>
            <Input
              id="titulo_hero"
              value={formData.titulo_hero}
              onChange={(e) => setFormData(prev => ({ ...prev, titulo_hero: e.target.value }))}
              placeholder="As Melhores Pizzas de Londrina"
              required
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="subtitulo_hero" className="text-gray-300">Subtítulo</Label>
            <Textarea
              id="subtitulo_hero"
              value={formData.subtitulo_hero}
              onChange={(e) => setFormData(prev => ({ ...prev, subtitulo_hero: e.target.value }))}
              placeholder="Sabor autêntico que vai até você. Pizzas artesanais feitas com ingredientes frescos e muito amor."
              required
              rows={3}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <Button 
            type="submit" 
            className="bg-orange-600 hover:bg-orange-700"
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
