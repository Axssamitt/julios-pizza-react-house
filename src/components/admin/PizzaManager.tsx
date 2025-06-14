import React, { useState, useEffect, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Edit, Trash2, Plus, Upload } from 'lucide-react';
import { PizzaEditForm } from './PizzaEditForm';

interface Pizza {
  id: string;
  nome: string;
  ingredientes: string;
  tipo: string;
  ordem: number;
  ativo: boolean;
  imagem_url?: string;
  created_at: string;
  updated_at: string;
}

export const PizzaManager = () => {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [selectedPizza, setSelectedPizza] = useState<Pizza | null>(null);
  const [editingPizza, setEditingPizza] = useState<Pizza | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [newPizza, setNewPizza] = useState({
    nome: '',
    ingredientes: '',
    tipo: 'salgada',
    ordem: 0,
    ativo: true
  });

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

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, isNewPizza = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `pizzas/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('pizza-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('pizza-images')
        .getPublicUrl(filePath);

      if (isNewPizza) {
        setNewPizza(prev => ({ ...prev, imagem_url: data.publicUrl }));
      } else if (editingPizza) {
        await updatePizza(editingPizza.id, { imagem_url: data.publicUrl });
      }
    } catch (error) {
      console.error('Erro no upload:', error);
    } finally {
      setUploading(false);
    }
  };

  const createPizza = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('pizzas')
      .insert([newPizza]);

    if (!error) {
      fetchPizzas();
      setNewPizza({ nome: '', ingredientes: '', tipo: 'salgada', ordem: 0, ativo: true });
      setShowNewForm(false);
    }
  };

  const updatePizza = async (id: string, updates: Partial<Pizza>) => {
    const { error } = await supabase
      .from('pizzas')
      .update(updates)
      .eq('id', id);

    if (!error) {
      fetchPizzas();
      setEditingPizza(null);
      setSelectedPizza(null);
    }
  };

  const deletePizza = async (id: string) => {
    const { error } = await supabase
      .from('pizzas')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchPizzas();
      setSelectedPizza(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Gerenciar Pizzas</h2>
        <Button onClick={() => setShowNewForm(true)} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="mr-2" size={16} />
          Nova Pizza
        </Button>
      </div>

      {showNewForm && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-orange-400">Nova Pizza</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createPizza} className="space-y-4">
              <div>
                <label className="text-white text-sm">Nome</label>
                <Input
                  value={newPizza.nome}
                  onChange={(e) => setNewPizza({ ...newPizza, nome: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-white text-sm">Ingredientes</label>
                <Textarea
                  value={newPizza.ingredientes}
                  onChange={(e) => setNewPizza({ ...newPizza, ingredientes: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-white text-sm">Tipo</label>
                <Select value={newPizza.tipo} onValueChange={(value) => setNewPizza({ ...newPizza, tipo: value })}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salgada">Salgada</SelectItem>
                    <SelectItem value="doce">Doce</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-white text-sm">Ordem</label>
                <Input
                  type="number"
                  value={newPizza.ordem}
                  onChange={(e) => setNewPizza({ ...newPizza, ordem: parseInt(e.target.value) })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="text-white text-sm">Imagem</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, true)}
                  className="bg-gray-700 border-gray-600 text-white"
                  disabled={uploading}
                />
                {uploading && <p className="text-orange-400 text-sm">Fazendo upload...</p>}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newPizza.ativo}
                  onChange={(e) => setNewPizza({ ...newPizza, ativo: e.target.checked })}
                  className="rounded"
                />
                <label className="text-white text-sm">Ativo</label>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Salvar
                </Button>
                <Button type="button" onClick={() => setShowNewForm(false)} variant="outline">
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {pizzas.map((pizza) => (
            <Card key={pizza.id} className="bg-gray-800 border-gray-700 hover:border-orange-500/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{pizza.nome}</h3>
                    <p className="text-gray-400 text-sm">{pizza.ingredientes}</p>
                  </div>
                  <Badge className={pizza.ativo ? 'bg-green-600' : 'bg-red-600'}>
                    {pizza.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>

                <div className="flex justify-between mt-4">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedPizza(pizza)}
                      className="border-gray-600"
                    >
                      <Eye className="mr-1" size={14} />
                      Ver
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingPizza(pizza)}
                      className="border-blue-600 text-blue-400 hover:bg-blue-600"
                    >
                      <Edit className="mr-1" size={14} />
                      Editar
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deletePizza(pizza.id)}
                  >
                    <Trash2 className="mr-1" size={14} />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {editingPizza && (
          <PizzaEditForm
            pizza={editingPizza}
            onSave={(updates) => updatePizza(editingPizza.id, updates)}
            onCancel={() => setEditingPizza(null)}
            onImageUpload={handleImageUpload}
            uploading={uploading}
          />
        )}

        {selectedPizza && !editingPizza && (
          <Card className="bg-gray-800 border-gray-700 sticky top-4">
            <CardHeader>
              <CardTitle className="text-orange-400">Detalhes da Pizza</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Nome</label>
                <p className="text-white">{selectedPizza.nome}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Ingredientes</label>
                <p className="text-white">{selectedPizza.ingredientes}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Tipo</label>
                <p className="text-white">{selectedPizza.tipo}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Ordem</label>
                <p className="text-white">{selectedPizza.ordem}</p>
              </div>
               {selectedPizza.imagem_url && (
                <div>
                  <label className="text-gray-400 text-sm">Imagem</label>
                  <img src={selectedPizza.imagem_url} alt={selectedPizza.nome} className="w-32 h-32 object-cover rounded" />
                </div>
              )}
              <div>
                <label className="text-gray-400 text-sm">Ativo</label>
                <p className="text-white">{selectedPizza.ativo ? 'Sim' : 'Não'}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
