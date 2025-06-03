
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Edit, Trash2, Calendar, Clock, Users, Phone, MapPin } from 'lucide-react';

interface Formulario {
  id: string;
  nome_completo: string;
  cpf: string;
  endereco: string;
  endereco_evento: string;
  data_evento: string;
  horario: string;
  quantidade_adultos: number;
  quantidade_criancas: number;
  telefone: string;
  observacoes: string | null;
  status: string;
  created_at: string;
}

export const FormularioManager = () => {
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [selectedFormulario, setSelectedFormulario] = useState<Formulario | null>(null);

  useEffect(() => {
    fetchFormularios();
  }, []);

  const fetchFormularios = async () => {
    const { data, error } = await supabase
      .from('formularios_contato')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setFormularios(data);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('formularios_contato')
      .update({ status })
      .eq('id', id);

    if (!error) {
      fetchFormularios();
    }
  };

  const deleteFormulario = async (id: string) => {
    const { error } = await supabase
      .from('formularios_contato')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchFormularios();
      setSelectedFormulario(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-600';
      case 'confirmado': return 'bg-green-600';
      case 'cancelado': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Formulários de Contato</h2>
        <div className="flex space-x-2">
          <Badge className="bg-yellow-600">Pendente: {formularios.filter(f => f.status === 'pendente').length}</Badge>
          <Badge className="bg-green-600">Confirmado: {formularios.filter(f => f.status === 'confirmado').length}</Badge>
          <Badge className="bg-red-600">Cancelado: {formularios.filter(f => f.status === 'cancelado').length}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {formularios.map((formulario) => (
            <Card key={formulario.id} className="bg-gray-800 border-gray-700 hover:border-orange-500/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{formulario.nome_completo}</h3>
                    <p className="text-gray-400 text-sm">CPF: {formulario.cpf}</p>
                  </div>
                  <Badge className={getStatusColor(formulario.status)}>
                    {formulario.status}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-300">
                    <Calendar className="mr-2" size={14} />
                    {formatDate(formulario.data_evento)} às {formatTime(formulario.horario)}
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Users className="mr-2" size={14} />
                    {formulario.quantidade_adultos} adultos, {formulario.quantidade_criancas} crianças
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Phone className="mr-2" size={14} />
                    {formulario.telefone}
                  </div>
                  <div className="flex items-center text-gray-300">
                    <MapPin className="mr-2" size={14} />
                    {formulario.endereco_evento}
                  </div>
                </div>

                <div className="flex justify-between mt-4">
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateStatus(formulario.id, 'confirmado')}
                      className="border-green-600 text-green-400 hover:bg-green-600"
                      disabled={formulario.status === 'confirmado'}
                    >
                      Confirmar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateStatus(formulario.id, 'cancelado')}
                      className="border-red-600 text-red-400 hover:bg-red-600"
                      disabled={formulario.status === 'cancelado'}
                    >
                      Cancelar
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedFormulario(formulario)}
                      className="border-gray-600"
                    >
                      <Eye className="mr-1" size={14} />
                      Ver
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => deleteFormulario(formulario.id)}
                    >
                      <Trash2 className="mr-1" size={14} />
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedFormulario && (
          <Card className="bg-gray-800 border-gray-700 sticky top-4">
            <CardHeader>
              <CardTitle className="text-orange-400">Detalhes do Formulário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Nome Completo</label>
                <p className="text-white">{selectedFormulario.nome_completo}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">CPF</label>
                <p className="text-white">{selectedFormulario.cpf}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Endereço Residencial</label>
                <p className="text-white">{selectedFormulario.endereco}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Endereço do Evento</label>
                <p className="text-white">{selectedFormulario.endereco_evento}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Data do Evento</label>
                  <p className="text-white">{formatDate(selectedFormulario.data_evento)}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Horário</label>
                  <p className="text-white">{formatTime(selectedFormulario.horario)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Adultos</label>
                  <p className="text-white">{selectedFormulario.quantidade_adultos}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Crianças (5-9 anos)</label>
                  <p className="text-white">{selectedFormulario.quantidade_criancas}</p>
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Telefone</label>
                <p className="text-white">{selectedFormulario.telefone}</p>
              </div>
              {selectedFormulario.observacoes && (
                <div>
                  <label className="text-gray-400 text-sm">Observações</label>
                  <p className="text-white">{selectedFormulario.observacoes}</p>
                </div>
              )}
              <div>
                <label className="text-gray-400 text-sm">Status</label>
                <p className="text-white">
                  <Badge className={getStatusColor(selectedFormulario.status)}>
                    {selectedFormulario.status}
                  </Badge>
                </p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Data de Criação</label>
                <p className="text-white">{formatDate(selectedFormulario.created_at)}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
