
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Instagram, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InstagramPost {
  id: string;
  titulo: string;
  url_post: string;
  url_imagem: string;
  ordem: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export const InstagramManager = () => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<InstagramPost | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    url_post: '',
    url_imagem: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('instagram_posts')
        .select('*')
        .order('ordem');
      
      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Erro ao carregar posts do Instagram:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os posts do Instagram.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const nextOrder = Math.max(...posts.map(post => post.ordem), 0) + 1;
      
      if (editingPost) {
        const { error } = await supabase
          .from('instagram_posts')
          .update({
            titulo: formData.titulo,
            url_post: formData.url_post,
            url_imagem: formData.url_imagem,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingPost.id);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Post atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('instagram_posts')
          .insert({
            titulo: formData.titulo,
            url_post: formData.url_post,
            url_imagem: formData.url_imagem,
            ordem: nextOrder,
            ativo: true
          });

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Post adicionado com sucesso!",
        });
      }

      setFormData({ titulo: '', url_post: '', url_imagem: '' });
      setEditingPost(null);
      setDialogOpen(false);
      fetchPosts();
    } catch (error) {
      console.error('Erro ao salvar post:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o post.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;

    try {
      const { error } = await supabase
        .from('instagram_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "Sucesso",
        description: "Post removido com sucesso!",
      });
      fetchPosts();
    } catch (error) {
      console.error('Erro ao excluir post:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o post.",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (id: string, ativo: boolean) => {
    try {
      const { error } = await supabase
        .from('instagram_posts')
        .update({ ativo: !ativo })
        .eq('id', id);

      if (error) throw error;
      fetchPosts();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
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
              <Instagram className="mr-2" size={20} />
              Gerenciar Instagram
            </CardTitle>
            <CardDescription className="text-gray-400">
              Adicione e gerencie os posts do Instagram exibidos na página principal
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-pink-600 hover:bg-pink-700"
                onClick={() => {
                  setEditingPost(null);
                  setFormData({ titulo: '', url_post: '', url_imagem: '' });
                }}
              >
                <Plus className="mr-2" size={16} />
                Adicionar Post
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingPost ? 'Editar' : 'Adicionar'} Post do Instagram
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {editingPost ? 'Edite as informações do post do Instagram' : 'Adicione um novo post do Instagram à galeria'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="titulo" className="text-gray-300">Título/Descrição</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                    placeholder="Descrição do post"
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="url_post" className="text-gray-300">URL do Post no Instagram</Label>
                  <Input
                    id="url_post"
                    value={formData.url_post}
                    onChange={(e) => setFormData(prev => ({ ...prev, url_post: e.target.value }))}
                    placeholder="https://www.instagram.com/p/..."
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="url_imagem" className="text-gray-300">URL da Imagem</Label>
                  <Input
                    id="url_imagem"
                    value={formData.url_imagem}
                    onChange={(e) => setFormData(prev => ({ ...prev, url_imagem: e.target.value }))}
                    placeholder="https://exemplo.com/imagem.jpg"
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    className="bg-pink-600 hover:bg-pink-700"
                  >
                    {editingPost ? 'Atualizar' : 'Adicionar'}
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
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700">
              <TableHead className="text-gray-300">Imagem</TableHead>
              <TableHead className="text-gray-300">Título</TableHead>
              <TableHead className="text-gray-300">Status</TableHead>
              <TableHead className="text-gray-300">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id} className="border-gray-700">
                <TableCell>
                  <img 
                    src={post.url_imagem} 
                    alt={post.titulo}
                    className="w-16 h-16 object-cover rounded"
                  />
                </TableCell>
                <TableCell className="text-white">{post.titulo}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(post.id, post.ativo)}
                    className={post.ativo ? 
                      "border-green-500 text-green-400 hover:bg-green-500 hover:text-white" : 
                      "border-gray-500 text-gray-400 hover:bg-gray-500 hover:text-white"
                    }
                  >
                    {post.ativo ? 'Ativo' : 'Inativo'}
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(post.url_post, '_blank')}
                      className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                      aria-label={`Abrir post ${post.titulo} no Instagram`}
                    >
                      <ExternalLink size={14} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingPost(post);
                        setFormData({
                          titulo: post.titulo,
                          url_post: post.url_post,
                          url_imagem: post.url_imagem
                        });
                        setDialogOpen(true);
                      }}
                      className="border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white"
                      aria-label={`Editar post ${post.titulo}`}
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                      className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                      aria-label={`Excluir post ${post.titulo}`}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
