
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  id: string;
  pagina: string;
  user_agent: string;
  ip_address: unknown;
  referrer: string;
  session_id: string;
  created_at: string;
}

interface DashboardStats {
  totalViews: number;
  uniqueVisitors: number;
  todayViews: number;
  avgViewsPerDay: number;
}

export const useAnalyticsData = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalViews: 0,
    uniqueVisitors: 0,
    todayViews: 0,
    avgViewsPerDay: 0
  });
  const [pageViews, setPageViews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Buscar dados dos últimos 30 dias
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data, error } = await supabase
          .from('page_analytics')
          .select('*')
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: false });
        
        if (error) throw error;

        setAnalytics(data || []);
        
        // Calcular estatísticas
        const totalViews = data?.length || 0;
        const uniqueVisitors = new Set(data?.map(item => item.session_id)).size;
        
        const today = new Date().toDateString();
        const todayViews = data?.filter(item => 
          new Date(item.created_at).toDateString() === today
        ).length || 0;

        const avgViewsPerDay = Math.round(totalViews / 30);

        setStats({
          totalViews,
          uniqueVisitors,
          todayViews,
          avgViewsPerDay
        });

        // Preparar dados para o gráfico
        const viewsByDate = data?.reduce((acc: any, item) => {
          const date = new Date(item.created_at).toLocaleDateString('pt-BR');
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});

        const chartData = Object.entries(viewsByDate || {})
          .map(([date, views]) => ({ date, views }))
          .slice(-7); // Últimos 7 dias

        setPageViews(chartData);
      } catch (error) {
        console.error('Erro ao carregar analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return { analytics, stats, pageViews, loading };
};
