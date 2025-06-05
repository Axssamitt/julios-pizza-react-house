
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Eye, Users, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Admin {
  id: string;
  user_id: string;
  nome: string;
  created_at: string;
}

export const UserManager = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAdmins(data || []);
    } catch (error) {
      console.error('Erro ao carregar administradores:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de administradores.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      toast({
        title: "Informação",
        description: "Para adicionar novos administradores, crie o usuário no painel do Supabase Auth primeiro.",
      });
      setDialogOpen(false);
    } catch (error) {
      console.error('Erro ao criar administrador:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o administrador.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este administrador?')) return;

    try {
      const { error } = await supabase
        .from('admins')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "Sucesso",
        description: "Administrador removido com sucesso!",
      });
      fetchAdmins();
    } catch (error) {
      console.error('Erro ao excluir administrador:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o administrador.",
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
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center">
              <Users className="mr-2" size={20} />
              Gerenciar Usuários Administradores
            </CardTitle>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="mr-2" size={16} />
                Adicionar Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Adicionar Administrador</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-gray-300 text-sm">Nome</label>
                  <Input
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Nome do administrador"
                    required
                    className="bg-gray-700 border-gray-600 text-white"
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
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm">Senha</label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Senha"
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded">
                  <p className="text-sm">
                    <strong>Instruções:</strong> Para adicionar novos administradores, você deve primeiro criar o usuário no painel do Supabase Auth e depois executar o SQL para adicioná-lo à tabela de admins.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                    Ver Instruções
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
          {admins.map((admin) => (
            <div key={admin.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-gray-600">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                  <Shield className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-medium">{admin.nome}</h3>
                  <p className="text-gray-400 text-sm">Criado em: {formatDate(admin.created_at)}</p>
                  <Badge className="bg-green-600 text-white mt-1">Administrador</Badge>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(admin.id)}
                  className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
          {admins.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              Nenhum administrador encontrado.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
