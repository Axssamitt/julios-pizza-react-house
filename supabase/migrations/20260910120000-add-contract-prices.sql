ALTER TABLE public.formularios_contato
  ADD COLUMN IF NOT EXISTS valor_adulto NUMERIC,
  ADD COLUMN IF NOT EXISTS valor_crianca NUMERIC;
