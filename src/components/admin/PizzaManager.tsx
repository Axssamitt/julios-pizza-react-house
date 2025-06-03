
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface Pizza {
  id: string;
  nome: string;
  ingredientes: string;
  imagem_url: string | null;
  ativo: boolean;
  ordem: number;
}

export const PizzaManager = () => {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPizza, setNewPizza] = useState({
    nome: '',
    ingredientes: '',
    imagem_url: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchPizzas();
  }, []);

  const fetchPizzas = async () => {
    const { data, error } = await supabase
      .from('pizzas')
      .select('*')
      .order('ordem', { ascending: true });

    if (!error && data) {
      setPizzas(data);
    }
  };

  const handleAdd = async () => {
    if (!newPizza.nome || !newPizza.ingredientes) return;

    const { error } = await supabase
      .from('pizzas')
      .insert([{
        ...newPizza,
        imagem_url: newPizza.imagem_url || null,
        ordem: pizzas.length
      }]);

    if (!error) {
      setNewPizza({ nome: '', ingredientes: '', imagem_url: '' });
      setShowAddForm(false);
      fetchPizzas();
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Pizza>) => {
    const { error } = await supabase
      .from('pizzas')
      .update(updates)
      .eq('id', id);

    if (!error) {
      setEditingId(null);
      fetchPizzas();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('pizzas')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchPizzas();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Pizzas</h2>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="mr-2" size={16} />
          Adicionar Pizza
        </Button>
      </div>

      {showAddForm && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Nova Pizza</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Nome da pizza"
              value={newPizza.nome}
              onChange={(e) => setNewPizza({ ...newPizza, nome: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
            />
            <Textarea
              placeholder="Ingredientes"
              value={newPizza.ingredientes}
              onChange={(e) => setNewPizza({ ...newPizza, ingredientes: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
            />
            <Input
              placeholder="URL da imagem"
              value={newPizza.imagem_url}
              onChange={(e) => setNewPizza({ ...newPizza, imagem_url: e.target.value })}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pizzas.map((pizza) => (
          <Card key={pizza.id} className="bg-gray-800 border-gray-700">
            <div className="relative">
              <img 
                src={pizza.imagem_url || 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=400&fit=crop'} 
                alt={pizza.nome}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              {!pizza.ativo && (
                <div className="absolute inset-0 bg-red-600/50 flex items-center justify-center rounded-t-lg">
                  <span className="text-white font-bold">INATIVO</span>
                </div>
              )}
            </div>
            <CardContent className="p-4">
              {editingId === pizza.id ? (
                <EditPizzaForm 
                  pizza={pizza} 
                  onSave={(updates) => handleUpdate(pizza.id, updates)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{pizza.nome}</h3>
                  <p className="text-gray-400 text-sm mb-4">{pizza.ingredientes}</p>
                  <div className="flex justify-between">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setEditingId(pizza.id)}
                      className="border-gray-600"
                    >
                      <Edit className="mr-1" size={14} />
                      Editar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(pizza.id)}
                    >
                      <Trash2 className="mr-1" size={14} />
                      Excluir
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const EditPizzaForm = ({ 
  pizza, 
  onSave, 
  onCancel 
}: { 
  pizza: Pizza; 
  onSave: (updates: Partial<Pizza>) => void; 
  onCancel: () => void; 
}) => {
  const [formData, setFormData] = useState({
    nome: pizza.nome,
    ingredientes: pizza.ingredientes,
    imagem_url: pizza.imagem_url || '',
    ativo: pizza.ativo
  });

  return (
    <div className="space-y-3">
      <Input
        value={formData.nome}
        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
        className="bg-gray-700 border-gray-600 text-white text-sm"
      />
      <Textarea
        value={formData.ingredientes}
        onChange={(e) => setFormData({ ...formData, ingredientes: e.target.value })}
        className="bg-gray-700 border-gray-600 text-white text-sm"
        rows={3}
      />
      <Input
        value={formData.imagem_url}
        onChange={(e) => setFormData({ ...formData, imagem_url: e.target.value })}
        className="bg-gray-700 border-gray-600 text-white text-sm"
        placeholder="URL da imagem"
      />
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={formData.ativo}
          onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
          className="rounded"
        />
        <label className="text-white text-sm">Ativo</label>
      </div>
      <div className="flex space-x-2">
        <Button 
          size="sm" 
          onClick={() => onSave(formData)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Save className="mr-1" size={14} />
          Salvar
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onCancel}
          className="border-gray-600"
        >
          <X className="mr-1" size={14} />
          Cancelar
        </Button>
      </div>
    </div>
  );
};
