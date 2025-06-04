
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAnalytics } from '@/hooks/useAnalytics';

interface Pizza {
  id: string;
  nome: string;
  ingredientes: string;
  imagem_url: string | null;
  ativo: boolean;
}

const Cardapio = () => {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Rastrear acesso à página do cardápio
  useAnalytics('/cardapio');

  useEffect(() => {
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

    fetchPizzas();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div>Carregando cardápio...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-white hover:text-orange-400"
          >
            <ArrowLeft className="mr-2" size={20} />
            Voltar
          </Button>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-orange-500">
              <img 
                src="/lovable-uploads/67b1b7fb-0eda-4d5b-bfc2-5c77a6bea10e.png" 
                alt="Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Júlio's Pizza House
            </h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto py-8 px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 bg-clip-text text-transparent">
              Nosso Cardápio
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Descubra sabores únicos com nossas pizzas artesanais, preparadas com ingredientes frescos e muito carinho.
          </p>
        </div>

        {/* Pizzas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pizzas.map((pizza) => (
            <Card key={pizza.id} className="bg-gray-800 border-gray-700 hover:border-orange-500 transition-colors">
              <CardHeader className="pb-4">
                {pizza.imagem_url && (
                  <div className="w-full h-48 rounded-lg overflow-hidden mb-4">
                    <img 
                      src={pizza.imagem_url} 
                      alt={pizza.nome}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardTitle className="text-xl text-white">{pizza.nome}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 text-base leading-relaxed">
                  {pizza.ingredientes}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {pizzas.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-xl">Nenhuma pizza encontrada no cardápio.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cardapio;
