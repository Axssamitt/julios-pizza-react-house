
import React, { useState, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Pizza {
  id: string;
  nome: string;
  ingredientes: string;
  tipo: string;
  ordem: number;
  ativo: boolean;
  imagem_url?: string;
}

interface PizzaEditFormProps {
  pizza: Pizza;
  onSave: (updates: Partial<Pizza>) => Promise<void>;
  onCancel: () => void;
  onImageUpload: (e: ChangeEvent<HTMLInputElement>, isNewPizza?: boolean) => Promise<void>;
  uploading: boolean;
}

export const PizzaEditForm: React.FC<PizzaEditFormProps> = ({
  pizza,
  onSave,
  onCancel,
  onImageUpload,
  uploading
}) => {
  const [formData, setFormData] = useState({
    nome: pizza.nome,
    ingredientes: pizza.ingredientes,
    tipo: pizza.tipo,
    ordem: pizza.ordem,
    ativo: pizza.ativo
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-orange-400">Editar Pizza</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-white text-sm">Nome</label>
            <Input
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>

          <div>
            <label className="text-white text-sm">Ingredientes</label>
            <Textarea
              value={formData.ingredientes}
              onChange={(e) => setFormData({ ...formData, ingredientes: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>

          <div>
            <label className="text-white text-sm">Tipo</label>
            <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
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
              value={formData.ordem}
              onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) })}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div>
            <label className="text-white text-sm">Imagem</label>
            <Input
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className="bg-gray-700 border-gray-600 text-white"
              disabled={uploading}
            />
            {uploading && <p className="text-orange-400 text-sm">Fazendo upload...</p>}
          </div>

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
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Salvar
            </Button>
            <Button type="button" onClick={onCancel} variant="outline">
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
