
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Pizza {
  id: string;
  nome: string;
  ingredientes: string;
  imagem_url: string | null;
  ativo: boolean;
  tipo: string;
}

export const PizzaGallery = () => {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllSalgadas, setShowAllSalgadas] = useState(false);
  const [showAllDoces, setShowAllDoces] = useState(false);


  useEffect(() => {
    fetchPizzas();
  }, []);

  const fetchPizzas = async () => {
    try {
      const { data, error } = await supabase
        .from('pizzas')
        .select('*')
        .eq('ativo', true)
        .order('ordem');

      if (error) throw error;
      setPizzas(data || []);
    } catch (error) {
      console.error('Erro ao carregar pizzas:', error);
    } finally {
      setLoading(false);
    }
  };

  const pizzasSalgadas = pizzas.filter(pizza => pizza.tipo === 'salgada');
  const pizzasDoces = pizzas.filter(pizza => pizza.tipo === 'doce');

  // Limita a 3 ou mostra todas conforme o estado
  const displayedSalgadas = showAllSalgadas ? pizzasSalgadas : pizzasSalgadas.slice(0, 3);
  const displayedDoces = showAllDoces ? pizzasDoces : pizzasDoces.slice(0, 3);

  if (loading) {
    return (
      <section id="pizzas" className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const PizzaCard = ({ pizza }: { pizza: Pizza }) => (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl hover:transform hover:scale-105 transition-all duration-300">
      <div className="relative h-64">
        <img 
          src={pizza.imagem_url || 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=400&fit=crop'} 
          alt={pizza.nome}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-3">{pizza.nome}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{pizza.ingredientes}</p>
      </div>
    </div>
  );

  return (
    <section id="pizzas" className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Nosso Cardápio
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Descubra sabores únicos preparados com ingredientes frescos e receitas tradicionais
          </p>
        </div>

        {/* Pizzas Salgadas */}
        {pizzasSalgadas.length > 0 && (
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-center mb-12">
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Pizzas Salgadas
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {displayedSalgadas.map((pizza) => (
                <PizzaCard key={pizza.id} pizza={pizza} />
              ))}
            </div>
            {pizzasSalgadas.length > 3 && (
              <div className="flex justify-center mt-8">
                <button
                  className="px-6 py-2 rounded bg-orange-500 hover:bg-orange-600 text-white font-semibold transition"
                  onClick={() => setShowAllSalgadas((v) => !v)}
                >
                  {showAllSalgadas ? 'Mostrar menos' : 'Ver todas'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Pizzas Doces */}
        {pizzasDoces.length > 0 && (
          <div>
            <h3 className="text-3xl font-bold text-center mb-12">
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Pizzas Doces
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {displayedDoces.map((pizza) => (
                <PizzaCard key={pizza.id} pizza={pizza} />
              ))}
            </div>
            {pizzasDoces.length > 3 && (
              <div className="flex justify-center mt-8">
                <button
                  className="px-6 py-2 rounded bg-orange-500 hover:bg-orange-600 text-white font-semibold transition"
                  onClick={() => setShowAllDoces((v) => !v)}
                >
                  {showAllDoces ? 'Mostrar menos' : 'Ver todas'}
                </button>
              </div>
            )}
          </div>
        )}

        {pizzas.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Nenhuma pizza cadastrada no momento.</p>
          </div>
        )}
      </div>
    </section>
  );
};
