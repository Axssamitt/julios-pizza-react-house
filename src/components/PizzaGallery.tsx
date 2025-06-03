
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Heart } from 'lucide-react';

export const PizzaGallery = () => {
  const [selectedPizza, setSelectedPizza] = useState(0);

  const pizzas = [
    {
      id: 1,
      name: "Pizza Margherita Especial",
      description: "Molho de tomate, mussarela de búfala, manjericão fresco e azeite extra virgem",
      image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=400&fit=crop",
      rating: 4.9,
      popular: true
    },
    {
      id: 2,
      name: "Pizza Pepperoni Suprema",
      description: "Molho especial, mussarela, pepperoni premium e orégano",
      image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=400&fit=crop",
      rating: 4.8,
      popular: false
    },
    {
      id: 3,
      name: "Pizza Quatro Queijos",
      description: "Mussarela, gorgonzola, parmesão e provolone com molho branco",
      image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=400&h=400&fit=crop",
      rating: 4.7,
      popular: true
    },
    {
      id: 4,
      name: "Pizza Vegetariana",
      description: "Molho de tomate, mussarela, abobrinha, berinjela, pimentão e tomate cereja",
      image: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400&h=400&fit=crop",
      rating: 4.6,
      popular: false
    }
  ];

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
                  src={pizza.image} 
                  alt={pizza.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  {pizza.popular && (
                    <Badge className="bg-orange-500 text-white">
                      Popular
                    </Badge>
                  )}
                </div>
                <div className="absolute top-3 right-3">
                  <button className="p-2 bg-gray-900/80 rounded-full hover:bg-orange-500 transition-colors">
                    <Heart size={16} className="text-white" />
                  </button>
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{pizza.name}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{pizza.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="text-yellow-400 fill-current" size={16} />
                    <span className="text-white font-medium">{pizza.rating}</span>
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
          <button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-4 rounded-lg font-medium transition-all duration-300 hover:scale-105">
            Ver Cardápio Completo
          </button>
        </div>
      </div>
    </section>
  );
};
