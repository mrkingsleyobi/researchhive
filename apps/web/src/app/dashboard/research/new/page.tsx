'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@vibecast/ui';
import { trpc } from '@/lib/trpc';
import { Loader2 } from 'lucide-react';

export default function NewResearchPage() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [depth, setDepth] = useState<'quick' | 'standard' | 'deep'>('standard');

  const createResearch = trpc.research.create.useMutation({
    onSuccess: (data) => {
      router.push(`/dashboard/research/${data.id}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    createResearch.mutate({
      topic: topic.trim(),
      depth,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">New Research Project</h2>
        <p className="text-muted-foreground">
          Start a new AI-powered research project with multi-agent swarm intelligence
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Research Configuration</CardTitle>
          <CardDescription>
            Configure your research parameters and let our AI agents do the work
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="topic">Research Topic *</Label>
              <Input
                id="topic"
                placeholder="e.g., AI trends in healthcare 2025"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                disabled={createResearch.isLoading}
              />
              <p className="text-sm text-muted-foreground">
                Enter a clear, specific topic for the AI agents to research
              </p>
            </div>

            <div className="space-y-2">
              <Label>Research Depth</Label>
              <div className="grid grid-cols-3 gap-4">
                {(['quick', 'standard', 'deep'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDepth(d)}
                    disabled={createResearch.isLoading}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      depth === d
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium capitalize">{d}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {d === 'quick' && '~2 min, 5-10 sources'}
                      {d === 'standard' && '~5 min, 10-20 sources'}
                      {d === 'deep' && '~15 min, 30+ sources'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={!topic.trim() || createResearch.isLoading}
                className="flex-1"
              >
                {createResearch.isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {createResearch.isLoading ? 'Starting Research...' : 'Start Research'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={createResearch.isLoading}
              >
                Cancel
              </Button>
            </div>

            {createResearch.error && (
              <div className="p-4 bg-destructive/10 border border-destructive text-destructive rounded-lg text-sm">
                Error: {createResearch.error.message}
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What Happens Next?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              1
            </div>
            <div>
              <h4 className="font-medium">Agent Deployment</h4>
              <p className="text-sm text-muted-foreground">
                Multiple specialized AI agents are deployed in parallel to gather information
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              2
            </div>
            <div>
              <h4 className="font-medium">Data Collection</h4>
              <p className="text-sm text-muted-foreground">
                Agents search web, academic papers, news, and social media for relevant information
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              3
            </div>
            <div>
              <h4 className="font-medium">Analysis & Synthesis</h4>
              <p className="text-sm text-muted-foreground">
                AI analyzes findings, extracts key insights, and builds knowledge graphs
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              4
            </div>
            <div>
              <h4 className="font-medium">Report Generation</h4>
              <p className="text-sm text-muted-foreground">
                Final report generated with citations, visualizations, and actionable insights
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
