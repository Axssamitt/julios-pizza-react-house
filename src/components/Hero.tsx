
import React from 'react';
import { Button } from '@/components/ui/button';
import { Phone, MapPin, Clock } from 'lucide-react';

export const Hero = () => {
  return (
    <section id="home" className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Content */}
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 bg-clip-text text-transparent">
                As Melhores
              </span>
              <br />
              <span className="text-white">Pizzas de</span>
              <br />
              <span className="text-orange-400">Londrina</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl">
              Sabor autêntico que vai até você. Pizzas artesanais feitas com ingredientes frescos e muito amor.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-4 text-lg">
                <Phone className="mr-2" size={20} />
                Fazer Pedido
              </Button>
              <Button variant="outline" size="lg" className="border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white px-8 py-4 text-lg">
                Ver Cardápio
              </Button>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-center lg:justify-start space-x-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <MapPin className="text-orange-400" size={24} />
                <span className="text-gray-300">Londrina-PR</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start space-x-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <Clock className="text-orange-400" size={24} />
                <span className="text-gray-300">18:00 - 23:00</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start space-x-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <Phone className="text-orange-400" size={24} />
                <span className="text-gray-300">Delivery Grátis</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="flex-1 relative">
            <div className="relative w-full max-w-md mx-auto lg:max-w-full">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-600/20 rounded-full blur-3xl"></div>
              <div className="relative bg-gray-800 rounded-full p-8 border border-orange-500/30">
                <div className="w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-orange-400 to-red-600 rounded-full flex items-center justify-center">
                  <span className="text-6xl md:text-8xl">🍕</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
