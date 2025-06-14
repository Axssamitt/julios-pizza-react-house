
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Image, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CarouselImage {
  id: string;
  titulo: string;
  url_imagem: string;
  ordem: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export const CarouselManager = () => {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<CarouselImage | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    url_imagem: ''
  });
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('carousel_images')
        .select('*')
        .order('ordem');
      
      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Erro ao carregar imagens do carrossel:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as imagens do carrossel.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `carousel/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadImage(file);
      setFormData(prev => ({ ...prev, url_imagem: imageUrl }));
      toast({
        title: "Sucesso",
        description: "Imagem enviada com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer upload da imagem.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const nextOrder = Math.max(...images.map(img => img.ordem), 0) + 1;
      
      if (editingImage) {
        const { error } = await supabase
          .from('carousel_images')
          .update({
            titulo: formData.titulo,
            url_imagem: formData.url_imagem,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingImage.id);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Imagem atualizada com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('carousel_images')
          .insert({
            titulo: formData.titulo,
            url_imagem: formData.url_imagem,
            ordem: nextOrder,
            ativo: true
          });

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Imagem adicionada com sucesso!",
        });
      }

      setFormData({ titulo: '', url_imagem: '' });
      setEditingImage(null);
      setDialogOpen(false);
      fetchImages();
    } catch (error) {
      console.error('Erro ao salvar imagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a imagem.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta imagem?')) return;

    try {
      const { error } = await supabase
        .from('carousel_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "Sucesso",
        description: "Imagem removida com sucesso!",
      });
      fetchImages();
    } catch (error) {
      console.error('Erro ao excluir imagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a imagem.",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (id: string, ativo: boolean) => {
    try {
      const { error } = await supabase
        .from('carousel_images')
        .update({ ativo: !ativo })
        .eq('id', id);

      if (error) throw error;
      fetchImages();
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
              <Image className="mr-2" size={20} />
              Gerenciar Carrossel
            </CardTitle>
            <CardDescription className="text-gray-400">
              Adicione e gerencie as imagens do carrossel da página principal
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-orange-600 hover:bg-orange-700"
                onClick={() => {
                  setEditingImage(null);
                  setFormData({ titulo: '', url_imagem: '' });
                }}
              >
                <Plus className="mr-2" size={16} />
                Adicionar Imagem
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingImage ? 'Editar' : 'Adicionar'} Imagem do Carrossel
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {editingImage ? 'Edite as informações da imagem' : 'Adicione uma nova imagem ao carrossel'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="titulo" className="text-gray-300">Título</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                    placeholder="Título da imagem"
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="image" className="text-gray-300">Imagem</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="bg-gray-700 border-gray-600 text-white"
                        disabled={uploading}
                      />
                      <Button
                        type="button"
                        disabled={uploading}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Upload className="mr-2" size={16} />
                        {uploading ? 'Enviando...' : 'Upload'}
                      </Button>
                    </div>
                    <Input
                      placeholder="Ou cole a URL da imagem"
                      value={formData.url_imagem}
                      onChange={(e) => setFormData(prev => ({ ...prev, url_imagem: e.target.value }))}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  {formData.url_imagem && (
                    <img 
                      src={formData.url_imagem} 
                      alt="Preview"
                      className="mt-2 w-32 h-32 object-cover rounded"
                    />
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    className="bg-orange-600 hover:bg-orange-700"
                    disabled={!formData.titulo || !formData.url_imagem}
                  >
                    {editingImage ? 'Atualizar' : 'Adicionar'}
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
            {images.map((image) => (
              <TableRow key={image.id} className="border-gray-700">
                <TableCell>
                  <img 
                    src={image.url_imagem} 
                    alt={image.titulo}
                    className="w-16 h-16 object-cover rounded"
                  />
                </TableCell>
                <TableCell className="text-white">{image.titulo}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(image.id, image.ativo)}
                    className={image.ativo ? 
                      "border-green-500 text-green-400 hover:bg-green-500 hover:text-white" : 
                      "border-gray-500 text-gray-400 hover:bg-gray-500 hover:text-white"
                    }
                  >
                    {image.ativo ? 'Ativo' : 'Inativo'}
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingImage(image);
                        setFormData({
                          titulo: image.titulo,
                          url_imagem: image.url_imagem
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
                      onClick={() => handleDelete(image.id)}
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
