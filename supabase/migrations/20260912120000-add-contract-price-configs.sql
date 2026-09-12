INSERT INTO public.configuracoes (chave, valor, descricao, ativo)
VALUES
  ('valor_adulto', '55', 'Valor padrão por adulto no contrato', true),
  ('valor_crianca', '27', 'Valor padrão por criança no contrato', true)
ON CONFLICT (chave) DO NOTHING;