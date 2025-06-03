
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Download, Eye } from 'lucide-react';

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

export const ContratoManager = () => {
  const [formularios, setFormularios] = useState<Formulario[]>([]);
  const [selectedFormulario, setSelectedFormulario] = useState<Formulario | null>(null);
  const [contratoGerado, setContratoGerado] = useState<string>('');
  const [reciboGerado, setReciboGerado] = useState<string>('');

  useEffect(() => {
    fetchFormularios();
  }, []);

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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5);
  };

  const calcularValorTotal = (adultos: number, criancas: number) => {
    const valorAdulto = 55.00;
    const valorCrianca = 27.00;
    return (adultos * valorAdulto) + (criancas * valorCrianca);
  };

  const calcularEntrada = (valorTotal: number) => {
    return valorTotal * 0.4; // 40% de entrada
  };

  const gerarContrato = (formulario: Formulario) => {
    const valorTotal = calcularValorTotal(formulario.quantidade_adultos, formulario.quantidade_criancas);
    const entrada = calcularEntrada(valorTotal);
    const restante = valorTotal - entrada;
    
    const contrato = `JULIO'S PIZZA HOUSE

CONTRATANTE: ${formulario.nome_completo.toUpperCase()}, CPF/CNPJ: n°${formulario.cpf}, residente em ${formulario.endereco.toUpperCase()}.

CONTRATADA: JULIO'S PIZZA HOUSE, com sede em Londrina, na Rua Alzira Postali Gewrher, nº 119, bairro Jardim Catuai, Cep 86086-230, no Estado Paraná, inscrita no CPF sob o nº 034.988.389-03, neste ato representada pelo Responsável Sr. Júlio Cesar Fermino.

As partes acima identificadas têm, entre si, justo e acertado o presente Contrato de Prestação de Serviços de Rodizio de pizza para festa, que se regerá pelas cláusulas seguintes e pelas condições de preço, forma e termo de pagamento descritas no presente.

DO OBJETO DO CONTRATO

Cláusula 1ª. É objeto do presente contrato a prestação pela CONTRATADA à CONTRATANTE do serviço de rodizio de pizza, em evento que se realizará na data de ${formatDate(formulario.data_evento)}, no endereço / local: ${formulario.endereco_evento.toUpperCase()}.

O EVENTO

Cláusula 2ª. O evento, para cuja realização são contratados os serviços de Rodizio de Pizza, é a festa de confraternização da CONTRATANTE, e contará com a presença de aproximadamente ${formulario.quantidade_adultos} adultos${formulario.quantidade_criancas > 0 ? ` e ${formulario.quantidade_criancas} crianças` : ''} a serem confirmada uma semana antes do evento.

Parágrafo único. O evento realizar-se-á no horário e local indicado no caput da cláusula 1ª, devendo o serviço de rodizio de pizza a ser prestado das ${formatTime(formulario.horario)} até às ${String(parseInt(formulario.horario.split(':')[0]) + 3).padStart(2, '0')}:${formulario.horario.split(':')[1]} horas.

OBRIGAÇÕES DA CONTRATANTE

Cláusula 3ª. A CONTRATANTE deverá fornecer à CONTRATADA todas as informações necessárias à realização adequada do serviço de rodizio de pizza, devendo especificar os detalhes do evento, necessários ao perfeito fornecimento do serviço, e a forma como este deverá ser prestado.

Cláusula 4ª. A CONTRATANTE deverá efetuar o pagamento na forma e condições estabelecidas na cláusula 9ª.

OBRIGAÇÕES DA CONTRATADA

Cláusula 5ª. É dever da CONTRATADA oferecer um serviço de rodizio pizza de acordo com as especificações da CONTRATANTE, devendo o serviço iniciar-se às ${formatTime(formulario.horario)} e terminar às ${String(parseInt(formulario.horario.split(':')[0]) + 3).padStart(2, '0')}:${formulario.horario.split(':')[1]} horas.

Parágrafo único. A CONTRATADA está obrigada a fornecer aos convidados do CONTRATANTE produtos de alta qualidade, que deverão ser preparados e servidos dentro de rigorosas normas de higiene e limpeza.

Obs: O excedente de horário será cobrado 300,00 (trezentos reais) a cada meia hora do horário ultrapassado.

Cláusula 6ª. A CONTRATADA se compromete a fornecer o cardápio escolhido pela CONTRATANTE, cujas especificações, inclusive de quantidade a ser servida, encontram-se em documento anexo ao presente contrato.

Cláusula 7ª. A CONTRATADA fornecerá pelo menos 1 pizzaiolo e 1 garçom para servir os convidados nas mesas.

Cláusula 8ª. A CONTRATADA obriga-se a manter todos os seus empregados devidamente uniformizados durante a prestação dos serviços ora contratados, garantindo que todos eles possuem os requisitos de urbanidade, moralidade e educação.

DO PREÇO E DAS CONDIÇÕES DE PAGAMENTO

Cláusula 9. O serviço contratado no presente instrumento será remunerado dependendo do numero de pessoas confirmadas uma semana antes do evento. A contratada garante que a quantidade de comida seja suficiente para atender o num de pessoas presentes, estando preparada para atender até 10% a mais do numero de pessoas confirmadas, cobrando o valor de R$ 55,00 por adulto e R$ 27,00 por crianças no total de R$ ${valorTotal.toFixed(2).replace('.', ',')}. O serviço deve ser pago em dinheiro, com uma entrada de R$ ${entrada.toFixed(2).replace('.', ',')} (depositados em conta, caixa econômica Ag: 1479 conta: 00028090-5 conta corrente) ANTECIPADO, a diferença no ato da festa no valor de R$ ${restante.toFixed(2).replace('.', ',')}.

Cláusula 10. O presente contrato poderá ser rescindido unilateralmente por qualquer uma das partes, desde que haja comunicação formal por escrito justificando o motivo. Deverá acontecer, além disso, até 10 dias corridos, antes da data prevista para o evento, com devolução da entrada. Caso o cliente queira ou precise cancelar ou mudar a data da reserva, após ter pago a entrada, a contratada descontará o valor pago na futura contratação do serviço se acontecer nos primeiros 30 dias corridos após o dia antecipadamente reservado.

LONDRINA, ${new Date().toLocaleDateString('pt-BR')}.


_________________________________                    _________________________________
        CONTRATANTE                                      CONTRATADA
    ${formulario.nome_completo}                        Júlio Cesar Fermino
      CPF: ${formulario.cpf}                            CPF: 034.988.389-03`;

    setContratoGerado(contrato);
  };

  const gerarRecibo = (formulario: Formulario) => {
    const valorTotal = calcularValorTotal(formulario.quantidade_adultos, formulario.quantidade_criancas);
    const entrada = calcularEntrada(valorTotal);
    
    const recibo = `RECIBO DE ENTRADA - JULIO'S PIZZA HOUSE

Recebemos de: ${formulario.nome_completo}
CPF: ${formulario.cpf}
Endereço: ${formulario.endereco}

A importância de R$ ${entrada.toFixed(2).replace('.', ',')} (${numberToWords(entrada)} reais)

Referente a: Entrada para contratação de serviço de rodízio de pizza para evento em ${formatDate(formulario.data_evento)} às ${formatTime(formulario.horario)}

Local do evento: ${formulario.endereco_evento}
Quantidade de pessoas: ${formulario.quantidade_adultos} adultos${formulario.quantidade_criancas > 0 ? ` e ${formulario.quantidade_criancas} crianças` : ''}

Valor total do serviço: R$ ${valorTotal.toFixed(2).replace('.', ',')}
Valor da entrada (40%): R$ ${entrada.toFixed(2).replace('.', ',')}
Valor restante: R$ ${(valorTotal - entrada).toFixed(2).replace('.', ',')} (a ser pago no dia do evento)

Data: ${new Date().toLocaleDateString('pt-BR')}

_________________________________
Júlio Cesar Fermino
CPF: 034.988.389-03
Júlio's Pizza House`;

    setReciboGerado(recibo);
  };

  const numberToWords = (num: number): string => {
    // Função simplificada para converter número em palavras
    const units = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
    const teens = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
    const tens = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
    const hundreds = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
    
    const intPart = Math.floor(num);
    const decPart = Math.round((num - intPart) * 100);
    
    if (intPart === 0) return 'zero';
    if (intPart === 100) return 'cem';
    
    let result = '';
    
    if (intPart >= 100) {
      result += hundreds[Math.floor(intPart / 100)];
      if (intPart % 100 !== 0) result += ' e ';
    }
    
    const remainder = intPart % 100;
    if (remainder >= 20) {
      result += tens[Math.floor(remainder / 10)];
      if (remainder % 10 !== 0) result += ' e ' + units[remainder % 10];
    } else if (remainder >= 10) {
      result += teens[remainder - 10];
    } else if (remainder > 0) {
      result += units[remainder];
    }
    
    if (decPart > 0) {
      result += ` e ${decPart}/100`;
    }
    
    return result;
  };

  const downloadDocument = (content: string, filename: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Geração de Contratos e Recibos</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-orange-400">Eventos Confirmados</h3>
          {formularios.map((formulario) => (
            <Card key={formulario.id} className="bg-gray-800 border-gray-700 hover:border-orange-500/50 transition-colors">
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
                      R$ {calcularValorTotal(formulario.quantidade_adultos, formulario.quantidade_criancas).toFixed(2).replace('.', ',')}
                    </p>
                    <p className="text-gray-400 text-sm">Total</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
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
          <Card className="bg-gray-800 border-gray-700 sticky top-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-orange-400">
                  {contratoGerado ? 'Contrato Gerado' : 'Recibo Gerado'}
                </CardTitle>
                <Button 
                  size="sm"
                  onClick={() => downloadDocument(
                    contratoGerado || reciboGerado,
                    `${contratoGerado ? 'contrato' : 'recibo'}_${selectedFormulario?.nome_completo.replace(/\s+/g, '_')}.txt`
                  )}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Download className="mr-1" size={14} />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-white text-black p-4 rounded text-sm whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">
                {contratoGerado || reciboGerado}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
