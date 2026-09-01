import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
const handler = async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const formData = await req.json();

    if (!resend) {
      console.warn("RESEND_API_KEY não configurada. Ignorando envio de email");
      return new Response(JSON.stringify({
        success: true,
        skipped: true,
        message: "RESEND_API_KEY não configurada"
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }

    // Formatar telefone para formato internacional (WhatsApp)
    function getWhatsAppNumber(phone: string): string {
      const numbersOnly = phone.replace(/\D/g, "");
      // Se já começar com 55 e tiver pelo menos 12 dígitos (ex: 5511999998888), mantém
      if (numbersOnly.startsWith("55") && numbersOnly.length >= 12) {
        return numbersOnly;
      } else if (numbersOnly.length === 11) {
        // Ex: 11999998888 -> 5511999998888
        return "55" + numbersOnly;
      } else if (numbersOnly.length === 10) {
        // Ex: 999998888 -> 5543999998888 (assume DDD 43)
        return "5543" + numbersOnly;
      }
      return numbersOnly; // fallback
    }

    const whatsappMessage = encodeURIComponent(
      `🍕 *NOVO ORÇAMENTO - Julio's Pizza House*\n\n` +
      `👤 *Cliente:* ${formData.nome_completo}\n` +
      `📄 *CPF/CNPJ:* ${formData.cpf}\n` +
      `📞 *Telefone:* ${formData.telefone}\n\n` +
      `📅 *Data do Evento:* ${new Date(formData.data_evento).toLocaleDateString('pt-BR')}\n` +
      `⏰ *Horário:* ${formData.horario}\n` +
      `📍 *Local:* ${formData.endereco_evento}\n\n` +
      `👥 *Pessoas:*\n` +
      `• Adultos: ${formData.quantidade_adultos}\n` +
      `• Crianças: ${formData.quantidade_criancas}\n` +
      `• Total: ${formData.quantidade_adultos + formData.quantidade_criancas} pessoas\n\n` +
      `💬 Entre em contato com o cliente para finalizar o orçamento!`
    );

    // Link para WhatsApp do solicitante
    const whatsappNumber = getWhatsAppNumber(formData.telefone);
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
    const emailResponse = await resend.emails.send({
      from: "Julio's Pizza House <onboarding@resend.dev>",
      to: ["juliospizzahouse@gmail.com"],
      subject: "Novo Orçamento Recebido - Julio's Pizza House",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f97316; text-align: center;">Novo Orçamento Recebido</h1>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">Dados do Cliente</h2>
            <p><strong>Nome:</strong> ${formData.nome_completo}</p>
            <p><strong>CPF/CNPJ:</strong> ${formData.cpf}</p>
            <p><strong>Telefone:</strong> ${formData.telefone}</p>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">Detalhes do Evento</h2>
            <p><strong>Data:</strong> ${new Date(formData.data_evento).toLocaleDateString('pt-BR')}</p>
            <p><strong>Horário:</strong> ${formData.horario}</p>
            <p><strong>Local:</strong> ${formData.endereco_evento}</p>
            <p><strong>Adultos:</strong> ${formData.quantidade_adultos}</p>
            <p><strong>Crianças:</strong> ${formData.quantidade_criancas}</p>
            <p><strong>Total de Pessoas:</strong> ${formData.quantidade_adultos + formData.quantidade_criancas}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${whatsappLink}" 
               style="background-color: #25D366; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; margin: 10px;">
              💬 Responder via WhatsApp do Solicitante
            </a>
          </div>

          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #25D366;">
            <h3 style="color: #25D366; margin-top: 0;">📱 WhatsApp Direto</h3>
            <p style="margin: 5px 0; font-size: 14px;">
              Clique no botão acima para abrir o WhatsApp automaticamente com o número do solicitante e uma mensagem pré-formatada contendo todos os dados do orçamento.
            </p>
          </div>

          <p style="text-align: center; color: #666; margin-top: 30px;">
            Acesse o painel administrativo para visualizar e gerenciar este orçamento.
          </p>
        </div>
      `
    });
    console.log("Email de notificação enviado:", emailResponse);
    return new Response(JSON.stringify({
      success: true
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error("Erro ao enviar email de notificação:", error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
};
serve(handler);

