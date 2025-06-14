
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HomeConfig {
  id: string;
  titulo_hero: string;
  subtitulo_hero: string;
  align_titulo_hero?: string;
  align_subtitulo_hero?: string;
  texto_sobre: string;
  visivel_sobre: boolean;
  nome_empresa: string;
  visivel_nome_empresa: boolean;
  endereco: string;
  visivel_endereco: boolean;
  telefone: string;
  visivel_telefone: boolean;
  facebook_url: string;
  visivel_facebook: boolean;
  instagram_url: string;
  visivel_instagram: boolean;
}

export const HomeConfigManager = () => {
  const [config, setConfig] = useState<HomeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    titulo_hero: 'As Melhores Pizzas de Londrina',
    align_titulo_hero: 'left',
    subtitulo_hero: 'Sabor autêntico que vai até você. Pizzas artesanais feitas com ingredientes frescos e muito amor.',
    align_subtitulo_hero: 'left',
    texto_sobre: `Julios Pizzas House iniciou suas atividades em 2018 e hoje é uma referência no rodízio de pizzas fazendo a melhor pizza de Londrina Pr. Buscando sempre manter um alto padrão de qualidade visando sempre à satisfação dos nossos clientes.

Todo o processo é rigorosamente acompanhado por mim Julio e minha Equipe, garantindo um atendimento com alto padrão de qualidade.

Prezamos pela comodidade e satisfação dos nossos clientes.

Temos uma vasta experiência em eventos corporativos, com toda estrutura própria e com funcionários constantemente treinados.

Faça o seu rodízio de pizzas sem sair do conforto de sua casa com Julio House Pizza.`,
    visivel_sobre: true,
    nome_empresa: 'Júlio\'s Pizza House',
    visivel_nome_empresa: true,
    endereco: 'Londrina - PR',
    visivel_endereco: true,
    telefone: '(43) 99126-7766',
    visivel_telefone: true,
    facebook_url: 'https://www.facebook.com/JuliosPIZZAHOUSE/',
    visivel_facebook: true,
    instagram_url: 'https://instagram.com/juliospizzahouse',
    visivel_instagram: true
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
          titulo_hero: data.titulo_hero || formData.titulo_hero,
          align_titulo_hero: data.align_titulo_hero || 'left',
          subtitulo_hero: data.subtitulo_hero || formData.subtitulo_hero,
          align_subtitulo_hero: data.align_subtitulo_hero || 'left',
          texto_sobre: data.texto_sobre || formData.texto_sobre,
          visivel_sobre: data.visivel_sobre !== false,
          nome_empresa: data.nome_empresa || formData.nome_empresa,
          visivel_nome_empresa: data.visivel_nome_empresa !== false,
          endereco: data.endereco || formData.endereco,
          visivel_endereco: data.visivel_endereco !== false,
          telefone: data.telefone || formData.telefone,
          visivel_telefone: data.visivel_telefone !== false,
          facebook_url: data.facebook_url || formData.facebook_url,
          visivel_facebook: data.visivel_facebook !== false,
          instagram_url: data.instagram_url || formData.instagram_url,
          visivel_instagram: data.visivel_instagram !== false
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
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', config.id);

        if (error) throw error;
      } else {
        // Criar nova configuração
        const { data, error } = await supabase
          .from('home_config')
          .insert(formData)
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
    <div className="space-y-6">
      {/* Seção Hero */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Configurações da Seção Principal (Hero)</CardTitle>
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
              <Label htmlFor="align_titulo_hero" className="text-gray-300 mt-2">Alinhamento do Título</Label>
              <select
                id="align_titulo_hero"
                value={formData.align_titulo_hero}
                onChange={(e) => setFormData(prev => ({ ...prev, align_titulo_hero: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white w-full p-2 rounded mt-1"
              >
                <option value="left">Esquerda</option>
                <option value="center">Centro</option>
                <option value="right">Direita</option>
              </select>
            </div>
            <div className="mt-4">
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
            <div>
              <Label htmlFor="align_subtitulo_hero" className="text-gray-300 mt-2">Alinhamento do Subtítulo</Label>
              <select
                id="align_subtitulo_hero"
                value={formData.align_subtitulo_hero}
                onChange={(e) => setFormData(prev => ({ ...prev, align_subtitulo_hero: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white w-full p-2 rounded mt-1"
              >
                <option value="left">Esquerda</option>
                <option value="center">Centro</option>
                <option value="right">Direita</option>
              </select>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Seção Sobre Nós */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Configurações - Sobre Nós</CardTitle>
          <CardDescription className="text-gray-400">
            Configure o texto e visibilidade da seção "Sobre Nós"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="visivel_sobre"
                checked={formData.visivel_sobre}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, visivel_sobre: checked }))}
              />
              <Label htmlFor="visivel_sobre" className="text-gray-300">
                Exibir seção "Sobre Nós" na página principal
              </Label>
            </div>
            <div>
              <Label htmlFor="texto_sobre" className="text-gray-300">Texto da Seção Sobre Nós</Label>
              <Textarea
                id="texto_sobre"
                value={formData.texto_sobre}
                onChange={(e) => setFormData(prev => ({ ...prev, texto_sobre: e.target.value }))}
                placeholder="Digite o texto da seção sobre nós..."
                rows={8}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações do Footer */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Configurações do Footer</CardTitle>
          <CardDescription className="text-gray-400">
            Configure as informações exibidas no rodapé da página
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Switch
                    id="visivel_nome_empresa"
                    checked={formData.visivel_nome_empresa}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, visivel_nome_empresa: checked }))}
                  />
                  <Label htmlFor="visivel_nome_empresa" className="text-gray-300">Exibir nome da empresa</Label>
                </div>
                <Input
                  id="nome_empresa"
                  value={formData.nome_empresa}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome_empresa: e.target.value }))}
                  placeholder="Nome da empresa"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Switch
                    id="visivel_endereco"
                    checked={formData.visivel_endereco}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, visivel_endereco: checked }))}
                  />
                  <Label htmlFor="visivel_endereco" className="text-gray-300">Exibir endereço</Label>
                </div>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                  placeholder="Endereço"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Switch
                    id="visivel_telefone"
                    checked={formData.visivel_telefone}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, visivel_telefone: checked }))}
                  />
                  <Label htmlFor="visivel_telefone" className="text-gray-300">Exibir telefone</Label>
                </div>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                  placeholder="(00) 99999-9999"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Switch
                    id="visivel_facebook"
                    checked={formData.visivel_facebook}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, visivel_facebook: checked }))}
                  />
                  <Label htmlFor="visivel_facebook" className="text-gray-300">Exibir Facebook</Label>
                </div>
                <Input
                  id="facebook_url"
                  value={formData.facebook_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, facebook_url: e.target.value }))}
                  placeholder="URL do Facebook"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Switch
                    id="visivel_instagram"
                    checked={formData.visivel_instagram}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, visivel_instagram: checked }))}
                  />
                  <Label htmlFor="visivel_instagram" className="text-gray-300">Exibir Instagram</Label>
                </div>
                <Input
                  id="instagram_url"
                  value={formData.instagram_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, instagram_url: e.target.value }))}
                  placeholder="URL do Instagram"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit}
          className="bg-orange-600 hover:bg-orange-700"
          disabled={saving}
        >
          {saving ? 'Salvando...' : 'Salvar Todas as Configurações'}
        </Button>
      </div>
    </div>
  );
};