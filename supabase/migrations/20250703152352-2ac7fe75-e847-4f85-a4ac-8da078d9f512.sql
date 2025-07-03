
-- Tabela para itens adicionais dos contratos
CREATE TABLE public.contrato_itens_adicionais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  formulario_id UUID NOT NULL REFERENCES public.formularios_contato(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL, -- Permite valores negativos para descontos
  quantidade INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para parcelamentos
CREATE TABLE public.contrato_parcelamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  formulario_id UUID NOT NULL REFERENCES public.formularios_contato(id) ON DELETE CASCADE,
  numero_parcela INTEGER NOT NULL,
  valor_parcela NUMERIC NOT NULL,
  data_vencimento DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente', -- pendente, pago, vencido
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(formulario_id, numero_parcela)
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.contrato_itens_adicionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contrato_parcelamentos ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para itens adicionais
CREATE POLICY "Permitir acesso total aos itens adicionais"
  ON public.contrato_itens_adicionais
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Políticas de acesso para parcelamentos
CREATE POLICY "Permitir acesso total aos parcelamentos"
  ON public.contrato_parcelamentos
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Criar triggers para atualizar updated_at
CREATE TRIGGER set_timestamp_contrato_itens_adicionais
  BEFORE UPDATE ON public.contrato_itens_adicionais
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER set_timestamp_contrato_parcelamentos
  BEFORE UPDATE ON public.contrato_parcelamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_timestamp();
