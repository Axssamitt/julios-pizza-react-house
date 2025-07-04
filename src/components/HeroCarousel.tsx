import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface CarouselImage {
  id: string;
  titulo: string;
  url_imagem: string;
  ordem: number;
  ativo: boolean;
}

const fetchCarouselImages = async (): Promise<CarouselImage[]> => {
  const { data, error } = await supabase
    .from('carousel_images')
    .select('*')
    .eq('ativo', true)
    .order('ordem', { ascending: true });

  if (error) {
    console.error('Erro ao buscar imagens do carrossel:', error);
    throw error;
  }

  return data || [];
};

export const HeroCarousel = () => {
  const { data: images = [], isLoading, error } = useQuery({
    queryKey: ['carousel-images'],
    queryFn: fetchCarouselImages,
  });

  // Ativa autoplay
  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: 'center',
      containScroll: 'trimSnaps'
    },
    [Autoplay({ delay: 3500, stopOnInteraction: false })]
  );

  if (error) {
    console.error('Erro no carrossel:', error);
    return (
      <div className="w-full h-[500px] bg-gray-900 flex items-center justify-center">
        <p className="text-white">Erro ao carregar carrossel</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-[500px] bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-full h-full bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-[500px] bg-gray-900 flex items-center justify-center">
        <p className="text-white">Nenhuma imagem disponível no carrossel</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] overflow-hidden" ref={emblaRef}>
      <div className="flex h-full">
        {images.map((image) => (
          <div key={image.id} className="flex-[0_0_100%] min-w-0 relative">
            <img
              src={image.url_imagem}
              alt={image.titulo}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-0 flex items-end justify-center pb-0">
              <h2 className="text-white text-lg font-semibold text-center px-4">
                {image.titulo}
              </h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};