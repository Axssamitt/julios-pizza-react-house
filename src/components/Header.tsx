import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { label: 'INÍCIO', href: '#home' },
    { label: 'SOBRE NÓS', href: '#about' },
    { label: 'CARDÁPIO', href: '/cardapio' },
    { label: 'INSTAGRAM', href: '#instagram' },
    { label: 'CONTATO', href: '#contact' },
    { label: 'ADMIN', href: '/auth' }
  ];

  const handleMenuClick = (href: string) => {
    setIsMenuOpen(false);
    if (href.startsWith('#')) {
      if (location.pathname !== '/') {
        // Navega para a home e faz scroll após o carregamento
        navigate('/', { replace: false });
        setTimeout(() => {
          const element = document.querySelector(href);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 300); // Pequeno delay para garantir renderização
      } else {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  // ...restante do componente permanece igual...

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-orange-500/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-orange-500">
              <img 
                src="https://storage.googleapis.com/wzukusers/user-34847409/images/5cf9a50e698b6eDiLZd7/logoo_d200.png" 
                alt="Júlio's Pizza House Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Júlio's Pizza House
              </h1>
              <p className="text-orange-400 text-sm">O sabor vai até você</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {menuItems.map((item) => {
              if (item.href.startsWith('/')) {
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={`text-gray-300 hover:text-orange-400 transition-colors duration-200 font-medium text-center ${
                      item.label === 'ADMIN' ? 'bg-orange-500/20 px-3 py-1 rounded-md border border-orange-500/50' : ''
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              }
              return (
                <button
                  key={item.label}
                  onClick={() => handleMenuClick(item.href)}
                  className="text-gray-300 hover:text-orange-400 transition-colors duration-200 font-medium text-center"
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-white hover:text-orange-400"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 border-t border-gray-700 pt-4">
            <div className="flex flex-col space-y-3">
              {menuItems.map((item) => {
                if (item.href.startsWith('/')) {
                  return (
                    <Link
                      key={item.label}
                      to={item.href}
                      className={`text-gray-300 hover:text-orange-400 transition-colors duration-200 font-medium text-center ${
                        item.label === 'ADMIN' ? 'bg-orange-500/20 px-3 py-2 rounded-md border border-orange-500/50' : ''
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  );
                }
                return (
                  <button
                    key={item.label}
                    onClick={() => handleMenuClick(item.href)}
                    className="text-gray-300 hover:text-orange-400 transition-colors duration-200 font-medium text-center"
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
