
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Phone, Mail, MapPin, Calendar, Clock, Users, User, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ContactForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome_completo: '',
    cpf: '',
    endereco: '',
    endereco_evento: '',
    data_evento: '',
    horario: '',
    quantidade_adultos: '',
    quantidade_criancas: '',
    telefone: '',
    observacoes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('formularios_contato')
        .insert([{
          nome_completo: formData.nome_completo,
          cpf: formData.cpf,
          endereco: formData.endereco,
          endereco_evento: formData.endereco_evento,
          data_evento: formData.data_evento,
          horario: formData.horario,
          quantidade_adultos: parseInt(formData.quantidade_adultos),
          quantidade_criancas: parseInt(formData.quantidade_criancas) || 0,
          telefone: formData.telefone,
          observacoes: formData.observacoes || null
        }]);

      if (error) throw error;

      toast({
        title: "Formulário enviado com sucesso!",
        description: "Entraremos em contato em breve para confirmar seu evento.",
      });

      setFormData({
        nome_completo: '',
        cpf: '',
        endereco: '',
        endereco_evento: '',
        data_evento: '',
        horario: '',
        quantidade_adultos: '',
        quantidade_criancas: '',
        telefone: '',
        observacoes: ''
      });
    } catch (error: any) {
      toast({
        title: "Erro ao enviar formulário",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <section id="contact" className="py-20 bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Envie sua Mensagem
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Preencha o formulário abaixo para solicitar um orçamento para seu evento.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl text-white text-center">
                Solicitar Orçamento para Evento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm font-medium flex items-center">
                      <User className="mr-2" size={16} />
                      Nome Completo *
                    </label>
                    <Input
                      name="nome_completo"
                      value={formData.nome_completo}
                      onChange={handleChange}
                      required
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm font-medium">
                      CPF *
                    </label>
                    <Input
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleChange}
                      required
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="000.000.000-00"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm font-medium flex items-center">
                      <Home className="mr-2" size={16} />
                      Endereço Residencial *
                    </label>
                    <Input
                      name="endereco"
                      value={formData.endereco}
                      onChange={handleChange}
                      required
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="Rua, número, bairro, cidade"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm font-medium flex items-center">
                      <MapPin className="mr-2" size={16} />
                      Endereço do Evento *
                    </label>
                    <Input
                      name="endereco_evento"
                      value={formData.endereco_evento}
                      onChange={handleChange}
                      required
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="Local onde será realizado o evento"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm font-medium flex items-center">
                      <Calendar className="mr-2" size={16} />
                      Data do Evento *
                    </label>
                    <Input
                      type="date"
                      name="data_evento"
                      value={formData.data_evento}
                      onChange={handleChange}
                      required
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm font-medium flex items-center">
                      <Clock className="mr-2" size={16} />
                      Horário *
                    </label>
                    <Input
                      type="time"
                      name="horario"
                      value={formData.horario}
                      onChange={handleChange}
                      required
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm font-medium flex items-center">
                      <Users className="mr-2" size={16} />
                      Quantidade de Adultos *
                    </label>
                    <Input
                      type="number"
                      name="quantidade_adultos"
                      value={formData.quantidade_adultos}
                      onChange={handleChange}
                      required
                      min="1"
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="Número de adultos"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm font-medium flex items-center">
                      <Users className="mr-2" size={16} />
                      Crianças (5 a 9 anos)
                    </label>
                    <Input
                      type="number"
                      name="quantidade_criancas"
                      value={formData.quantidade_criancas}
                      onChange={handleChange}
                      min="0"
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="Número de crianças (opcional)"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-gray-300 text-sm font-medium flex items-center">
                      <Phone className="mr-2" size={16} />
                      Telefone de Contato *
                    </label>
                    <Input
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleChange}
                      required
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="(43) 99999-9999"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-gray-300 text-sm font-medium">
                      Observações
                    </label>
                    <Textarea
                      name="observacoes"
                      value={formData.observacoes}
                      onChange={handleChange}
                      className="bg-gray-800 border-gray-600 text-white"
                      placeholder="Informações adicionais sobre o evento (opcional)"
                      rows={4}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-3 text-lg"
                  >
                    {loading ? 'Enviando...' : 'Solicitar Orçamento'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
