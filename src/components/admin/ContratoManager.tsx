
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

  const calcularEntrada = (valorTotal: number) => {
    const percentualEntrada = parseFloat(configs.percentual_entrada || '40') / 100;
    return valorTotal * percentualEntrada;
  };

  const calcularPercentualEntrada = (valorEntrada: number, valorTotal: number) => {
    if (valorTotal === 0) return 0;
    return Math.round((valorEntrada / valorTotal) * 100);
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
    const percentualEntradaReal = calcularPercentualEntrada(entrada, valorTotal);
    
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
• Entrada (${percentualEntradaReal}%): R$ ${entrada.toFixed(2).replace('.', ',')}
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
    
    const percentualEntradaReal = calcularPercentualEntrada(entradaRecibo, valorTotal);
    
    let parcelamentoTextoRecibo = '';
    if (parcelas.length > 0) {
      parcelamentoTextoRecibo = '\n\nPARCELAMENTO DO SALDO:\n';
      parcelas.forEach(parcela => {
        parcelamentoTextoRecibo += `• Parcela ${parcela.numero_parcela}: R$ ${parcela.valor_parcela.toFixed(2).replace('.', ',')} - Vencimento: ${formatDate(parcela.data_vencimento)}\n`;
      });
    }
    
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
• Entrada (${percentualEntradaReal}%): R$ ${entradaRecibo.toFixed(2).replace('.', ',')}
• Saldo restante: R$ ${(valorTotal - entradaRecibo).toFixed(2).replace('.', ',')}
  (a ser pago até o dia anterior ao evento)${parcelamentoTextoRecibo}

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
