
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Pizza {
  id: string;
  nome: string;
  ingredientes: string;
  imagem_url: string | null;
  ativo: boolean;
  ordem: number;
}

export const PizzaGallery = () => {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [selectedPizza, setSelectedPizza] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPizzas();
  }, []);

  const fetchPizzas = async () => {
    try {
      const { data, error } = await supabase
        .from('pizzas')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true })
        .limit(4);

      if (error) throw error;
      setPizzas(data || []);
    } catch (error) {
      console.error('Erro ao buscar pizzas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section id="pizzas" className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Nossas Pizzas
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-gray-900 border-gray-700 animate-pulse">
                <div className="w-full h-48 bg-gray-700 rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pizzas" className="py-20 bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Nossas Pizzas
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Cada pizza é uma obra de arte culinária, preparada com ingredientes selecionados e muito carinho.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pizzas.map((pizza, index) => (
            <Card 
              key={pizza.id} 
              className="bg-gray-900 border-gray-700 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 cursor-pointer group"
              onClick={() => setSelectedPizza(index)}
            >
              <div className="relative overflow-hidden rounded-t-lg">
                <img 
                  src={pizza.imagem_url || 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=400&fit=crop'} 
                  alt={pizza.nome}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-orange-500 text-white">
                    Especial
                  </Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <button className="p-2 bg-gray-900/80 rounded-full hover:bg-orange-500 transition-colors">
                    <Heart size={16} className="text-white" />
                  </button>
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{pizza.nome}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{pizza.ingredientes}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="text-yellow-400 fill-current" size={16} />
                    <span className="text-white font-medium">4.8</span>
                  </div>
                  <button className="text-orange-400 hover:text-orange-300 font-medium">
                    Ver mais
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <a href="/cardapio">
            <button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-4 rounded-lg font-medium transition-all duration-300 hover:scale-105">
              Ver Cardápio Completo
            </button>
          </a>
        </div>
      </div>
    </section>
  );
};
