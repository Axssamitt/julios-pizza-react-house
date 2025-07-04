
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Contrato } from './Contrato';
import { Recibo } from './Recibo';

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
  valor_entrada?: number | null;
}

interface ItemAdicional {
  id?: string;
  descricao: string;
  valor: number;
  quantidade: number;
}

interface Parcela {
  id?: string;
  numero_parcela: number;
  valor_parcela: number;
  data_vencimento: string;
  status: string;
}

interface Config {
  chave: string;
  valor: string;
}

export const ContratoManager = () => {
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [selectedFormulario, setSelectedFormulario] = useState<Formulario | null>(null);
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [itensAdicionais, setItensAdicionais] = useState<ItemAdicional[]>([]);
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [showContrato, setShowContrato] = useState(false);
  const [showRecibo, setShowRecibo] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchFormularios();
    fetchConfigs();
  }, []);

  useEffect(() => {
    if (selectedFormulario) {
      fetchItensAdicionais(selectedFormulario.id);
      fetchParcelas(selectedFormulario.id);
    } else {
      setItensAdicionais([]);
      setParcelas([]);
    }
  }, [selectedFormulario, configs]);

  const fetchItensAdicionais = async (formularioId: string) => {
    const { data, error } = await supabase
      .from('contrato_itens_adicionais')
      .select('*')
      .eq('formulario_id', formularioId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setItensAdicionais(data.map(item => ({
        id: item.id,
        descricao: item.descricao,
        valor: parseFloat(item.valor.toString()),
        quantidade: item.quantidade
      })));
    }
  };

  const fetchParcelas = async (formularioId: string) => {
    const { data, error } = await supabase
      .from('contrato_parcelamentos')
      .select('*')
      .eq('formulario_id', formularioId)
      .order('numero_parcela', { ascending: true });

    if (!error && data) {
      setParcelas(data.map(parcela => ({
        id: parcela.id,
        numero_parcela: parcela.numero_parcela,
        valor_parcela: parseFloat(parcela.valor_parcela.toString()),
        data_vencimento: parcela.data_vencimento,
        status: parcela.status
      })));
    }
  };

  const fetchFormularios = async () => {
    const { data, error } = await supabase
      .from('formularios_contato')
      .select('*')
      .eq('status', 'confirmado')
      .order('data_evento', { ascending: true });

    if (!error && data) {
      setFormularios(data);
    }
  };

  const fetchConfigs = async () => {
    const { data, error } = await supabase
      .from('configuracoes')
      .select('chave, valor')
      .eq('ativo', true);

    if (!error && data) {
      const configMap = data.reduce((acc: Record<string, string>, config: Config) => {
        acc[config.chave] = config.valor;
        return acc;
      }, {});
      setConfigs(configMap);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';

    const parts = dateStr.split(/[-T:]/);
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

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

  const calcularValorTotal = (adultos: number, criancas: number, itensAdicionais: ItemAdicional[] = []) => {
    const valorAdulto = parseFloat(configs.valor_adulto || '55.00');
    const valorCrianca = parseFloat(configs.valor_crianca || '27.00');
    const valorBase = (adultos * valorAdulto) + (criancas * valorCrianca);
    const valorItens = itensAdicionais.reduce((acc, item) => acc + (item.valor * item.quantidade), 0);
    return valorBase + valorItens;
  };

  const handleShowContrato = (formulario: Formulario) => {
    setSelectedFormulario(formulario);
    setShowContrato(true);
    setShowRecibo(false);
  };

  const handleShowRecibo = (formulario: Formulario) => {
    setSelectedFormulario(formulario);
    setShowRecibo(true);
    setShowContrato(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Geração de Contratos e Recibos</h2>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-orange-400">Eventos Confirmados</h3>
          {formularios.map((formulario) => (
            <Card key={formulario.id} className="bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-orange-500/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-white">{formulario.nome_completo}</h4>
                    <p className="text-gray-400 text-sm">Data: {formatDate(formulario.data_evento)} às {formatTime(formulario.horario)}</p>
                    <p className="text-gray-400 text-sm">
                      {formulario.quantidade_adultos} adultos, {formulario.quantidade_criancas} crianças
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-400 font-bold">
                      R$ {calcularValorTotal(formulario.quantidade_adultos, formulario.quantidade_criancas, selectedFormulario?.id === formulario.id ? itensAdicionais : []).toFixed(2).replace('.', ',')}
                    </p>
                    <p className="text-gray-400 text-sm">Total</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button 
                    size="sm" 
                    onClick={() => handleShowContrato(formulario)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Gerar Contrato
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleShowRecibo(formulario)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Gerar Recibo
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Render Contrato or Recibo components */}
        {showContrato && selectedFormulario && (
          <Contrato
            formulario={selectedFormulario}
            configs={configs}
            itensAdicionais={itensAdicionais}
            parcelas={parcelas}
            onClose={() => setShowContrato(false)}
            formatDate={formatDate}
            formatTime={formatTime}
            calcularValorTotal={calcularValorTotal}
          />
        )}

        {showRecibo && selectedFormulario && (
          <Recibo
            formulario={selectedFormulario}
            configs={configs}
            itensAdicionais={itensAdicionais}
            parcelas={parcelas}
            onClose={() => setShowRecibo(false)}
            formatDate={formatDate}
            formatTime={formatTime}
            calcularValorTotal={calcularValorTotal}
          />
        )}
      </div>
    </div>
  );
};
