# Guia de Migração: Supabase para HostGator

Este guia descreve os passos necessários para hospedar o frontend do seu projeto na HostGator mantendo a conexão com o backend do Supabase.

## 1. Frontend (Hospedagem na HostGator)

O projeto foi configurado para funcionar em servidores Apache (como os da HostGator).

### Passos para o Deploy:
1. No seu computador, execute o comando:
   ```bash
   npm install
   npm run build
   ```
2. Após o build, uma pasta chamada `dist` será criada.
3. Acesse o **Gerenciador de Arquivos** do seu cPanel na HostGator.
4. Vá para a pasta `public_html` (ou a pasta do seu domínio).
5. Faça o upload de todos os arquivos **dentro** da pasta `dist` para o servidor.
6. **Importante:** O arquivo `.htaccess` já está incluído para garantir que as rotas (URLs) do site funcionem corretamente.

## 2. Backend (Banco de Dados e Funções)

**Recomendação:** Continue utilizando o Supabase como seu backend.

Como o código utiliza a biblioteca `@supabase/supabase-js`, migrar o banco de dados para o MySQL da HostGator exigiria uma reescrita completa de toda a lógica de dados do aplicativo.

### Vantagens de manter o Supabase:
- **Autenticação:** O sistema de login continuará funcionando sem alterações.
- **Storage:** O upload de imagens de pizzas e carrossel continuará operando normalmente.
- **Segurança:** As políticas de Row Level Security (RLS) do PostgreSQL garantem a proteção dos dados.

## 3. Configurações Adicionais
Se você mudar o domínio do site, lembre-se de atualizar as URLs permitidas no console do Supabase em:
`Authentication > URL Configuration > Site URL` e `Redirect URLs`.
