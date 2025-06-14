
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, Shield, Edit, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Usuario {
  id: string;
  email: string;
  nome: string;
  ativo: boolean;
  created_at: string;
}

export const UserManager = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: ''
  });
  const [editData, setEditData] = useState({
    nome: '',
    email: '',
    senha: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, email, nome, ativo, created_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUsuarios(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('usuarios')
        .insert({
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
          ativo: true
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso!",
      });
      
      setFormData({ nome: '', email: '', senha: '' });
      setDialogOpen(false);
      fetchUsuarios();
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar o usuário.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingId(usuario.id);
    setEditData({
      nome: usuario.nome,
      email: usuario.email,
      senha: ''
    });
  };

  const handleUpdate = async (id: string) => {
    try {
      const updateData: any = {
        nome: editData.nome,
        email: editData.email
      };

      if (editData.senha) {
        updateData.senha = editData.senha;
      }

      const { error } = await supabase
        .from('usuarios')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso!",
      });
      
      setEditingId(null);
      setEditData({ nome: '', email: '', senha: '' });
      fetchUsuarios();
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o usuário.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este usuário?')) return;

    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Usuário removido com sucesso!",
      });
      fetchUsuarios();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o usuário.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return <div className="text-white">Carregando...</div>;
  }

  return (
    <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center">
              <Shield className="mr-2" size={20} />
              Gerenciar Usuários Administradores
            </CardTitle>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="mr-2" size={16} />
                Adicionar Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800/95 backdrop-blur-sm border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Adicionar Usuário</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-gray-300 text-sm">Nome</label>
                  <Input
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Nome do usuário"
                    required
                    className="bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@exemplo.com"
                    required
                    className="bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm">Senha</label>
                  <Input
                    type="password"
                    value={formData.senha}
                    onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
                    placeholder="Senha"
                    required
                    className="bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                    Criar Usuário
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                    className="border-gray-600 text-gray-300"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {usuarios.map((usuario) => (
            <div key={usuario.id} className="flex items-center justify-between p-4 bg-gray-700/30 backdrop-blur-sm rounded-lg border border-gray-600/50">
              {editingId === usuario.id ? (
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      value={editData.nome}
                      onChange={(e) => setEditData(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Nome"
                      className="bg-gray-600/50 border-gray-500 text-white"
                    />
                    <Input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Email"
                      className="bg-gray-600/50 border-gray-500 text-white"
                    />
                  </div>
                  <Input
                    type="password"
                    value={editData.senha}
                    onChange={(e) => setEditData(prev => ({ ...prev, senha: e.target.value }))}
                    placeholder="Nova senha (deixe vazio para manter atual)"
                    className="bg-gray-600/50 border-gray-500 text-white"
                  />
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleUpdate(usuario.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(null)}
                      className="border-gray-600"
                    >
                      <X size={14} />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                      <Shield className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{usuario.nome}</h3>
                      <p className="text-gray-400 text-sm">{usuario.email}</p>
                      <p className="text-gray-400 text-sm">Criado em: {formatDate(usuario.created_at)}</p>
                      <Badge className={usuario.ativo ? "bg-green-600 text-white mt-1" : "bg-red-600 text-white mt-1"}>
                        {usuario.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(usuario)}
                      className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(usuario.id)}
                      className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
          {usuarios.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              Nenhum usuário encontrado.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
