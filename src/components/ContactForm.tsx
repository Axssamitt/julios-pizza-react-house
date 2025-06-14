
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CalendarDays, Clock, Users, MapPin, Phone, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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
    quantidade_adultos: 1,
    quantidade_criancas: 0,
    telefone: '',
    observacoes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Inserir formulário no banco
      const { data: formulario, error } = await supabase
        .from('formularios_contato')
        .insert([formData])
        .select()
        .single();

      if (error) throw error;

      // Tentar enviar email de notificação (não falha se der erro)
      try {
        await supabase.functions.invoke('send-notification-email', {
          body: formData
        });
      } catch (emailError) {
        console.log('Email não enviado:', emailError);
      }

      toast({
        title: "Orçamento enviado com sucesso!",
        description: "Entraremos em contato em breve.",
      });

      // Limpar formulário
      setFormData({
        nome_completo: '',
        cpf: '',
        endereco: '',
        endereco_evento: '',
        data_evento: '',
        horario: '',
        quantidade_adultos: 1,
        quantidade_criancas: 0,
        telefone: '',
        observacoes: ''
      });

    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro ao enviar orçamento",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  return (
    <section id="orcamento" className="py-20 bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 bg-clip-text text-transparent">
              Solicite seu Orçamento
            </span>
          </h2>
          <p className="text-lg text-gray-300">
            Preencha o formulário e receba uma proposta personalizada
          </p>
        </div>

        <Card className="shadow-xl bg-gray-800 border-gray-700">
          <CardHeader className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white">
            <CardTitle className="text-2xl text-center">Formulário de Orçamento</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados Pessoais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <User className="mr-2 text-orange-400" size={16} />
                    Nome Completo *
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.nome_completo}
                    onChange={(e) => setFormData({...formData, nome_completo: e.target.value})}
                    className="w-full bg-gray-700 border-gray-600 text-white focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    CPF *
                  </label>
                  <Input
                    type="text"
                    required
                    maxLength={14}
                    value={formData.cpf}
                    onChange={(e) => setFormData({...formData, cpf: formatCPF(e.target.value)})}
                    placeholder="000.000.000-00"
                    className="w-full bg-gray-700 border-gray-600 text-white focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Endereços */}
              <div className="space-y-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <MapPin className="mr-2 text-orange-400" size={16} />
                    Endereço Residencial *
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.endereco}
                    onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                    className="w-full bg-gray-700 border-gray-600 text-white focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <MapPin className="mr-2 text-orange-400" size={16} />
                    Endereço do Evento *
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.endereco_evento}
                    onChange={(e) => setFormData({...formData, endereco_evento: e.target.value})}
                    className="w-full bg-gray-700 border-gray-600 text-white focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Data e Horário */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <CalendarDays className="mr-2 text-orange-400" size={16} />
                    Data do Evento *
                  </label>
                  <Input
                    type="date"
                    required
                    value={formData.data_evento}
                    onChange={(e) => setFormData({...formData, data_evento: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-gray-700 border-gray-600 text-white focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <Clock className="mr-2 text-orange-400" size={16} />
                    Horário de Início *
                  </label>
                  <Input
                    type="time"
                    required
                    value={formData.horario}
                    onChange={(e) => setFormData({...formData, horario: e.target.value})}
                    className="w-full bg-gray-700 border-gray-600 text-white focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Quantidade de Pessoas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <Users className="mr-2 text-orange-400" size={16} />
                    Quantidade de Adultos *
                  </label>
                  <Input
                    type="number"
                    required
                    min="1"
                    value={formData.quantidade_adultos}
                    onChange={(e) => setFormData({...formData, quantidade_adultos: parseInt(e.target.value) || 1})}
                    className="w-full bg-gray-700 border-gray-600 text-white focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <Users className="mr-2 text-orange-400" size={16} />
                    Quantidade de Crianças (5-9 anos)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.quantidade_criancas}
                    onChange={(e) => setFormData({...formData, quantidade_criancas: parseInt(e.target.value) || 0})}
                    className="w-full bg-gray-700 border-gray-600 text-white focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Telefone */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                  <Phone className="mr-2 text-orange-400" size={16} />
                  Telefone/WhatsApp *
                </label>
                <Input
                  type="tel"
                  required
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: formatPhone(e.target.value)})}
                  placeholder="(43) 99999-9999"
                  className="w-full bg-gray-700 border-gray-600 text-white focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              {/* Observações */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Observações Adicionais
                </label>
                <Textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  placeholder="Alguma informação adicional sobre o evento..."
                  className="w-full bg-gray-700 border-gray-600 text-white focus:border-orange-500 focus:ring-orange-500"
                  rows={4}
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 hover:from-orange-600 hover:via-red-600 hover:to-orange-700 text-white py-3 text-lg font-semibold transition-all duration-300"
              >
                {loading ? 'Enviando...' : 'Solicitar Orçamento'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
