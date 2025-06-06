
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Users, MapPin, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Config {
  whatsapp_numero: string;
  whatsapp_mensagem: string;
  valor_adulto: string;
  valor_crianca: string;
  percentual_entrada: string;
}

export const ContactForm = () => {
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
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(false);
  const [valorCalculado, setValorCalculado] = useState({ total: 0, entrada: 0 });
  const { toast } = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  useEffect(() => {
    calcularValores();
  }, [formData.quantidade_adultos, formData.quantidade_criancas, config]);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('chave, valor')
        .in('chave', ['whatsapp_numero', 'whatsapp_mensagem', 'valor_adulto', 'valor_crianca', 'percentual_entrada']);
      
      if (error) throw error;
      
      const configObj = data.reduce((acc, item) => {
        acc[item.chave as keyof Config] = item.valor;
        return acc;
      }, {} as Config);
      
      setConfig(configObj);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const calcularValores = () => {
    if (!config) return;

    const adultos = parseInt(formData.quantidade_adultos) || 0;
    const criancas = parseInt(formData.quantidade_criancas) || 0;
    const valorAdulto = parseFloat(config.valor_adulto) || 0;
    const valorCrianca = parseFloat(config.valor_crianca) || 0;
    const percentualEntrada = parseFloat(config.percentual_entrada) || 0;

    const total = (adultos * valorAdulto) + (criancas * valorCrianca);
    const entrada = (total * percentualEntrada) / 100;

    setValorCalculado({ total, entrada });
  };

  const formatarMensagemWhatsApp = () => {
    if (!config) return '';

    const mensagem = `${config.whatsapp_mensagem}

*DADOS DO CLIENTE:*
Nome: ${formData.nome_completo}
CPF: ${formData.cpf}
Telefone: ${formData.telefone}
Endereço: ${formData.endereco}

*DADOS DO EVENTO:*
Data: ${new Date(formData.data_evento).toLocaleDateString('pt-BR')}
Horário: ${formData.horario}
Local: ${formData.endereco_evento}
Adultos: ${formData.quantidade_adultos}
Crianças: ${formData.quantidade_criancas}

*VALORES:*
Total: R$ ${valorCalculado.total.toFixed(2)}
Entrada (${config.percentual_entrada}%): R$ ${valorCalculado.entrada.toFixed(2)}
Restante: R$ ${(valorCalculado.total - valorCalculado.entrada).toFixed(2)}

${formData.observacoes ? `*OBSERVAÇÕES:*\n${formData.observacoes}` : ''}`;

    return encodeURIComponent(mensagem);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Salvar no banco de dados
      const { error } = await supabase
        .from('formularios_contato')
        .insert({
          ...formData,
          quantidade_adultos: parseInt(formData.quantidade_adultos),
          quantidade_criancas: parseInt(formData.quantidade_criancas) || 0,
          valor_total: valorCalculado.total,
          valor_entrada: valorCalculado.entrada
        });

      if (error) throw error;

      // Redirecionar para WhatsApp
      if (config?.whatsapp_numero) {
        const mensagem = formatarMensagemWhatsApp();
        const whatsappUrl = `https://wa.me/${config.whatsapp_numero}?text=${mensagem}`;
        window.open(whatsappUrl, '_blank');
      }

      toast({
        title: "Sucesso!",
        description: "Formulário enviado com sucesso! Você será redirecionado para o WhatsApp.",
      });

      // Limpar formulário
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
      console.error('Erro ao enviar formulário:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar formulário. Tente novamente.",
        variant: "destructive",
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
    <div className="bg-gray-900 py-16" id="contact">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Solicite seu Orçamento
            </h2>
            <p className="text-gray-400 text-lg">
              Preencha o formulário e receba um orçamento personalizado via WhatsApp
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-orange-400">Dados do Evento</CardTitle>
                  <CardDescription className="text-gray-400">
                    Preencha todas as informações para um orçamento preciso
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Nome Completo *
                        </label>
                        <Input
                          name="nome_completo"
                          value={formData.nome_completo}
                          onChange={handleChange}
                          required
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="Seu nome completo"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          CPF *
                        </label>
                        <Input
                          name="cpf"
                          value={formData.cpf}
                          onChange={handleChange}
                          required
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="000.000.000-00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Endereço Residencial *
                      </label>
                      <Input
                        name="endereco"
                        value={formData.endereco}
                        onChange={handleChange}
                        required
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Rua, número, bairro, cidade"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <MapPin className="inline mr-2" size={16} />
                        Endereço do Evento *
                      </label>
                      <Input
                        name="endereco_evento"
                        value={formData.endereco_evento}
                        onChange={handleChange}
                        required
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Local onde será realizado o evento"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <Calendar className="inline mr-2" size={16} />
                          Data do Evento *
                        </label>
                        <Input
                          type="date"
                          name="data_evento"
                          value={formData.data_evento}
                          onChange={handleChange}
                          required
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <Clock className="inline mr-2" size={16} />
                          Horário *
                        </label>
                        <Input
                          type="time"
                          name="horario"
                          value={formData.horario}
                          onChange={handleChange}
                          required
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <Users className="inline mr-2" size={16} />
                          Quantidade de Adultos *
                        </label>
                        <Input
                          type="number"
                          name="quantidade_adultos"
                          value={formData.quantidade_adultos}
                          onChange={handleChange}
                          required
                          min="1"
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="Número de adultos"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <Users className="inline mr-2" size={16} />
                          Crianças (5-9 anos)
                        </label>
                        <Input
                          type="number"
                          name="quantidade_criancas"
                          value={formData.quantidade_criancas}
                          onChange={handleChange}
                          min="0"
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="Número de crianças"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Telefone *
                      </label>
                      <Input
                        type="tel"
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleChange}
                        required
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="(43) 99999-9999"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Observações
                      </label>
                      <Textarea
                        name="observacoes"
                        value={formData.observacoes}
                        onChange={handleChange}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Informações adicionais sobre o evento"
                        rows={4}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                    >
                      {loading ? 'Enviando...' : 'Enviar Solicitação'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-orange-400 flex items-center">
                    <DollarSign className="mr-2" size={20} />
                    Valores
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {config && (
                    <>
                      <div className="text-gray-300">
                        <p className="text-sm">Valor por adulto: <span className="text-white">R$ {parseFloat(config.valor_adulto).toFixed(2)}</span></p>
                        <p className="text-sm">Valor por criança: <span className="text-white">R$ {parseFloat(config.valor_crianca).toFixed(2)}</span></p>
                      </div>
                      <hr className="border-gray-600" />
                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-white">
                          Total: R$ {valorCalculado.total.toFixed(2)}
                        </p>
                        <p className="text-orange-400">
                          Entrada ({config.percentual_entrada}%): R$ {valorCalculado.entrada.toFixed(2)}
                        </p>
                        <p className="text-gray-300">
                          Restante: R$ {(valorCalculado.total - valorCalculado.entrada).toFixed(2)}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-orange-400">Como Funciona</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">1</div>
                    <p className="text-gray-300 text-sm">Preencha o formulário com os dados do evento</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">2</div>
                    <p className="text-gray-300 text-sm">Receba o orçamento automaticamente via WhatsApp</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">3</div>
                    <p className="text-gray-300 text-sm">Confirme o pedido e organize todos os detalhes</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
