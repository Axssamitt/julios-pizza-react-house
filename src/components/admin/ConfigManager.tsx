
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Config {
  id: string;
  tipo: string;
  label: string;
  valor: string;
  ativo: boolean;
  ordem: number;
}

export const ConfigManager = () => {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newConfig, setNewConfig] = useState({
    tipo: 'contato',
    label: '',
    valor: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .order('tipo', { ascending: true })
        .order('ordem', { ascending: true });

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newConfig.label || !newConfig.valor) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('configuracoes')
        .insert([{
          ...newConfig,
          ordem: configs.filter(c => c.tipo === newConfig.tipo).length
        }]);

      if (error) throw error;

      setNewConfig({ tipo: 'contato', label: '', valor: '' });
      setShowAddForm(false);
      toast({
        title: "Sucesso",
        description: "Configuração adicionada com sucesso!",
      });
      fetchConfigs();
    } catch (error) {
      console.error('Erro ao adicionar configuração:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a configuração.",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Config>) => {
    try {
      const { error } = await supabase
        .from('configuracoes')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setEditingId(null);
      toast({
        title: "Sucesso",
        description: "Configuração atualizada com sucesso!",
      });
      fetchConfigs();
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a configuração.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta configuração?')) return;

    try {
      const { error } = await supabase
        .from('configuracoes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configuração removida com sucesso!",
      });
      fetchConfigs();
    } catch (error) {
      console.error('Erro ao excluir configuração:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a configuração.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="text-white">Carregando configurações...</div>
    );
  }

  const contatos = configs.filter(c => c.tipo === 'contato');
  const localizacoes = configs.filter(c => c.tipo === 'localizacao');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Configurações</h2>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="mr-2" size={16} />
          Adicionar Configuração
        </Button>
      </div>

      {showAddForm && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Nova Configuração</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <select
              value={newConfig.tipo}
              onChange={(e) => setNewConfig({ ...newConfig, tipo: e.target.value })}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
            >
              <option value="contato">Contato</option>
              <option value="localizacao">Localização</option>
            </select>
            <Input
              placeholder="Label (ex: Telefone, Endereço)"
              value={newConfig.label}
              onChange={(e) => setNewConfig({ ...newConfig, label: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
            />
            <Input
              placeholder="Valor"
              value={newConfig.valor}
              onChange={(e) => setNewConfig({ ...newConfig, valor: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
            />
            <div className="flex space-x-2">
              <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700">
                <Save className="mr-2" size={16} />
                Salvar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddForm(false)}
                className="border-gray-600 text-gray-300"
              >
                <X className="mr-2" size={16} />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-orange-400">Informações de Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contatos.map((config) => (
              <ConfigItem 
                key={config.id} 
                config={config} 
                editingId={editingId}
                onEdit={setEditingId}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
            {contatos.length === 0 && (
              <p className="text-gray-400 text-center py-4">Nenhuma configuração de contato encontrada.</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-orange-400">Informações de Localização</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {localizacoes.map((config) => (
              <ConfigItem 
                key={config.id} 
                config={config} 
                editingId={editingId}
                onEdit={setEditingId}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
            {localizacoes.length === 0 && (
              <p className="text-gray-400 text-center py-4">Nenhuma configuração de localização encontrada.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ConfigItem = ({ 
  config, 
  editingId, 
  onEdit, 
  onUpdate, 
  onDelete 
}: {
  config: Config;
  editingId: string | null;
  onEdit: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<Config>) => void;
  onDelete: (id: string) => void;
}) => {
  const [formData, setFormData] = useState({
    label: config.label,
    valor: config.valor,
    ativo: config.ativo
  });

  if (editingId === config.id) {
    return (
      <div className="space-y-2 p-3 border border-gray-600 rounded">
        <Input
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          className="bg-gray-700 border-gray-600 text-white"
        />
        <Input
          value={formData.valor}
          onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
          className="bg-gray-700 border-gray-600 text-white"
        />
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.ativo}
            onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
            className="rounded"
          />
          <label className="text-white text-sm">Mostrar na página inicial</label>
        </div>
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            onClick={() => onUpdate(config.id, formData)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="mr-1" size={14} />
            Salvar
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onEdit(null)}
            className="border-gray-600"
          >
            <X className="mr-1" size={14} />
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 border border-gray-600 rounded">
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={config.ativo}
          onChange={(e) => onUpdate(config.id, { ativo: e.target.checked })}
          className="rounded"
        />
        <div>
          <p className="text-white font-medium">{config.label}</p>
          <p className="text-gray-400 text-sm">{config.valor}</p>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => onEdit(config.id)}
          className="border-gray-600"
        >
          <Edit className="mr-1" size={14} />
          Editar
        </Button>
        <Button 
          size="sm" 
          variant="destructive"
          onClick={() => onDelete(config.id)}
        >
          <Trash2 className="mr-1" size={14} />
          Excluir
        </Button>
      </div>
    </div>
  );
};
