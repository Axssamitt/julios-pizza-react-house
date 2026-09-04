
import React, { useState, useEffect } from 'react';
import { MapPin, Utensils } from 'lucide-react';
import { HeroCarousel } from './HeroCarousel';
import { supabase } from '@/integrations/supabase/client';

interface HomeConfig {
  titulo_hero: string;
  subtitulo_hero: string;
  align_titulo_hero?: string;
  align_subtitulo_hero?: string;
}

export const Hero = () => {
  const [config, setConfig] = useState<HomeConfig>({
    titulo_hero: 'As Melhores Pizzas de Londrina',
    subtitulo_hero: 'Sabor autêntico para seus eventos. Buffet de pizzas artesanais feitas com ingredientes frescos e muito amor.',
    align_titulo_hero: 'left',
    align_subtitulo_hero: 'left'
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('home_config')
          .select('titulo_hero, subtitulo_hero, align_titulo_hero, align_subtitulo_hero')
          .limit(1)
          .single();
        
        if (data) {
          setConfig(data as HomeConfig);
        }
      } catch (error) {
        console.error('Erro ao carregar configurações da home:', error);
      }
    };

    fetchConfig();
  }, []);

  return (
    <section id="home" className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Content */}
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6" style={{ textAlign: config.align_titulo_hero as React.CSSProperties['textAlign'] }}>
              <span className="bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 bg-clip-text text-transparent" style={{ whiteSpace: 'pre-line' }}>
                {config.titulo_hero}
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl" style={{ whiteSpace: 'pre-line', textAlign: config.align_subtitulo_hero as React.CSSProperties['textAlign'] }}>
              {config.subtitulo_hero}
            </p>

            {/* Info Cards - apenas localização e tipo de serviço */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-center lg:justify-start space-x-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <MapPin className="text-orange-400" size={24} />
                <span className="text-gray-300">Londrina-PR</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start space-x-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <Utensils className="text-orange-400" size={24} />
                <span className="text-gray-300">Buffet para Eventos</span>
              </div>
            </div>
          </div>

          {/* Hero Carousel */}
          <div className="flex-1 relative">
            <div className="relative w-full max-w-md mx-auto lg:max-w-full">
              <HeroCarousel />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
