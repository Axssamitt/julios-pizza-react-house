
import React from 'react';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { DashboardStatsCards } from './DashboardStatsCards';
import { DashboardChart } from './DashboardChart';
import { RecentAccessTable } from './RecentAccessTable';

export const Dashboard = () => {
  const { analytics, stats, pageViews, loading } = useAnalyticsData();

  return (
    <div className="space-y-6">
      <DashboardStatsCards stats={stats} loading={loading} />
      <DashboardChart pageViews={pageViews} />
      <RecentAccessTable analytics={analytics} />
    </div>
  );
};
