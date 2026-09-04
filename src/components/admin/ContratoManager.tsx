import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Download, Plus, Trash2, Calendar, Calculator } from 'lucide-react';
import { numberToWordsBrazilian } from '@/utils/supabaseStorage';
import { jsPDF } from 'jspdf';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDate, setSearchDate] = useState('');
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
  const [clausulaCancelamentoOpcao, setClausulaCancelamentoOpcao] = useState<'padrao' | 'alternativa' | 'semDevolucao'>('padrao');

  useEffect(() => {
    fetchFormularios();
    fetchConfigs();
  }, []);

  useEffect(() => {
    if (selectedFormulario) {
      fetchItensAdicionais(selectedFormulario.id);
      fetchParcelas(selectedFormulario.id);
      const valorTotalCalculado = calcularValorTotal(selectedFormulario.quantidade_adultos, selectedFormulario.quantidade_criancas, itensAdicionais);
      if (selectedFormulario.valor_entrada !== null && selectedFormulario.valor_entrada !== undefined) {
        setValorEntradaEditavel(selectedFormulario.valor_entrada.toFixed(2));
      } else {
        setValorEntradaEditavel('0.00');
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
    const entradaInformada = parseFloat(String(valorEntradaEditavel));
    const entrada = Number.isNaN(entradaInformada) ? 0 : entradaInformada;
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
    if (!selectedFormulario || String(valorEntradaEditavel).trim() === '') {
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
      .order('data_evento', { ascending: false });

    if (!error && data) {
      const confirmados = data.filter((formulario) =>
        String(formulario.status || '').trim().toLowerCase() === 'confirmado'
      );
      setFormularios(confirmados);
    } else if (error) {
      console.error('Erro ao carregar formulários confirmados:', error);
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

  const formulariosFiltrados = formularios.filter((formulario) => {
    const termo = searchTerm.trim().toLowerCase();
    const termoLimpo = termo.replace(/\D/g, '');
    const termoBusca = termoLimpo.length >= 3 ? termoLimpo : termo;
    const nomeDocumento = `${formulario.nome_completo} ${formulario.cpf.replace(/\D/g, '')}`.toLowerCase();

    const correspondeNomeDocumento = !termoBusca || nomeDocumento.includes(termoBusca);
    const correspondeData = !searchDate || formulario.data_evento === searchDate;

    return correspondeNomeDocumento && correspondeData;
  }).sort((a, b) => new Date(b.data_evento).getTime() - new Date(a.data_evento).getTime());

  const datasComRegistros = [...new Set(formularios.map((formulario) => formulario.data_evento))];

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
    if (formulario.valor_entrada !== null && formulario.valor_entrada !== undefined) {
      entrada = formulario.valor_entrada;
    } else {
      entrada = 0;
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

    // Texto da cláusula 10 conforme opção selecionada
    let clausula10 = '';
    if (clausulaCancelamentoOpcao === 'padrao') {
      clausula10 = `
CANCELAMENTO

Cláusula 10. O presente contrato poderá ser rescindido unilateralmente por qualquer uma das partes, desde que haja comunicação formal por escrito justificando o motivo. Deverá acontecer, além disso, até 10 dias corridos antes da data prevista para o evento, com devolução de 100% do valor já pago. Caso o cliente queira ou precise cancelar ou mudar a data da reserva, a contratada descontará o valor pago na futura contratação do serviço se acontecer nos primeiros 30 dias corridos após o dia antecipadamente reservado.
`;
    } else if (clausulaCancelamentoOpcao === 'alternativa') {
      clausula10 = `
CANCELAMENTO

Cláusula 10. O presente contrato poderá ser rescindido unilateralmente por qualquer uma das partes, desde que haja comunicação formal por escrito justificando o motivo. Deverá acontecer, além disso, até 10 dias corridos antes da data prevista para o evento: Para cancelamentos até 30 dias antes da data do evento, será devolvido 60% do valor já pago. Para cancelamentos com prazo menor que 30 dias, será devolvido 40% do valor já pago. Caso o cliente queira ou precise cancelar ou mudar a data da reserva, a contratada descontará o valor pago na futura contratação do serviço se acontecer nos primeiros 30 dias corridos após o dia antecipadamente reservado.
`;
    } else {
      clausula10 = `
CANCELAMENTO

Cláusula 10. O presente contrato poderá ser rescindido unilateralmente por qualquer uma das partes, desde que haja comunicação formal por escrito justificando o motivo. Nesta hipótese, não haverá devolução do valor já pago. O contratante poderá optar por reagendar o evento para outra data, desde que notifique a contratada com antecedência, ou efetuar o cancelamento sem devolução do valor pago, mantendo o crédito para agendamento futuro de novo evento.
`;
    }

    const contrato = `
JULIO'S PIZZA HOUSE

CONTRATANTE: ${formulario.nome_completo.toUpperCase()}, CPF/CNPJ: n°${formulario.cpf}, residente em ${formulario.endereco.toUpperCase()}.

CONTRATADA: JULIO’S PIZZA HOUSE, com sede em Londrina, na Rua Alzira Postali Gewrher, nº 119, bairro Jardim Catuai, Cep 86086-230, no Estado Paraná, inscrita no CPF sob o nº 034.988.389-03, neste ato representada pelo Responsável Sr. Júlio Cesar Fermino.

As partes acima identificadas têm, entre si, justo e acertado o presente Contrato de Prestação de Serviços de Rodízio de pizza para festa, que se regerá pelas cláusulas seguintes e pelas condições de preço, forma e termo de pagamento descritas no presente.

DO OBJETO DO CONTRATO

Cláusula 1ª. É objeto do presente contrato a prestação pela CONTRATADA à CONTRATANTE do serviço de rodízio de pizza, em evento que se realizará na data de ${formatDate(formulario.data_evento)}, no endereço/local: ${formulario.endereco_evento.toUpperCase()}.

O EVENTO

Cláusula 2ª. O evento, para cuja realização são contratados os serviços de Rodízio de Pizza, contará com a presença de aproximadamente ${formulario.quantidade_adultos} adultos${formulario.quantidade_criancas > 0 ? ` e ${formulario.quantidade_criancas} crianças` : ''}, a serem confirmados uma semana antes do evento.
Parágrafo único. O evento realizar-se-á no horário e local indicado no caput da cláusula 1ª, devendo o serviço de rodízio de pizza ser prestado das ${formatTime(formulario.horario)} até às ${String(parseInt(formulario.horario.split(':')[0]) + 3).padStart(2, '0')}:${formulario.horario.split(':')[1]} horas.

OBRIGAÇÕES DA CONTRATANTE

Cláusula 3ª. A CONTRATANTE deverá fornecer à CONTRATADA todas as informações necessárias à realização adequada do serviço de rodízio de pizza, devendo especificar os detalhes do evento, necessários ao perfeito fornecimento do serviço, e a forma como este deverá ser prestado.

Cláusula 4ª. A CONTRATANTE deverá efetuar o pagamento na forma e condições estabelecidas na cláusula 9ª.

OBRIGAÇÕES DA CONTRATADA

Cláusula 5ª. É dever da CONTRATADA oferecer um serviço de rodízio de pizza de acordo com as especificações da CONTRATANTE, devendo o serviço iniciar-se às ${formatTime(formulario.horario)} e terminar às ${String(parseInt(formulario.horario.split(':')[0]) + 3).padStart(2, '0')}:${formulario.horario.split(':')[1]} horas.
Parágrafo único. A CONTRATADA está obrigada a fornecer aos convidados da CONTRATANTE produtos de alta qualidade, que deverão ser preparados e servidos dentro de rigorosas normas de higiene e limpeza.
Obs: O excedente de horário será cobrado R$ 300,00 (trezentos reais) a cada meia hora do horário ultrapassado.

Cláusula 6ª. A CONTRATADA se compromete a fornecer o cardápio escolhido pela CONTRATANTE, cujas especificações, inclusive de quantidade a ser servida, encontram-se em documento anexo ao presente contrato.

Cláusula 7ª. A CONTRATADA fornecerá pelo menos 1 pizzaiolo e ${Math.ceil((formulario.quantidade_adultos + formulario.quantidade_criancas) / 30)} garçom(ns) para servir os convidados nas mesas.

Cláusula 8ª. A CONTRATADA obriga-se a manter todos os seus empregados devidamente uniformizados durante a prestação dos serviços ora contratados, garantindo que todos eles possuem os requisitos de urbanidade, moralidade e educação.

DO PREÇO E DAS CONDIÇÕES DE PAGAMENTO

Cláusula 9ª. O serviço contratado no presente instrumento será remunerado dependendo do número de pessoas confirmadas uma semana antes do evento. A contratada garante que a quantidade de comida seja suficiente para atender o número de pessoas presentes, estando preparada para atender até 10% a mais do número de pessoas confirmadas, cobrando o valor de R$ ${valorAdulto.toFixed(2).replace('.', ',')} por adulto e R$ ${valorCrianca.toFixed(2).replace('.', ',')} por criança.

VALOR TOTAL DO SERVIÇO: R$ ${valorTotal.toFixed(2).replace('.', ',')}${itensTexto}

Forma de pagamento:
• Entrada (${percentualEntradaReal}%): R$ ${entrada.toFixed(2).replace('.', ',')}
  (Depositar na Caixa Econômica - Ag: 1479 - Conta: 00028090-5)
• Restante: R$ ${restante.toFixed(2).replace('.', ',')}
  (A ser pago até o dia anterior ao evento)${parcelamentoTexto}

${clausula10}

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
    if (formulario.valor_entrada !== null && formulario.valor_entrada !== undefined) {
      entradaRecibo = formulario.valor_entrada;
    } else {
      entradaRecibo = 0;
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
CONTRATADA
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
  const marginBottom = 10;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const usableWidth = pageWidth - marginLeft - marginRight;

  // Quebra de página após a cláusula 6
  const clausula6Regex = /Cláusula 6ª\..*?(?=Cláusula 7ª\.|Cláusula 7\.|Cláusula 7)/s;
  const match = content.match(clausula6Regex);

  let partes: string[] = [];
  if (match) {
    const clausula6End = match.index! + match[0].length;
    partes = [
      content.slice(0, clausula6End).trim(),
      content.slice(clausula6End).trim()
    ];
  } else {
    partes = [content];
  }

  // String base64 da sua imagem de assinatura (substitua pelo código real)
  const assinaturaBase64 = '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';

  partes.forEach((parte, idx) => {
    if (idx > 0) doc.addPage();
    const lines = doc.splitTextToSize(parte, usableWidth);

    let currentY = marginTop;
    for (let i = 0; i < lines.length; i++) {
      if (currentY + 5 > pageHeight - marginBottom) {
        doc.addPage();
        currentY = marginTop;
      }

      doc.text(lines[i], marginLeft, currentY);

      // Checa se a linha atual é "CONTRATADA" e a próxima é "Júlio Cesar Fermino"
      const linhaAtualTemContratada = lines[i].trim().toUpperCase() === 'CONTRATADA';
      const proximaLinhaExiste = i + 1 < lines.length;
      const proximaLinhaTemNome = proximaLinhaExiste && lines[i + 1].trim().includes('Júlio Cesar Fermino');

      if (linhaAtualTemContratada && proximaLinhaTemNome) {
        try {
          // Como o 'currentY' atual está na palavra CONTRATADA, avançamos 5mm (linha do Nome) 
          // e subtraímos o recuo necessário para a imagem ficar centralizada sobre o traço ou o nome.
          // Ajuste o valor (-7) e o tamanho (35, 15) conforme o desenho da sua imagem.
          const yAssinatura = currentY + 0 - 12; 
          
          
          doc.addImage(assinaturaBase64, 'PNG', marginLeft +20, yAssinatura, 35, 15);
        } catch (e) {
          console.error("Erro ao carregar a imagem de assinatura no PDF:", e);
        }
      }

      currentY += 5;
    }
  });

  doc.save(filename);
};


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Geração de Contratos e Recibos</h2>
        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <input
            type="text"
            placeholder="Filtrar por nome ou CPF/CNPJ"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm"
          />
          <CalendarWithHighlight
            value={searchDate}
            onChange={setSearchDate}
            highlightDates={datasComRegistros}
          />
          <div className="text-sm text-gray-400 md:ml-2">
            Total: {formulariosFiltrados.length} eventos
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-orange-400">Eventos Confirmados</h3>
          {formulariosFiltrados.map((formulario) => (
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

                    {/* Selecionador de cláusula de cancelamento */}
                    <div>
                      <label className="text-sm font-medium text-white mb-2 block">
                        Cláusula de Cancelamento
                      </label>
                      <select
                        value={clausulaCancelamentoOpcao}
                        onChange={e => setClausulaCancelamentoOpcao(e.target.value as 'padrao' | 'alternativa' | 'semDevolucao')}
                        className="bg-gray-600 border-gray-500 text-white p-2 rounded"
                      >
                        <option value="padrao">Devolução de 100% até 10 dias antes (padrão)</option>
                        <option value="alternativa">Devolução de 60% até 30 dias antes, 40% para menos de 30 dias</option>
                        <option value="semDevolucao">Sem devolução; reagendar ou cancelar sem reembolso</option>
                      </select>
                    </div>

                    {/* Preview do contrato/recibo - MOVIDO PARA CÁ */}
                    {(contratoGerado || reciboGerado) && (
                      <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 mt-6">
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
                  </CardContent>
                </Card>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};