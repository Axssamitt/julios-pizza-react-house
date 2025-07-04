
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';
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

interface ContratoProps {
  formulario: Formulario;
  configs: Record<string, string>;
  itensAdicionais: ItemAdicional[];
  parcelas: Parcela[];
  onClose: () => void;
  formatDate: (dateStr: string) => string;
  formatTime: (timeStr: string) => string;
  calcularValorTotal: (adultos: number, criancas: number, itensAdicionais: ItemAdicional[]) => number;
}

export const Contrato: React.FC<ContratoProps> = ({
  formulario,
  configs,
  itensAdicionais,
  parcelas,
  onClose,
  formatDate,
  formatTime,
  calcularValorTotal
}) => {
  const calcularEntrada = (valorTotal: number) => {
    const percentualEntrada = parseFloat(configs.percentual_entrada || '40') / 100;
    return valorTotal * percentualEntrada;
  };

  const calcularPercentualEntrada = (valorEntrada: number, valorTotal: number) => {
    if (valorTotal === 0) return 0;
    return Math.round((valorEntrada / valorTotal) * 100);
  };

  const gerarContrato = () => {
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
    
    const contrato = `JULIO'S PIZZA HOUSE

CONTRATANTE: ${formulario.nome_completo.toUpperCase()}, CPF/CNPJ: nº${formulario.cpf}, residente em Rua: ${formulario.endereco.toUpperCase()}

CONTRATADA: JULIO'S PIZZA HOUSE, com sede em Londrina, na Rua Alzira Postali Gewrher, nº 119, bairro Jardim Catuai, Cep 86086-230, no Estado Paraná, inscrita no CPF sob o nº 034.988.389-03, neste ato representada pelo Responsável Sr. Júlio Cesar Fermino.

As partes acima identificadas têm, entre si, justo e acertado o presente Contrato de Prestação de Serviços de Rodizio de pizza para festa, que se regerá pelas cláusulas seguintes e pelas condições de preço, forma e termo de pagamento descritas no presente.

DO OBJETO DO CONTRATO

Cláusula 1ª. É objeto do presente contrato a prestação pela CONTRATADA à CONTRATANTE do serviço de rodizio de pizza, em evento que se realizará na data de ${formatDate(formulario.data_evento)}, no endereço / local: ${formulario.endereco_evento.toUpperCase()}.

O EVENTO

Cláusula 2ª. O evento, para cuja realização são contratados os serviços de Rodizio de Pizza, é a festa de confraternização da CONTRATANTE, e contará com a presença de aproximadamente ${formulario.quantidade_adultos} adultos${formulario.quantidade_criancas > 0 ? ` e ${formulario.quantidade_criancas} crianças` : ''} a serem confirmados uma semana antes do evento.
Parágrafo único. O evento realizar-se-á no horário e local indicado no caput da cláusula 1ª, devendo o serviço de rodizio de pizza a ser prestado das ${formatTime(formulario.horario)} até às ${String(parseInt(formulario.horario.split(':')[0]) + 3).padStart(2, '0')}:${formulario.horario.split(':')[1]} horas.

OBRIGAÇÕES DA CONTRATANTE

Cláusula 3ª. A CONTRATANTE deverá fornecer à CONTRATADA todas as informações necessárias à realização adequada do serviço de rodizio de pizza, devendo especificar os detalhes do evento, necessários ao perfeito fornecimento do serviço, e a forma como este deverá ser prestado.

Cláusula 4ª. A CONTRATANTE deverá efetuar o pagamento na forma e condições estabelecidas na cláusula 9ª.

OBRIGAÇÕES DA CONTRATADA

Cláusula 5ª. É dever da CONTRATADA oferecer um serviço de rodizio pizza de acordo com as especificações da CONTRATANTE, devendo o serviço iniciar-se às ${formatTime(formulario.horario)} e terminar às ${String(parseInt(formulario.horario.split(':')[0]) + 3).padStart(2, '0')}:${formulario.horario.split(':')[1]} horas.
Parágrafo único. A CONTRATADA está obrigada a fornecer aos convidados do CONTRATANTE produtos de alta qualidade, que deverão ser preparados e servidos dentro de rigorosas normas de higiene e limpeza.
Obs: O excedente de horário será cobrado 300,00 (trezentos reais) a cada meia hora do horário ultrapassado.

Cláusula 6ª. A CONTRATADA se compromete a fornecer o cardápio escolhido pela CONTRATANTE, cujas especificações, inclusive de quantidade a ser servida, encontram-se em documento anexo ao presente contrato.

Cláusula 7ª. A CONTRATADA fornecerá pelo menos 1 pizzaiolo e ${Math.ceil((formulario.quantidade_adultos + formulario.quantidade_criancas) / 30)} garçom(s) para servir os convidados nas mesas.

Cláusula 8ª. A CONTRATADA obriga-se a manter todos os seus empregados devidamente uniformizados durante a prestação dos serviços ora contratados, garantindo que todos eles possuem os requisitos de urbanidade, moralidade e educação.

DO PREÇO E DAS CONDIÇÕES DE PAGAMENTO

Cláusula 9ª. O serviço contratado no presente instrumento será remunerado dependendo do número de pessoas confirmadas uma semana antes do evento. A contratada garante que a quantidade de comida seja suficiente para atender o número de pessoas presentes, estando preparada para atender até 10% a mais do número de pessoas confirmadas, cobrando o valor de R$ ${valorAdulto.toFixed(2).replace('.', ',')} por adulto e R$ ${valorCrianca.toFixed(2).replace('.', ',')} por crianças no total de R$ ${valorTotal.toFixed(2).replace('.', ',')}${itensTexto}. O serviço deve ser pago em dinheiro, com uma entrada de R$ ${entrada.toFixed(2).replace('.', ',')} (${percentualEntradaReal}%) (depositados em conta, caixa econômica Ag: 1479 conta: 00028090-5 conta corrente) ANTECIPADO, a diferença no ato da festa no valor de R$ ${restante.toFixed(2).replace('.', ',')}.${parcelamentoTexto}

Cláusula 10ª. O presente contrato poderá ser rescindido unilateralmente por qualquer uma das partes, desde que haja comunicação formal por escrito justificando o motivo. Deverá acontecer, além disso, até 10 dias corridos, antes da data prevista para o evento, com devolução de 100% do valor já pago. Caso o cliente queira ou precise cancelar ou mudar a data da reserva, após ter pago a entrada, a contratada descontará o valor pago na futura contratação do serviço se acontecer nos primeiros 30 dias corridos após o dia antecipadamente reservado.

LONDRINA, ${new Date().toLocaleDateString('pt-BR')}

_________________________________
CONTRATANTE
${formulario.nome_completo}
CPF: ${formulario.cpf}

_________________________________
CONTRATADA
Júlio Cesar Fermino
CPF: 034.988.389-03`;

    return contrato;
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

  const contratoGerado = gerarContrato();

  return (
    <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-orange-400">Contrato Gerado</CardTitle>
          <div className="flex gap-2">
            <Button 
              size="sm"
              onClick={() => downloadPDF(
                contratoGerado,
                `contrato_${formulario.nome_completo.replace(/\s+/g, '_')}.pdf`
              )}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Download className="mr-1" size={14} />
              Download PDF
            </Button>
            <Button 
              size="sm"
              onClick={onClose}
              variant="outline"
              className="border-gray-600 text-gray-300"
            >
              Fechar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-white text-black p-4 rounded text-xs whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">
          {contratoGerado}
        </div>
      </CardContent>
    </Card>
  );
};
