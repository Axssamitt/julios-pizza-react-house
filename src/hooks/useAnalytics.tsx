
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAnalytics = (pagePath: string) => {
  useEffect(() => {
    const trackPageView = async () => {
      try {
        // Gerar um session ID simples baseado no timestamp e random
        const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        await supabase.from('page_analytics').insert({
          pagina: pagePath,
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
          session_id: sessionId
        });
      } catch (error) {
        console.error('Erro ao registrar analytics:', error);
      }
    };

    trackPageView();
  }, [pagePath]);
};
