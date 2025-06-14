
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Trash2, Calendar, Clock, Users, Phone, MapPin } from 'lucide-react';
import { CalendarWithHighlight } from './CalendarWithHighlight';

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

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDate, setSearchDate] = useState('');

  // Estados para edição
  const [editando, setEditando] = useState(false);
  const [editData, setEditData] = useState<Formulario | null>(null);

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

  const salvarEdicao = async () => {
    if (!editData) return;
    const { id, ...dadosParaAtualizar } = editData;
    const { error } = await supabase
      .from('formularios_contato')
      .update(dadosParaAtualizar)
      .eq('id', id);
    if (!error) {
      setEditando(false);
      setSelectedFormulario({ ...editData });
      fetchFormularios();
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
    if (!dateStr) return '';

    const parts = dateStr.split(/[-T:]/); 
    if (parts.length < 3) return 'Data inválida';

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    if (isNaN(year) || isNaN(month) || isNaN(day)) return 'Data inválida';

    const utcDate = new Date(Date.UTC(year, month, day));

    return utcDate.toLocaleDateString('pt-BR', {
      timeZone: 'UTC',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5);
  };

  // Filtro aprimorado por nome (parcial) e CPF (completo)
  const formulariosFiltrados = formularios.filter((formulario) => {
    const termo = searchTerm.trim().toLowerCase();
    
    // Busca parcial por nome (aceita partes do nome)
    const nomeMatch = formulario.nome_completo.toLowerCase().includes(termo);
    
    // Busca exata por CPF (removendo formatação)
    const cpfLimpo = formulario.cpf.replace(/\D/g, '');
    const termoLimpo = termo.replace(/\D/g, '');
    const cpfMatch = termoLimpo && cpfLimpo === termoLimpo;
    
    const nomeCpfMatch = termo === '' || nomeMatch || cpfMatch;
    
    const dataMatch = searchDate
      ? formulario.data_evento === searchDate
      : true;
    
    return nomeCpfMatch && dataMatch;
  });

  // Obter datas únicas dos formulários para destacar no calendário
  const datasComRegistros = [...new Set(formularios.map(f => f.data_evento))];
  
  // Criar mapeamento de data para status (para destacar no calendário)
  const statusMap = formularios.reduce((acc, form) => {
    const data = form.data_evento;
    // Se já existe uma data, priorizar: pendente > confirmado > cancelado
    if (!acc[data] || 
        (form.status === 'pendente' && acc[data] !== 'pendente') ||
        (form.status === 'confirmado' && acc[data] === 'cancelado')) {
      acc[data] = form.status;
    }
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-bold">Formulários de Contato</h2>
        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <input
            type="text"
            placeholder="Filtrar por nome (parcial) ou CPF (completo)"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm"
          />
          <CalendarWithHighlight
            value={searchDate}
            onChange={setSearchDate}
            highlightDates={datasComRegistros}
            statusMap={statusMap}
          />
          <div className="text-sm text-gray-400 mt-1 md:mt-0 md:ml-4">
            Total: {formulariosFiltrados.length} formulários
          </div>
        </div>
      </div>

      <div className="flex space-x-2">
        <Badge className="bg-yellow-600">Pendente: {formulariosFiltrados.filter(f => f.status === 'pendente').length}</Badge>
        <Badge className="bg-green-600">Confirmado: {formulariosFiltrados.filter(f => f.status === 'confirmado').length}</Badge>
        <Badge className="bg-red-600">Cancelado: {formulariosFiltrados.filter(f => f.status === 'cancelado').length}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {formulariosFiltrados.map((formulario) => (
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
                      onClick={() => {
                        setSelectedFormulario(formulario);
                        setEditando(false);
                      }}
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
              {!editando && (
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setEditando(true);
                    setEditData(selectedFormulario);
                  }}
                >
                  Editar Orçamento
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {editando && editData ? (
                <>
                  <div>
                    <label className="text-gray-400 text-sm">Nome Completo</label>
                    <input
                      className="w-full bg-gray-700 text-white rounded px-2 py-1"
                      value={editData.nome_completo}
                      onChange={e => setEditData({ ...editData, nome_completo: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">CPF</label>
                    <input
                      className="w-full bg-gray-700 text-white rounded px-2 py-1"
                      value={editData.cpf}
                      onChange={e => setEditData({ ...editData, cpf: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Endereço Residencial</label>
                    <input
                      className="w-full bg-gray-700 text-white rounded px-2 py-1"
                      value={editData.endereco}
                      onChange={e => setEditData({ ...editData, endereco: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Endereço do Evento</label>
                    <input
                      className="w-full bg-gray-700 text-white rounded px-2 py-1"
                      value={editData.endereco_evento}
                      onChange={e => setEditData({ ...editData, endereco_evento: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-sm">Data do Evento</label>
                      <input
                        type="date"
                        className="w-full bg-gray-700 text-white rounded px-2 py-1"
                        value={editData.data_evento}
                        onChange={e => setEditData({ ...editData, data_evento: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Horário</label>
                      <input
                        type="time"
                        className="w-full bg-gray-700 text-white rounded px-2 py-1"
                        value={editData.horario}
                        onChange={e => setEditData({ ...editData, horario: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-sm">Adultos</label>
                      <input
                        type="number"
                        className="w-full bg-gray-700 text-white rounded px-2 py-1"
                        value={editData.quantidade_adultos}
                        onChange={e => setEditData({ ...editData, quantidade_adultos: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Crianças (5-9 anos)</label>
                      <input
                        type="number"
                        className="w-full bg-gray-700 text-white rounded px-2 py-1"
                        value={editData.quantidade_criancas}
                        onChange={e => setEditData({ ...editData, quantidade_criancas: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Telefone</label>
                    <input
                      className="w-full bg-gray-700 text-white rounded px-2 py-1"
                      value={editData.telefone}
                      onChange={e => setEditData({ ...editData, telefone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Observações</label>
                    <textarea
                      className="w-full bg-gray-700 text-white rounded px-2 py-1"
                      value={editData.observacoes || ''}
                      onChange={e => setEditData({ ...editData, observacoes: e.target.value })}
                    />
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <Button size="sm" className="bg-green-600" onClick={salvarEdicao}>
                      Salvar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditando(false);
                        setEditData(null);
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </>
              ) : (
                <>
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
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
