
import React from 'react';
import { Facebook, Instagram, Phone, MapPin, Clock } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">J</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  Júlio's Pizza House
                </h3>
                <p className="text-orange-400">O sabor vai até você</p>
              </div>
            </div>
            <p className="text-gray-400 max-w-md mb-6">
              Há anos levando o melhor sabor da pizza artesanal para Londrina e região. 
              Ingredientes frescos, massa artesanal e muito amor em cada fatia.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/JuliosPIZZAHOUSE/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <Facebook size={20} className="text-white" />
              </a>
              <a 
                href="https://instagram.com/juliospizzahouse" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors"
              >
                <Instagram size={20} className="text-white" />
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-6">Contato</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="text-orange-400" size={18} />
                <span className="text-gray-400">(43) 99999-9999</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="text-orange-400" size={18} />
                <span className="text-gray-400">Londrina - PR</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="text-orange-400" size={18} />
                <span className="text-gray-400">18:00 - 23:00</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-6">Links Rápidos</h4>
            <div className="space-y-3">
              <a href="#home" className="block text-gray-400 hover:text-orange-400 transition-colors">
                Início
              </a>
              <a href="#pizzas" className="block text-gray-400 hover:text-orange-400 transition-colors">
                Nossas Pizzas
              </a>
              <a href="#instagram" className="block text-gray-400 hover:text-orange-400 transition-colors">
                Instagram
              </a>
              <a href="#contact" className="block text-gray-400 hover:text-orange-400 transition-colors">
                Contato
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-500">
            © {currentYear} Júlio's Pizza House. Todos os direitos reservados. 
            <span className="block mt-2">
              Desenvolvido com ❤️ para os amantes de pizza em Londrina-PR
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};
