'use client';

import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vibecast/ui';
import { Plus, Search, TrendingUp, Clock, CheckCircle } from 'lucide-react';

export default function ResearchPage() {
  const router = useRouter();

  // Mock recent research for now - will be replaced with actual API call
  const recentResearch = [
    {
      id: 'sample-1',
      topic: 'AI trends in healthcare 2025',
      status: 'completed',
      createdAt: new Date().toISOString(),
      sourcesCount: 15,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Research Projects</h2>
          <p className="text-muted-foreground">
            Manage your AI-powered research projects
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/research/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Research
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Research</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              +0 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Active research projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Successfully completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Research */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Research</CardTitle>
          <CardDescription>
            Your latest AI-powered research projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentResearch.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No research projects yet</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first AI-powered research project
              </p>
              <Button onClick={() => router.push('/dashboard/research/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Research
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentResearch.map((research) => (
                <div
                  key={research.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/dashboard/research/${research.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{research.topic}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="capitalize">{research.status}</span>
                        <span>•</span>
                        <span>{research.sourcesCount} sources</span>
                        <span>•</span>
                        <span>{new Date(research.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      research.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : research.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {research.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Start Guide */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                1
              </div>
              <h4 className="font-medium mb-1">Choose Topic</h4>
              <p className="text-sm text-muted-foreground">
                Enter your research topic and depth
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                2
              </div>
              <h4 className="font-medium mb-1">AI Agents Work</h4>
              <p className="text-sm text-muted-foreground">
                Multi-agent swarm gathers data
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                3
              </div>
              <h4 className="font-medium mb-1">Analysis</h4>
              <p className="text-sm text-muted-foreground">
                AI synthesizes insights
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                4
              </div>
              <h4 className="font-medium mb-1">Get Results</h4>
              <p className="text-sm text-muted-foreground">
                Comprehensive report ready
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
