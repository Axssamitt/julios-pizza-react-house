
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CalendarDays, Clock, Users, MapPin, Phone, User, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NovoFormularioModalProps {
  onFormularioAdicionado: () => void;
}

export const NovoFormularioModal = ({ onFormularioAdicionado }: NovoFormularioModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
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
      const { error } = await supabase
        .from('formularios_contato')
        .insert([formData]);

      if (error) throw error;

      toast({
        title: "Formulário criado com sucesso!",
        description: "O novo formulário foi adicionado à lista.",
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

      setOpen(false);
      onFormularioAdicionado();

    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro ao criar formulário",
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2" size={16} />
          Novo Formulário
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">Criar Novo Formulário</DialogTitle>
        </DialogHeader>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Dados Pessoais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="bg-gray-700 border-gray-600 text-white"
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
                    className="bg-gray-700 border-gray-600 text-white"
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
                    className="bg-gray-700 border-gray-600 text-white"
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
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              {/* Data e Horário */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="bg-gray-700 border-gray-600 text-white"
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
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              {/* Quantidade de Pessoas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="bg-gray-700 border-gray-600 text-white"
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
                    className="bg-gray-700 border-gray-600 text-white"
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
                  className="bg-gray-700 border-gray-600 text-white"
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
                  className="bg-gray-700 border-gray-600 text-white"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Criando...' : 'Criar Formulário'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
