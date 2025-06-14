
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAnalytics } from '@/hooks/useAnalytics';

interface Pizza {
  id: string;
  nome: string;
  ingredientes: string;
  imagem_url: string | null;
  ativo: boolean;
  tipo: string;
}

const Cardapio = () => {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Rastrear acesso à página de cardápio
  useAnalytics('/cardapio');

  useEffect(() => {
    fetchPizzas();
  }, []);

  const fetchPizzas = async () => {
    try {
      const { data, error } = await supabase
        .from('pizzas')
        .select('*')
        .eq('ativo', true)
        .order('nome');

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-20">
            <div className="text-center">
              <div className="animate-pulse space-y-4">
                <div className="h-12 bg-gray-700 rounded w-96 mx-auto"></div>
                <div className="h-6 bg-gray-700 rounded w-64 mx-auto"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Nosso Cardápio
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Descubra todos os sabores únicos preparados com ingredientes frescos e receitas tradicionais
            </p>
          </div>

          {/* Pizzas Salgadas */}
          {pizzasSalgadas.length > 0 && (
            <div className="mb-20">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  Pizzas Salgadas
                </span>
              </h2>
              <div className="bg-gray-800 rounded-lg p-8 mb-8">
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pizzasSalgadas.map((pizza) => (
                    <li key={pizza.id} className="text-gray-300 text-lg font-medium">
                      • {pizza.nome}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Pizzas Doces */}
          {pizzasDoces.length > 0 && (
            <div className="mb-20">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  Pizzas Doces
                </span>
              </h2>
              <div className="bg-gray-800 rounded-lg p-8 mb-8">
                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pizzasDoces.map((pizza) => (
                    <li key={pizza.id} className="text-gray-300 text-lg font-medium">
                      • {pizza.nome}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {pizzas.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-xl">Cardápio em breve...</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cardapio;
