
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
  title: string;
  post_url: string;
  image_url: string;
  active: boolean;
  order_index: number;
  created_at: string;
}

export const InstagramManager = () => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<InstagramPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    post_url: '',
    image_url: ''
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
        .order('order_index');
      
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
      const nextOrderIndex = Math.max(...posts.map(post => post.order_index), 0) + 1;
      
      if (editingPost) {
        const { error } = await supabase
          .from('instagram_posts')
          .update({
            title: formData.title,
            post_url: formData.post_url,
            image_url: formData.image_url,
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
            title: formData.title,
            post_url: formData.post_url,
            image_url: formData.image_url,
            order_index: nextOrderIndex,
            active: true
          });

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Post adicionado com sucesso!",
        });
      }

      setFormData({ title: '', post_url: '', image_url: '' });
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

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('instagram_posts')
        .update({ active: !active })
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
                  setFormData({ title: '', post_url: '', image_url: '' });
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
                  {editingPost ? 'Edite os dados do post' : 'Adicione um novo post do Instagram'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-gray-300">Título/Descrição</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Descrição do post"
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="post_url" className="text-gray-300">URL do Post no Instagram</Label>
                  <Input
                    id="post_url"
                    value={formData.post_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, post_url: e.target.value }))}
                    placeholder="https://www.instagram.com/p/..."
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="image_url" className="text-gray-300">URL da Imagem</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
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
                    src={post.image_url} 
                    alt={post.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                </TableCell>
                <TableCell className="text-white">{post.title}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(post.id, post.active)}
                    className={post.active ? 
                      "border-green-500 text-green-400 hover:bg-green-500 hover:text-white" : 
                      "border-gray-500 text-gray-400 hover:bg-gray-500 hover:text-white"
                    }
                  >
                    {post.active ? 'Ativo' : 'Inativo'}
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(post.post_url, '_blank')}
                      className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                    >
                      <ExternalLink size={14} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingPost(post);
                        setFormData({
                          title: post.title,
                          post_url: post.post_url,
                          image_url: post.image_url
                        });
                        setDialogOpen(true);
                      }}
                      className="border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white"
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                      className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
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
