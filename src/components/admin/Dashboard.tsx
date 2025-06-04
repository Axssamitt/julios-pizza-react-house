
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, Users, Clock, TrendingUp } from 'lucide-react';

interface AnalyticsData {
  id: string;
  page_path: string;
  user_agent: string;
  ip_address: string;
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

export const Dashboard = () => {
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-700 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Total de Visualizações
            </CardTitle>
            <Eye className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalViews}</div>
            <p className="text-xs text-gray-400">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Visitantes Únicos
            </CardTitle>
            <Users className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.uniqueVisitors}</div>
            <p className="text-xs text-gray-400">Sessões únicas</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Visualizações Hoje
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.todayViews}</div>
            <p className="text-xs text-gray-400">Hoje</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Média Diária
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.avgViewsPerDay}</div>
            <p className="text-xs text-gray-400">Visualizações/dia</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Visualizações */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Visualizações dos Últimos 7 Dias</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pageViews}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  color: '#F3F4F6'
                }} 
              />
              <Bar dataKey="views" fill="#F97316" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela de Acessos Recentes */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Acessos Recentes</CardTitle>
          <CardDescription className="text-gray-400">
            Últimos 20 acessos registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Página</TableHead>
                <TableHead className="text-gray-300">Data/Hora</TableHead>
                <TableHead className="text-gray-300">Referência</TableHead>
                <TableHead className="text-gray-300">Navegador</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.slice(0, 20).map((item) => (
                <TableRow key={item.id} className="border-gray-700">
                  <TableCell className="text-white">{item.page_path}</TableCell>
                  <TableCell className="text-gray-300">
                    {new Date(item.created_at).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {item.referrer || 'Direto'}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {item.user_agent?.includes('Chrome') ? 'Chrome' :
                     item.user_agent?.includes('Firefox') ? 'Firefox' :
                     item.user_agent?.includes('Safari') ? 'Safari' : 'Outro'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
