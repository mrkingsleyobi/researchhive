'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vibecast/ui';
import { Activity, Search, Users, Zap } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function DashboardPage() {
  const healthQuery = trpc.health.useQuery();

  const stats = [
    {
      name: 'Total Research',
      value: '24',
      change: '+12%',
      icon: Search,
    },
    {
      name: 'Active Agents',
      value: '8',
      change: '+2',
      icon: Activity,
    },
    {
      name: 'Team Members',
      value: '5',
      change: '0',
      icon: Users,
    },
    {
      name: 'API Calls',
      value: '1.2K',
      change: '+18%',
      icon: Zap,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your research.
        </p>
      </div>

      {healthQuery.data && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✅ API Connected: {healthQuery.data.message}
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Research</CardTitle>
            <CardDescription>
              Your latest research projects and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    AI Trends in Healthcare 2025
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Completed 2 hours ago
                  </p>
                </div>
                <div className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded text-xs font-medium">
                  Complete
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Climate Change Policy Analysis
                  </p>
                  <p className="text-sm text-muted-foreground">
                    In progress - 65% complete
                  </p>
                </div>
                <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded text-xs font-medium">
                  In Progress
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Tech Industry Job Market Report
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Queued for processing
                  </p>
                </div>
                <div className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded text-xs font-medium">
                  Pending
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Start a new research project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/dashboard/research/new"
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">New Research</p>
                <p className="text-xs text-muted-foreground">
                  Start a new AI-powered research project
                </p>
              </div>
              <Search className="h-5 w-5 text-muted-foreground" />
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
