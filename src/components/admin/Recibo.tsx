
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { numberToWordsBrazilian } from '@/utils/supabaseStorage';

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

interface ReciboProps {
  formulario: Formulario;
  configs: Record<string, string>;
  itensAdicionais: ItemAdicional[];
  parcelas: Parcela[];
  onClose: () => void;
  formatDate: (dateStr: string) => string;
  formatTime: (timeStr: string) => string;
  calcularValorTotal: (adultos: number, criancas: number, itensAdicionais: ItemAdicional[]) => number;
}

export const Recibo: React.FC<ReciboProps> = ({
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

  const gerarRecibo = () => {
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
    
    const recibo = `JULIO'S PIZZA HOUSE
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
Júlio's Pizza House`;

    return recibo;
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

  const reciboGerado = gerarRecibo();

  return (
    <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-orange-400">Recibo Gerado</CardTitle>
          <div className="flex gap-2">
            <Button 
              size="sm"
              onClick={() => downloadPDF(
                reciboGerado,
                `recibo_${formulario.nome_completo.replace(/\s+/g, '_')}.pdf`
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
          {reciboGerado}
        </div>
      </CardContent>
    </Card>
  );
};
