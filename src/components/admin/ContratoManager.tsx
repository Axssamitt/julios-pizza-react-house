import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Download, Plus, Trash2 } from 'lucide-react';
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
  itens_adicionais?: ItemAdicional[];
}

interface ItemAdicional {
  id?: string;
  descricao: string;
  valor: number;
  quantidade: number;
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
  const [novoItem, setNovoItem] = useState<ItemAdicional>({ descricao: '', valor: 0, quantidade: 1 });
  const [valorEntradaEditavel, setValorEntradaEditavel] = useState<number | string>('');

  useEffect(() => {
    fetchFormularios();
    fetchConfigs();
  }, []);

  useEffect(() => {
    if (selectedFormulario) {
      const valorTotalCalculado = calcularValorTotal(selectedFormulario.quantidade_adultos, selectedFormulario.quantidade_criancas, itensAdicionais);
      const entradaCalculada = calcularEntrada(valorTotalCalculado);

      if (selectedFormulario.valor_entrada && selectedFormulario.valor_entrada > 0) {
        setValorEntradaEditavel(selectedFormulario.valor_entrada.toFixed(2));
      } else {
        setValorEntradaEditavel(entradaCalculada.toFixed(2));
      }
    } else {
      setValorEntradaEditavel('');
    }
  }, [selectedFormulario, configs, itensAdicionais]);

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

  const adicionarItem = () => {
    if (novoItem.descricao && novoItem.valor > 0) {
      setItensAdicionais([...itensAdicionais, { ...novoItem }]);
      setNovoItem({ descricao: '', valor: 0, quantidade: 1 });
    }
  };

  const removerItem = (index: number) => {
    setItensAdicionais(itensAdicionais.filter((_, i) => i !== index));
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
        itensTexto += `• ${item.descricao}: ${item.quantidade}x R$ ${item.valor.toFixed(2).replace('.', ',')} = R$ ${(item.valor * item.quantidade).toFixed(2).replace('.', ',')}\n`;
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
• Disponibilizar pelo menos 1 pizzaiolo e 1 garçom
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
  (A ser pago até o dia anterior ao evento)

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

  // Função melhorada para download de PDF com espaçamento reduzido
  const downloadPDF = (content: string, filename: string) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    doc.setFont('courier');
    doc.setFontSize(10); // Reduzido de 11 para 10

    const marginLeft = 12; // Reduzido de 15 para 12
    const marginRight = 12; // Reduzido de 15 para 12
    const marginTop = 15; // Reduzido de 20 para 15
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const usableWidth = pageWidth - marginLeft - marginRight;
    const usableHeight = pageHeight - marginTop - 15; // 15mm bottom margin
    
    // Dividir o conteúdo por quebras de página explícitas (\f)
    const sections = content.split('\f');
    
    sections.forEach((section, sectionIndex) => {
      if (sectionIndex > 0) {
        doc.addPage();
      }
      
      // Dividir o texto em linhas respeitando a largura da página
      const lines = doc.splitTextToSize(section.trim(), usableWidth);
      
      let currentY = marginTop;
      let pageCount = 0;
      
      for (let i = 0; i < lines.length; i++) {
        // Verificar se precisamos de uma nova página
        if (currentY + 5 > usableHeight) { // Reduzido de 7 para 5mm
          doc.addPage();
          currentY = marginTop;
          pageCount++;
        }
        
        doc.text(lines[i], marginLeft, currentY);
        currentY += 5; // Reduzido de 7 para 5mm - espaçamento entre linhas
      }
    });

    // Salvar o PDF
    doc.save(filename);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Geração de Contratos e Recibos</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      R$ {calcularValorTotal(formulario.quantidade_adultos, formulario.quantidade_criancas, itensAdicionais).toFixed(2).replace('.', ',')}
                    </p>
                    <p className="text-gray-400 text-sm">Total</p>
                  </div>
                </div>
                
                {/* Seção de itens adicionais */}
                {selectedFormulario?.id === formulario.id && (
                  <div className="mb-4 p-4 bg-gray-700/50 rounded-lg">
                    <h5 className="text-white font-medium mb-3">Itens Adicionais</h5>
                    
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <Input
                        placeholder="Descrição"
                        value={novoItem.descricao}
                        onChange={(e) => setNovoItem({...novoItem, descricao: e.target.value})}
                        className="bg-gray-600 border-gray-500 text-white text-sm"
                      />
                      <Input
                        type="number"
                        placeholder="Valor"
                        value={novoItem.valor}
                        onChange={(e) => setNovoItem({...novoItem, valor: parseFloat(e.target.value) || 0})}
                        className="bg-gray-600 border-gray-500 text-white text-sm"
                      />
                      <div className="flex gap-1">
                        <Input
                          type="number"
                          placeholder="Qtd"
                          value={novoItem.quantidade}
                          onChange={(e) => setNovoItem({...novoItem, quantidade: parseInt(e.target.value) || 1})}
                          className="bg-gray-600 border-gray-500 text-white text-sm"
                        />
                        <Button 
                          size="sm" 
                          onClick={adicionarItem}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Plus size={14} />
                        </Button>
                      </div>
                    </div>
                    
                    {itensAdicionais.map((item, index) => (
                      <div key={index} className="flex justify-between items-center mb-2 p-2 bg-gray-600/50 rounded">
                        <span className="text-white text-sm">
                          {item.descricao} - {item.quantidade}x R$ {item.valor.toFixed(2).replace('.', ',')}
                        </span>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => removerItem(index)}
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Campo de Valor de Entrada Editável */}
                {selectedFormulario?.id === formulario.id && (
                  <div className="mt-4 space-y-2">
                    <label htmlFor="valorEntrada" className="text-sm font-medium text-white">
                      Valor da Entrada (R$)
                    </label>
                    <Input
                      id="valorEntrada"
                      type="number"
                      placeholder="Valor da Entrada"
                      value={valorEntradaEditavel}
                      onChange={(e) => setValorEntradaEditavel(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <Button
                      onClick={handleSalvarValorEntrada}
                      className="bg-blue-600 hover:bg-blue-700 text-white mt-2"
                      size="sm"
                    >
                      Salvar Entrada
                    </Button>
                  </div>
                )}
                
                <div className="flex space-x-2 mt-4">
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setSelectedFormulario(formulario);
                      if (selectedFormulario?.id !== formulario.id) {
                        setItensAdicionais([]);
                      }
                    }}
                    className="bg-gray-600 hover:bg-gray-700"
                  >
                    Selecionar
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
          ))}
        </div>

        {(contratoGerado || reciboGerado) && (
          <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 sticky top-4">
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
