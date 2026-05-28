// ============================================================
// MIGRADO PARA BACKEND PHP/MySQL (HostGator)
// O cliente abaixo é um adaptador que imita a API do supabase-js
// mas faz requisições para a API REST em PHP.
//
// Configure VITE_API_URL no .env apontando para sua API, ex:
//   VITE_API_URL=https://seudominio.com.br/api
//
// Os componentes continuam usando:
//   import { supabase } from "@/integrations/supabase/client";
// ============================================================
export { supabase } from '@/integrations/api/client';
