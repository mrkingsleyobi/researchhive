'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@researchhive/ui';
import { trpc } from '@/lib/trpc';
import { ArrowLeft, CheckCircle2, Loader2, XCircle } from 'lucide-react';

export default function ResearchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const researchId = params.id as string;
  const [pollingEnabled, setPollingEnabled] = useState(true);

  // Poll for progress every 2 seconds while research is in progress
  const { data: progress, refetch } = trpc.research.getProgress.useQuery(
    { id: researchId },
    {
      enabled: pollingEnabled,
      refetchInterval: pollingEnabled ? 2000 : false,
    }
  );

  // Fetch results when completed
  const { data: results } = trpc.research.getResults.useQuery(
    { id: researchId },
    {
      enabled: progress?.status === 'completed',
    }
  );

  // Stop polling when research is completed or failed
  useEffect(() => {
    if (progress?.status === 'completed' || progress?.status === 'failed') {
      setPollingEnabled(false);
    }
  }, [progress?.status]);

  const getStatusColor = () => {
    switch (progress?.status) {
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'in_progress':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (progress?.status) {
      case 'completed':
        return <CheckCircle2 className="h-6 w-6 text-green-600" />;
      case 'failed':
        return <XCircle className="h-6 w-6 text-red-600" />;
      case 'in_progress':
        return <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />;
      default:
        return <Loader2 className="h-6 w-6 text-gray-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/research')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Research
        </Button>
      </div>

      <div>
        <h2 className="text-3xl font-bold tracking-tight">Research Progress</h2>
        <p className="text-muted-foreground">Research ID: {researchId}</p>
      </div>

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <CardTitle className="capitalize">{progress?.status || 'Loading...'}</CardTitle>
                <CardDescription>{progress?.currentStep || 'Initializing...'}</CardDescription>
              </div>
            </div>
            <div className={`text-2xl font-bold ${getStatusColor()}`}>
              {progress?.progress || 0}%
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress?.progress || 0}%` }}
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-muted-foreground">Agents Deployed</div>
                <div className="text-2xl font-bold">{progress?.agentsDeployed || 0}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-muted-foreground">Sources Found</div>
                <div className="text-2xl font-bold">{progress?.sourcesFound || 0}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Card - Only show when completed */}
      {progress?.status === 'completed' && results && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{results.summary}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key Findings</CardTitle>
              <CardDescription>{results.keyFindings.length} insights discovered</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {results.keyFindings.map((finding, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-muted-foreground">{finding}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sources</CardTitle>
              <CardDescription>{results.sources.length} sources analyzed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.sources.map((source, idx) => (
                  <div key={idx} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm mb-1">{source.title}</h4>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline break-all"
                        >
                          {source.url}
                        </a>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <div className="px-2 py-1 bg-green-100 text-green-700 rounded">
                          {Math.round(source.credibility * 100)}% credible
                        </div>
                        <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {Math.round(source.relevance * 100)}% relevant
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {results.insights.map((insight, idx) => (
                  <li key={idx} className="flex gap-2 text-muted-foreground">
                    <span>•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {results.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex gap-2 text-muted-foreground">
                    <span>•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button onClick={() => router.push('/dashboard/research/new')} className="flex-1">
              Start New Research
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              Export Report
            </Button>
          </div>
        </>
      )}

      {/* Error Card */}
      {progress?.status === 'failed' && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">Research Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{progress.currentStep}</p>
            <Button
              onClick={() => router.push('/dashboard/research/new')}
              variant="outline"
              className="mt-4"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
