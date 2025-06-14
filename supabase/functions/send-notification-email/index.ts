
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmailRequest {
  nome_completo: string;
  cpf: string;
  data_evento: string;
  horario: string;
  endereco_evento: string;
  quantidade_adultos: number;
  quantidade_criancas: number;
  telefone: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData: NotificationEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Julio's Pizza House <onboarding@resend.dev>",
      to: ["jsrmturk@gmail.com"],
      subject: "Novo Orçamento Recebido - Julio's Pizza House",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f97316; text-align: center;">Novo Orçamento Recebido</h1>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">Dados do Cliente</h2>
            <p><strong>Nome:</strong> ${formData.nome_completo}</p>
            <p><strong>CPF:</strong> ${formData.cpf}</p>
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

          <p style="text-align: center; color: #666; margin-top: 30px;">
            Acesse o painel administrativo para visualizar e gerenciar este orçamento.
          </p>
        </div>
      `,
    });

    console.log("Email de notificação enviado:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erro ao enviar email de notificação:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
