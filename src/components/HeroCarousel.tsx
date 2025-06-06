
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { supabase } from '@/integrations/supabase/client';

interface CarouselImage {
  id: string;
  titulo: string;
  url_imagem: string;
  ordem: number;
}

export const HeroCarousel = () => {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data, error } = await supabase
          .from('carousel_images')
          .select('*')
          .eq('ativo', true)
          .order('ordem');
        
        if (error) throw error;
        setImages(data || []);
      } catch (error) {
        console.error('Erro ao carregar imagens do carrossel:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-64 bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
        <span className="text-gray-400">Carregando...</span>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">Nenhuma imagem encontrada</span>
      </div>
    );
  }

  return (
    <Carousel className="w-full max-w-xs md:max-w-md lg:max-w-lg mx-auto">
      <CarouselContent>
        {images.map((image) => (
          <CarouselItem key={image.id}>
            <Card className="border-orange-500/30 bg-gray-800">
              <CardContent className="p-2">
                <div className="aspect-square relative overflow-hidden rounded-lg">
                  <img
                    src={image.url_imagem}
                    alt={image.titulo}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <h3 className="text-white font-semibold text-sm">{image.titulo}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="text-orange-400 border-orange-400 hover:bg-orange-400 hover:text-white" />
      <CarouselNext className="text-orange-400 border-orange-400 hover:bg-orange-400 hover:text-white" />
    </Carousel>
  );
};
