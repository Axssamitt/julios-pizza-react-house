
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AnalyticsData {
  id: string;
  pagina: string;
  user_agent: string | null;
  ip_address: unknown;
  referrer: string | null;
  session_id: string | null;
  created_at: string;
}

interface RecentAccessTableProps {
  analytics: AnalyticsData[];
}

export const RecentAccessTable = ({ analytics }: RecentAccessTableProps) => {
  return (
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
                <TableCell className="text-white">{item.pagina}</TableCell>
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
  );
};
