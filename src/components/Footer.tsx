
import React, { useState, useEffect } from 'react';
import { Facebook, Instagram, Phone, MapPin, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatPhoneBrazil } from '@/utils/supabaseStorage';

interface FooterConfig {
  nome_empresa: string;
  visivel_nome_empresa: boolean;
  endereco: string;
  visivel_endereco: boolean;
  telefone: string;
  visivel_telefone: boolean;
  facebook_url: string;
  visivel_facebook: boolean;
  instagram_url: string;
  visivel_instagram: boolean;
}

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [whatsappNumero, setWhatsappNumero] = useState('(43) 99126-7766');
  const [footerConfig, setFooterConfig] = useState<FooterConfig>({
    nome_empresa: 'Júlio\'s Pizza House',
    visivel_nome_empresa: true,
    endereco: 'Londrina - PR',
    visivel_endereco: true,
    telefone: '(43) 99126-7766',
    visivel_telefone: true,
    facebook_url: 'https://www.facebook.com/JuliosPIZZAHOUSE/',
    visivel_facebook: true,
    instagram_url: 'https://instagram.com/juliospizzahouse',
    visivel_instagram: true
  });

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const fetchConfigurations = async () => {
    try {
      // Buscar configuração do WhatsApp
      const { data: whatsappData, error: whatsappError } = await supabase
        .from('configuracoes')
        .select('valor')
        .eq('chave', 'whatsapp_numero')
        .single();
      
      if (!whatsappError && whatsappData) {
        setWhatsappNumero(formatPhoneBrazil(whatsappData.valor));
      }

      // Buscar configurações do footer
      const { data: footerData, error: footerError } = await supabase
        .from('home_config')
        .select('nome_empresa, visivel_nome_empresa, endereco, visivel_endereco, telefone, visivel_telefone, facebook_url, visivel_facebook, instagram_url, visivel_instagram')
        .single();
      
      if (!footerError && footerData) {
        setFooterConfig(prev => ({
          nome_empresa: footerData.nome_empresa || prev.nome_empresa,
          visivel_nome_empresa: footerData.visivel_nome_empresa !== false,
          endereco: footerData.endereco || prev.endereco,
          visivel_endereco: footerData.visivel_endereco !== false,
          telefone: footerData.telefone || prev.telefone,
          visivel_telefone: footerData.visivel_telefone !== false,
          facebook_url: footerData.facebook_url || prev.facebook_url,
          visivel_facebook: footerData.visivel_facebook !== false,
          instagram_url: footerData.instagram_url || prev.instagram_url,
          visivel_instagram: footerData.visivel_instagram !== false
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handlePhoneClick = () => {
    const numeroLimpo = whatsappNumero.replace(/\D/g, '');
    window.open(`https://wa.me/55${numeroLimpo}`, '_blank');
  };

  return (
    <>
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
                  {footerConfig.visivel_nome_empresa && (
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                      {footerConfig.nome_empresa}
                    </h3>
                  )}
                  <p className="text-orange-400">O sabor vai até você</p>
                </div>
              </div>
              <p className="text-gray-400 max-w-md mb-6">
                Há anos levando o melhor sabor da pizza artesanal para Londrina e região. 
                Ingredientes frescos, massa artesanal e muito amor em cada fatia.
              </p>
              <div className="flex space-x-4">
                {footerConfig.visivel_facebook && (
                  <a 
                    href={footerConfig.facebook_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                  >
                    <Facebook size={20} className="text-white" />
                  </a>
                )}
                {footerConfig.visivel_instagram && (
                  <a 
                    href={footerConfig.instagram_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors"
                  >
                    <Instagram size={20} className="text-white" />
                  </a>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-white font-semibold text-lg mb-6">Contato</h4>
              <div className="space-y-4">
                {footerConfig.visivel_telefone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="text-orange-400" size={18} />
                    <button 
                      onClick={handlePhoneClick}
                      className="text-gray-400 hover:text-orange-400 transition-colors"
                    >
                      {footerConfig.telefone}
                    </button>
                  </div>
                )}
                {footerConfig.visivel_endereco && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="text-orange-400" size={18} />
                    <span className="text-gray-400">{footerConfig.endereco}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-semibold text-lg mb-6">Links Rápidos</h4>
              <div className="space-y-3">
                <a href="#home" className="block text-gray-400 hover:text-orange-400 transition-colors">
                  Início
                </a>
                <a href="#about" className="block text-gray-400 hover:text-orange-400 transition-colors">
                  Sobre Nós
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
              © {currentYear} {footerConfig.nome_empresa}. Todos os direitos reservados. 
              <span className="block mt-2">
                Desenvolvido com ❤️ para os amantes de pizza em Londrina-PR
              </span>
            </p>
          </div>
        </div>
      </footer>

      {/* Botão flutuante do WhatsApp */}
      <button
        onClick={handlePhoneClick}
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
        aria-label="Entrar em contato via WhatsApp"
      >
        <MessageCircle size={24} />
      </button>
    </>
  );
};
