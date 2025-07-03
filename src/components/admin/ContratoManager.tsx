
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Download, Plus, Trash2, Calendar, Calculator } from 'lucide-react';
import { numberToWordsBrazilian } from '@/utils/supabaseStorage';
import { jsPDF } from 'jspdf';

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
  const [contratoGerado, setContratoGerado] = useState<string>('');
  const [reciboGerado, setReciboGerado] = useState<string>('');
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [itensAdicionais, setItensAdicionais] = useState<ItemAdicional[]>([]);
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [novoItem, setNovoItem] = useState<ItemAdicional>({ descricao: '', valor: 0, quantidade: 1 });
  const [valorEntradaEditavel, setValorEntradaEditavel] = useState<number | string>('');
  const [numeroParcelas, setNumeroParcelas] = useState<number>(1);
  const [primeiraParcela, setPrimeiraParcela] = useState<string>('');
  const [showParcelamento, setShowParcelamento] = useState<boolean>(false);

  useEffect(() => {
    fetchFormularios();
    fetchConfigs();
  }, []);

  useEffect(() => {
    if (selectedFormulario) {
      fetchItensAdicionais(selectedFormulario.id);
      fetchParcelas(selectedFormulario.id);
      const valorTotalCalculado = calcularValorTotal(selectedFormulario.quantidade_adultos, selectedFormulario.quantidade_criancas, itensAdicionais);
      const entradaCalculada = calcularEntrada(valorTotalCalculado);

      if (selectedFormulario.valor_entrada && selectedFormulario.valor_entrada > 0) {
        setValorEntradaEditavel(selectedFormulario.valor_entrada.toFixed(2));
      } else {
        setValorEntradaEditavel(entradaCalculada.toFixed(2));
      }
    } else {
      setValorEntradaEditavel('');
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
        valor: parseFloat(item.valor),
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
        valor_parcela: parseFloat(parcela.valor_parcela),
        data_vencimento: parcela.data_vencimento,
        status: parcela.status
      })));
    }
  };

  const salvarItemAdicional = async () => {
    if (!selectedFormulario || !novoItem.descricao || novoItem.valor === 0) return;

    const { error } = await supabase
      .from('contrato_itens_adicionais')
      .insert({
        formulario_id: selectedFormulario.id,
        descricao: novoItem.descricao,
        valor: novoItem.valor,
        quantidade: novoItem.quantidade
      });

    if (!error) {
      await fetchItensAdicionais(selectedFormulario.id);
      setNovoItem({ descricao: '', valor: 0, quantidade: 1 });
    }
  };

  const removerItemAdicional = async (itemId: string) => {
    const { error } = await supabase
      .from('contrato_itens_adicionais')
      .delete()
      .eq('id', itemId);

    if (!error && selectedFormulario) {
      await fetchItensAdicionais(selectedFormulario.id);
    }
  };

  const gerarParcelas = () => {
    if (!selectedFormulario || !primeiraParcela || numeroParcelas < 1) return;

    const valorTotal = calcularValorTotal(selectedFormulario.quantidade_adultos, selectedFormulario.quantidade_criancas, itensAdicionais);
    const entrada = parseFloat(String(valorEntradaEditavel)) || calcularEntrada(valorTotal);
    const saldoRestante = valorTotal - entrada;
    const valorParcela = saldoRestante / numeroParcelas;

    const novasParcelas: Parcela[] = [];
    for (let i = 1; i <= numeroParcelas; i++) {
      const dataVencimento = new Date(primeiraParcela);
      dataVencimento.setMonth(dataVencimento.getMonth() + (i - 1));
      
      novasParcelas.push({
        numero_parcela: i,
        valor_parcela: valorParcela,
        data_vencimento: dataVencimento.toISOString().split('T')[0],
        status: 'pendente'
      });
    }

    setParcelas(novasParcelas);
  };

  const salvarParcelas = async () => {
    if (!selectedFormulario || parcelas.length === 0) return;

    // Deletar parcelas existentes
    await supabase
      .from('contrato_parcelamentos')
      .delete()
      .eq('formulario_id', selectedFormulario.id);

    // Inserir novas parcelas
    const { error } = await supabase
      .from('contrato_parcelamentos')
      .insert(
        parcelas.map(parcela => ({
          formulario_id: selectedFormulario.id,
          numero_parcela: parcela.numero_parcela,
          valor_parcela: parcela.valor_parcela,
          data_vencimento: parcela.data_vencimento,
          status: parcela.status
        }))
      );

    if (!error) {
      await fetchParcelas(selectedFormulario.id);
      setShowParcelamento(false);
    }
  };

  const handleSalvarValorEntrada = async () => {
    if (!selectedFormulario || valorEntradaEditavel === '') {
      console.error("Formulário não selecionado ou valor de entrada vazio.");
      return;
    }

    const novoValorEntrada = parseFloat(String(valorEntradaEditavel));
    if (isNaN(novoValorEntrada)) {
      console.error("Valor de entrada inválido.");
      return;
    }

    const { data, error } = await supabase
      .from('formularios_contato')
      .update({ valor_entrada: novoValorEntrada })
      .eq('id', selectedFormulario.id)
      .select();

    if (error) {
      console.error('Erro ao salvar valor da entrada:', error);
    } else {
      console.log('Valor da entrada salvo com sucesso:', data);
      
      setFormularios(prevFormularios => 
        prevFormularios.map(f => 
          f.id === selectedFormulario.id ? { ...f, valor_entrada: novoValorEntrada } : f
        )
      );
      setSelectedFormulario(prev => prev ? { ...prev, valor_entrada: novoValorEntrada } : null);
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

  const calcularEntrada = (valorTotal: number) => {
    const percentualEntrada = parseFloat(configs.percentual_entrada || '40') / 100;
    return valorTotal * percentualEntrada;
  };

  const gerarContrato = (formulario: Formulario) => {
    const valorTotal = calcularValorTotal(formulario.quantidade_adultos, formulario.quantidade_criancas, itensAdicionais);
   
    let entrada: number;
    if (formulario.valor_entrada && formulario.valor_entrada > 0) {
      entrada = formulario.valor_entrada;
    } else {
      entrada = calcularEntrada(valorTotal); 
    }
    
    const restante = valorTotal - entrada;
    const valorAdulto = parseFloat(configs.valor_adulto || '55.00');
    const valorCrianca = parseFloat(configs.valor_crianca || '27.00');
    const percentualEntrada = parseFloat(configs.percentual_entrada || '40');
    
    let itensTexto = '';
    if (itensAdicionais.length > 0) {
      itensTexto = '\nITENS ADICIONAIS:\n';
      itensAdicionais.forEach(item => {
        const valorItem = item.valor * item.quantidade;
        const tipoItem = item.valor < 0 ? 'Desconto' : 'Item';
        itensTexto += `• ${item.descricao} (${tipoItem}): ${item.quantidade}x R$ ${Math.abs(item.valor).toFixed(2).replace('.', ',')} = R$ ${valorItem.toFixed(2).replace('.', ',')}\n`;
      });
    }

    let parcelamentoTexto = '';
    if (parcelas.length > 0) {
      parcelamentoTexto = '\n\nPARCELAMENTO DO SALDO:\n';
      parcelas.forEach(parcela => {
        parcelamentoTexto += `• Parcela ${parcela.numero_parcela}: R$ ${parcela.valor_parcela.toFixed(2).replace('.', ',')} - Vencimento: ${formatDate(parcela.data_vencimento)}\n`;
      });
    }
    
    const contrato = `
JULIO'S PIZZA HOUSE
CONTRATO DE PRESTAÇÃO DE SERVIÇOS

CONTRATANTE: ${formulario.nome_completo.toUpperCase()}
CPF: ${formulario.cpf}
Endereço: ${formulario.endereco.toUpperCase()}

CONTRATADA: JULIO'S PIZZA HOUSE
Endereço: Rua Alzira Postali Gewrher, nº 119
Bairro: Jardim Catuai, CEP: 86086-230
Londrina - Paraná
CPF: 034.988.389-03
Responsável: Sr. Júlio Cesar Fermino

OBJETO DO CONTRATO

O presente contrato tem por objeto a prestação de serviços de rodízio de pizza para evento que se realizará em:

Data: ${formatDate(formulario.data_evento)}
Horário: ${formatTime(formulario.horario)} às ${String(parseInt(formulario.horario.split(':')[0]) + 3).padStart(2, '0')}:${formulario.horario.split(':')[1]}
Local: ${formulario.endereco_evento.toUpperCase()}

DETALHES DO EVENTO

Número de pessoas confirmadas:
• Adultos: ${formulario.quantidade_adultos} pessoas
• Crianças (5-9 anos): ${formulario.quantidade_criancas} pessoas
• Total: ${formulario.quantidade_adultos + formulario.quantidade_criancas} pessoas${itensTexto}

OBRIGAÇÕES DA CONTRATANTE

A CONTRATANTE deverá:
• Fornecer todas as informações necessárias
• Efetuar o pagamento conforme estabelecido
• Disponibilizar local ventilado e tomada 220V

OBRIGAÇÕES DA CONTRATADA

A CONTRATADA se compromete a:
• Fornecer rodízio de pizza de alta qualidade
• Disponibilizar pelo menos 1 pizzaiolo e ${Math.ceil((formulario.quantidade_adultos + formulario.quantidade_criancas) / 30)} garçom(s)
• Manter funcionários uniformizados
• Preparar quantidade suficiente para até 10% a mais

OBSERVAÇÃO: Excedente de horário será cobrado R$ 300,00 a cada meia hora ultrapassada.
\f
VALORES E FORMA DE PAGAMENTO

Valor por pessoa:
• Adultos: R$ ${valorAdulto.toFixed(2).replace('.', ',')} cada
• Crianças: R$ ${valorCrianca.toFixed(2).replace('.', ',')} cada

VALOR TOTAL DO SERVIÇO: R$ ${valorTotal.toFixed(2).replace('.', ',')}

Forma de pagamento:
• Entrada (${percentualEntrada}%): R$ ${entrada.toFixed(2).replace('.', ',')}
  (Depositar na Caixa Econômica - Ag: 1479 - Conta: 00028090-5)
• Restante: R$ ${restante.toFixed(2).replace('.', ',')}
  (A ser pago até o dia anterior ao evento)${parcelamentoTexto}

CANCELAMENTO

O contrato pode ser rescindido por qualquer parte com comunicação formal até 10 dias antes do evento, com devolução da entrada. Cancelamento após pagamento da entrada: valor será creditado para futura contratação em até 30 dias.

LONDRINA, ${new Date().toLocaleDateString('pt-BR')}

_________________________________
CONTRATANTE
${formulario.nome_completo}
CPF: ${formulario.cpf}

_________________________________
CONTRATADA
Júlio Cesar Fermino
CPF: 034.988.389-03
`;

    setContratoGerado(contrato);
  };

  const gerarRecibo = (formulario: Formulario) => {
    const valorTotal = calcularValorTotal(formulario.quantidade_adultos, formulario.quantidade_criancas, itensAdicionais);
    
    let entradaRecibo: number;
    if (formulario.valor_entrada && formulario.valor_entrada > 0) {
      entradaRecibo = formulario.valor_entrada;
    } else {
      entradaRecibo = calcularEntrada(valorTotal);
    }
    
    const percentualEntrada = parseFloat(configs.percentual_entrada || '40');
    
    const recibo = `
JULIO'S PIZZA HOUSE
RECIBO DE ENTRADA

RECIBO Nº: ${formulario.id.substring(0, 8).toUpperCase()}

Recebemos de: ${formulario.nome_completo}
CPF: ${formulario.cpf}
Endereço: ${formulario.endereco}

A importância de: R$ ${entradaRecibo.toFixed(2).replace('.', ',')}
(${numberToWordsBrazilian(entradaRecibo)})

REFERENTE A:
Entrada para contratação de serviço de rodízio de pizza

DETALHES DO EVENTO:
• Data: ${formatDate(formulario.data_evento)}
• Horário: ${formatTime(formulario.horario)}
• Local: ${formulario.endereco_evento}
• Pessoas: ${formulario.quantidade_adultos} adultos${formulario.quantidade_criancas > 0 ? ` e ${formulario.quantidade_criancas} crianças` : ''}

RESUMO FINANCEIRO:
• Valor total do serviço: R$ ${valorTotal.toFixed(2).replace('.', ',')}
• Entrada (${percentualEntrada}%): R$ ${entradaRecibo.toFixed(2).replace('.', ',')}
• Saldo restante: R$ ${(valorTotal - entradaRecibo).toFixed(2).replace('.', ',')}
  (a ser pago até o dia anterior ao evento)

Data de emissão: ${new Date().toLocaleDateString('pt-BR')}

_________________________________
Júlio Cesar Fermino
CPF: 034.988.389-03
Júlio's Pizza House
`;

    setReciboGerado(recibo);
  };

  const downloadPDF = (content: string, filename: string) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    doc.setFont('courier');
    doc.setFontSize(10);

    const marginLeft = 12;
    const marginRight = 12;
    const marginTop = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const usableWidth = pageWidth - marginLeft - marginRight;
    const usableHeight = pageHeight - marginTop - 15;
    
    const sections = content.split('\f');
    
    sections.forEach((section, sectionIndex) => {
      if (sectionIndex > 0) {
        doc.addPage();
      }
      
      const lines = doc.splitTextToSize(section.trim(), usableWidth);
      
      let currentY = marginTop;
      let pageCount = 0;
      
      for (let i = 0; i < lines.length; i++) {
        if (currentY + 5 > usableHeight) {
          doc.addPage();
          currentY = marginTop;
          pageCount++;
        }
        
        doc.text(lines[i], marginLeft, currentY);
        currentY += 5;
      }
    });

    doc.save(filename);
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
            <div key={formulario.id} className="space-y-4">
              <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-orange-500/50 transition-colors">
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
                      onClick={() => {
                        setSelectedFormulario(selectedFormulario?.id === formulario.id ? null : formulario);
                      }}
                      className="bg-gray-600 hover:bg-gray-700"
                    >
                      {selectedFormulario?.id === formulario.id ? 'Fechar' : 'Configurar'}
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setSelectedFormulario(formulario);
                        gerarContrato(formulario);
                        setReciboGerado('');
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <FileText className="mr-1" size={14} />
                      Gerar Contrato
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setSelectedFormulario(formulario);
                        gerarRecibo(formulario);
                        setContratoGerado('');
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <FileText className="mr-1" size={14} />
                      Gerar Recibo
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Seção expandida diretamente abaixo do card selecionado */}
              {selectedFormulario?.id === formulario.id && (
                <Card className="bg-gray-700/50 backdrop-blur-sm border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-orange-400 text-lg">Configurações do Contrato</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Seção de itens adicionais */}
                    <div>
                      <h5 className="text-white font-medium mb-3 flex items-center">
                        <Plus className="mr-2" size={16} />
                        Itens Adicionais
                      </h5>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                        <Input
                          placeholder="Descrição"
                          value={novoItem.descricao}
                          onChange={(e) => setNovoItem({...novoItem, descricao: e.target.value})}
                          className="bg-gray-600 border-gray-500 text-white text-sm"
                        />
                        <Input
                          type="number"
                          placeholder="Valor (negativo para desconto)"
                          value={novoItem.valor}
                          onChange={(e) => setNovoItem({...novoItem, valor: parseFloat(e.target.value) || 0})}
                          step="any"
                          className="bg-gray-600 border-gray-500 text-white text-sm"
                        />
                        <Input
                          type="number"
                          placeholder="Quantidade"
                          value={novoItem.quantidade}
                          onChange={(e) => setNovoItem({...novoItem, quantidade: parseInt(e.target.value) || 1})}
                          min="1"
                          className="bg-gray-600 border-gray-500 text-white text-sm"
                        />
                        <Button 
                          size="sm" 
                          onClick={salvarItemAdicional}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Plus size={14} />
                          Adicionar
                        </Button>
                      </div>
                      
                      {itensAdicionais.map((item, index) => (
                        <div key={item.id || index} className="flex justify-between items-center mb-2 p-3 bg-gray-600/50 rounded">
                          <span className="text-white text-sm">
                            {item.descricao} - {item.quantidade}x R$ {Math.abs(item.valor).toFixed(2).replace('.', ',')}
                            {item.valor < 0 && <Badge className="ml-2 bg-red-600">Desconto</Badge>}
                            = R$ {(item.valor * item.quantidade).toFixed(2).replace('.', ',')}
                          </span>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => item.id && removerItemAdicional(item.id)}
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Campo de Valor de Entrada */}
                    <div>
                      <label htmlFor="valorEntrada" className="text-sm font-medium text-white mb-2 block">
                        Valor da Entrada (R$)
                      </label>
                      <div className="flex gap-2">
                        <Input
                          id="valorEntrada"
                          type="number"
                          placeholder="Valor da Entrada"
                          value={valorEntradaEditavel}
                          onChange={(e) => setValorEntradaEditavel(e.target.value)}
                          className="bg-gray-600 border-gray-500 text-white"
                          step="any"
                        />
                        <Button
                          onClick={handleSalvarValorEntrada}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          size="sm"
                        >
                          Salvar
                        </Button>
                      </div>
                    </div>

                    {/* Seção de Parcelamento */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="text-white font-medium flex items-center">
                          <Calculator className="mr-2" size={16} />
                          Parcelamento do Saldo
                        </h5>
                        <Button
                          size="sm"
                          onClick={() => setShowParcelamento(!showParcelamento)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {showParcelamento ? 'Cancelar' : 'Configurar'}
                        </Button>
                      </div>

                      {showParcelamento && (
                        <div className="space-y-3 p-4 bg-gray-600/30 rounded">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <Input
                              type="number"
                              placeholder="Número de parcelas"
                              value={numeroParcelas}
                              onChange={(e) => setNumeroParcelas(parseInt(e.target.value) || 1)}
                              min="1"
                              max="24"
                              className="bg-gray-600 border-gray-500 text-white text-sm"
                            />
                            <Input
                              type="date"
                              placeholder="Data da primeira parcela"
                              value={primeiraParcela}
                              onChange={(e) => setPrimeiraParcela(e.target.value)}
                              className="bg-gray-600 border-gray-500 text-white text-sm"
                            />
                            <Button
                              size="sm"
                              onClick={gerarParcelas}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Gerar Parcelas
                            </Button>
                          </div>

                          {parcelas.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm text-gray-300">
                                Saldo a parcelar: R$ {(calcularValorTotal(selectedFormulario.quantidade_adultos, selectedFormulario.quantidade_criancas, itensAdicionais) - parseFloat(String(valorEntradaEditavel) || '0')).toFixed(2).replace('.', ',')}
                              </p>
                              {parcelas.map((parcela, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-gray-700/50 rounded text-sm">
                                  <span className="text-white">
                                    Parcela {parcela.numero_parcela}: R$ {parcela.valor_parcela.toFixed(2).replace('.', ',')}
                                  </span>
                                  <span className="text-gray-300">
                                    {formatDate(parcela.data_vencimento)}
                                  </span>
                                </div>
                              ))}
                              <Button
                                size="sm"
                                onClick={salvarParcelas}
                                className="bg-green-600 hover:bg-green-700 w-full"
                              >
                                Salvar Parcelamento
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Parcelas salvas */}
                      {!showParcelamento && parcelas.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm text-green-400 font-medium">Parcelamento Configurado:</p>
                          {parcelas.map((parcela, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-green-900/20 rounded text-sm">
                              <span className="text-white">
                                Parcela {parcela.numero_parcela}: R$ {parcela.valor_parcela.toFixed(2).replace('.', ',')}
                              </span>
                              <Badge className={parcela.status === 'pago' ? 'bg-green-600' : 'bg-yellow-600'}>
                                {parcela.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ))}
        </div>

        {/* Preview do contrato/recibo */}
        {(contratoGerado || reciboGerado) && (
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-orange-400">
                  {contratoGerado ? 'Contrato Gerado' : 'Recibo Gerado'}
                </CardTitle>
                <Button 
                  size="sm"
                  onClick={() => downloadPDF(
                    contratoGerado || reciboGerado,
                    `${contratoGerado ? 'contrato' : 'recibo'}_${selectedFormulario?.nome_completo.replace(/\s+/g, '_')}.pdf`
                  )}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Download className="mr-1" size={14} />
                  Download PDF
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-white text-black p-4 rounded text-xs whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">
                {contratoGerado || reciboGerado}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
