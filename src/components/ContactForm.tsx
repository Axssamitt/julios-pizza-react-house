
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ContactForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    email: '',
    telefone: '',
    mensagem: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Mensagem enviada!",
      description: "Entraremos em contato em breve. Obrigado!",
    });

    setFormData({
      nome: '',
      sobrenome: '',
      email: '',
      telefone: '',
      mensagem: ''
    });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <section id="contact" className="py-20 bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Entre em Contato
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            A melhor pizza vai até a sua festa, casa ou eventos. Fale conosco!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-8">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Phone className="text-orange-400 mr-3" size={24} />
                  Telefone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-lg">(43) 99999-9999</p>
                <p className="text-gray-500">WhatsApp disponível</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MapPin className="text-orange-400 mr-3" size={24} />
                  Localização
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-lg">Londrina - PR</p>
                <p className="text-gray-500">Entregamos em toda a cidade</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Clock className="text-orange-400 mr-3" size={24} />
                  Horário de Funcionamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-gray-300">
                  <p>Segunda à Domingo</p>
                  <p className="text-lg font-medium">18:00 - 23:00</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Mail className="text-orange-400 mr-3" size={24} />
                  Redes Sociais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <a 
                    href="https://www.facebook.com/JuliosPIZZAHOUSE/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Facebook: JuliosPIZZAHOUSE
                  </a>
                  <a 
                    href="https://instagram.com/juliospizzahouse" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block text-pink-400 hover:text-pink-300 transition-colors"
                  >
                    Instagram: @juliospizzahouse
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Envie sua Mensagem</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="nome" className="block text-gray-300 mb-2">Nome</label>
                    <Input
                      id="nome"
                      name="nome"
                      type="text"
                      value={formData.nome}
                      onChange={handleChange}
                      className="bg-gray-800 border-gray-600 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="sobrenome" className="block text-gray-300 mb-2">Sobrenome</label>
                    <Input
                      id="sobrenome"
                      name="sobrenome"
                      type="text"
                      value={formData.sobrenome}
                      onChange={handleChange}
                      className="bg-gray-800 border-gray-600 text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-gray-300 mb-2">Email</label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="telefone" className="block text-gray-300 mb-2">Telefone</label>
                  <Input
                    id="telefone"
                    name="telefone"
                    type="tel"
                    value={formData.telefone}
                    onChange={handleChange}
                    className="bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="mensagem" className="block text-gray-300 mb-2">Mensagem</label>
                  <Textarea
                    id="mensagem"
                    name="mensagem"
                    rows={4}
                    value={formData.mensagem}
                    onChange={handleChange}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="Conte-nos sobre seu evento ou pedido especial..."
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3"
                >
                  {isSubmitting ? (
                    "Enviando..."
                  ) : (
                    <>
                      <Send className="mr-2" size={20} />
                      Enviar Mensagem
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
