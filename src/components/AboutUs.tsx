
import React, { useState, useEffect } from 'react';
import { Users, Award, Heart, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AboutConfig {
  texto_sobre: string;
  visivel_sobre: boolean;
}

export const AboutUs = () => {
  const [config, setConfig] = useState<AboutConfig>({
    texto_sobre: `Julios Pizzas House iniciou suas atividades em 2018 e hoje é uma referência no rodízio de pizzas fazendo a melhor pizza de Londrina Pr. Buscando sempre manter um alto padrão de qualidade visando sempre à satisfação dos nossos clientes.

Todo o processo é rigorosamente acompanhado por mim Julio e minha Equipe, garantindo um atendimento com alto padrão de qualidade.

Prezamos pela comodidade e satisfação dos nossos clientes.

Temos uma vasta experiência em eventos corporativos, com toda estrutura própria e com funcionários constantemente treinados.

Faça o seu rodízio de pizzas sem sair do conforto de sua casa com Julio House Pizza.`,
    visivel_sobre: true
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('home_config')
          .select('texto_sobre, visivel_sobre')
          .limit(1)
          .single();
        
        if (data) {
          setConfig(prev => ({
            texto_sobre: data.texto_sobre || prev.texto_sobre,
            visivel_sobre: data.visivel_sobre !== false
          }));
        }
      } catch (error) {
        console.error('Erro ao carregar configurações sobre nós:', error);
      }
    };

    fetchConfig();
  }, []);

  if (!config.visivel_sobre) {
    return null;
  }

  return (
    <section id="about" className="py-20 bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Sobre Nós
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Texto */}
          <div>
            <div className="text-gray-300 text-lg leading-relaxed whitespace-pre-line">
              {config.texto_sobre}
            </div>
          </div>

          {/* Cards de destaque */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 text-center">
              <Award className="text-orange-400 mx-auto mb-4" size={40} />
              <h3 className="text-white font-bold text-xl mb-2">Desde 2018</h3>
              <p className="text-gray-400">Anos de experiência</p>
            </div>
            
            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 text-center">
              <Users className="text-orange-400 mx-auto mb-4" size={40} />
              <h3 className="text-white font-bold text-xl mb-2">Equipe</h3>
              <p className="text-gray-400">Treinada e qualificada</p>
            </div>
            
            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 text-center">
              <Heart className="text-orange-400 mx-auto mb-4" size={40} />
              <h3 className="text-white font-bold text-xl mb-2">Qualidade</h3>
              <p className="text-gray-400">Alto padrão sempre</p>
            </div>
            
            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 text-center">
              <Star className="text-orange-400 mx-auto mb-4" size={40} />
              <h3 className="text-white font-bold text-xl mb-2">Referência</h3>
              <p className="text-gray-400">Em Londrina-PR</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
