export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to ResearchHive
        </h1>
        <p className="text-center text-xl text-muted-foreground mb-12">
          AI-Powered Research Platform with Multi-Agent Intelligence
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 border rounded-lg hover:border-primary transition-colors">
            <h2 className="text-xl font-semibold mb-2">🤖 Multi-Agent Swarm</h2>
            <p className="text-sm text-muted-foreground">
              Deploy 64 specialized AI agents working in parallel
            </p>
          </div>

          <div className="p-6 border rounded-lg hover:border-primary transition-colors">
            <h2 className="text-xl font-semibold mb-2">⚡ 85% Faster</h2>
            <p className="text-sm text-muted-foreground">
              Complete comprehensive research in under 5 minutes
            </p>
          </div>

          <div className="p-6 border rounded-lg hover:border-primary transition-colors">
            <h2 className="text-xl font-semibold mb-2">💰 99% Cost Savings</h2>
            <p className="text-sm text-muted-foreground">
              Intelligent LLM routing reduces AI costs dramatically
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            🚧 Under Construction - Week 1 Implementation
          </p>
        </div>
      </div>
    </main>
  )
}
