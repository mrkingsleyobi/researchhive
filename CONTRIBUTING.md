# Contributing to ResearchHive

Thank you for your interest in contributing to ResearchHive! We welcome contributions from the community.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [How Can I Contribute?](#how-can-i-contribute)
3. [Beta Testing](#beta-testing)
4. [Reporting Bugs](#reporting-bugs)
5. [Suggesting Features](#suggesting-features)
6. [Code Contributions](#code-contributions)
7. [Development Setup](#development-setup)
8. [Pull Request Process](#pull-request-process)
9. [Coding Standards](#coding-standards)
10. [Community](#community)

---

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please be respectful, inclusive, and professional in all interactions.

**Our Standards:**
- ✅ Be respectful and welcoming
- ✅ Be patient and constructive
- ✅ Focus on what's best for the community
- ✅ Show empathy towards others

**Unacceptable Behavior:**
- ❌ Harassment or discrimination
- ❌ Trolling or insulting comments
- ❌ Personal or political attacks
- ❌ Publishing others' private information

---

## How Can I Contribute?

There are many ways to contribute to ResearchHive:

### For Everyone

- 🐛 **Report Bugs** - Help us find and fix issues
- 💡 **Suggest Features** - Share ideas for improvements
- 📝 **Improve Documentation** - Fix typos, add examples, clarify instructions
- 🧪 **Beta Testing** - Test new features and provide feedback
- 💬 **Help Others** - Answer questions in discussions
- ⭐ **Star the Repo** - Show your support

### For Developers

- 🔧 **Fix Bugs** - Submit pull requests for bug fixes
- ✨ **Add Features** - Implement new functionality
- 🧪 **Write Tests** - Improve test coverage
- ⚡ **Optimize Performance** - Make ResearchHive faster
- 🔒 **Improve Security** - Identify and fix security issues
- 📦 **Update Dependencies** - Keep dependencies up to date

---

## Beta Testing

### How to Beta Test

ResearchHive is currently in **beta**. Beta testers help us:
- Identify bugs before production release
- Validate new features
- Improve user experience
- Test performance under real-world conditions

**Getting Started:**
1. Read the [Beta User Guide](docs/BETA_USER_GUIDE.md)
2. Use ResearchHive for your real research needs
3. Report any bugs or issues you encounter
4. Share feedback on features and UX
5. Suggest improvements

**What to Test:**

**Core Features:**
- [ ] Creating research (all 3 depth levels)
- [ ] Viewing research results
- [ ] Knowledge graph visualization
- [ ] Authentication (sign in/out)
- [ ] Dashboard navigation

**Edge Cases:**
- [ ] Very long research topics (200+ characters)
- [ ] Special characters in topics
- [ ] Multiple simultaneous research
- [ ] Slow internet connection
- [ ] Mobile devices
- [ ] Different browsers

**Provide Feedback:**
- Use [GitHub Issues](https://github.com/mrkingsleyobi/researchhive/issues) for bugs
- Use [GitHub Discussions](https://github.com/mrkingsleyobi/researchhive/discussions) for general feedback
- Follow the bug report template for structured feedback

---

## Reporting Bugs

### Before Reporting

1. **Search existing issues** - Someone may have already reported it
2. **Try the latest version** - The bug might already be fixed
3. **Verify it's reproducible** - Make sure it happens consistently

### How to Report

Use our [Bug Report Template](https://github.com/mrkingsleyobi/researchhive/issues/new?template=bug_report.yml)

**Include:**
- ✅ Clear description of the bug
- ✅ Steps to reproduce
- ✅ Expected vs actual behavior
- ✅ Browser/OS information
- ✅ Screenshots (if applicable)
- ✅ Console errors (if applicable)

**Good Bug Report Example:**

```markdown
**Bug:** Research gets stuck at 75% progress

**Steps to reproduce:**
1. Create new research with topic "AI in Healthcare"
2. Select "Standard" depth
3. Click "Start Research"
4. Progress reaches 75% then stops
5. Wait 5+ minutes, no change

**Expected:** Research completes in 5-10 seconds
**Actual:** Research stuck indefinitely at 75%

**Browser:** Chrome 119.0.6045.159
**OS:** macOS 14.1
**Research ID:** cm3x4y5z6a7b8c9d0e1f2g3h

**Console Error:**
```
TypeError: Cannot read property 'results' of undefined
  at ResearchOrchestrator.ts:245
```

**Screenshot:** [attached]
```

---

## Suggesting Features

### Before Suggesting

1. **Check existing feature requests** - It might already be proposed
2. **Review the roadmap** - It might already be planned
3. **Ensure it aligns** - Make sure it fits ResearchHive's mission

### How to Suggest

Use our [Feature Request Template](https://github.com/mrkingsleyobi/researchhive/issues/new?template=feature_request.yml)

**Include:**
- ✅ Clear feature description
- ✅ Problem it solves
- ✅ Proposed solution
- ✅ Alternatives considered
- ✅ Use case examples

**Good Feature Request Example:**

```markdown
**Feature:** Export research results as PDF

**Problem:**
I need to share research results with colleagues who don't have
ResearchHive accounts. Currently, I have to manually copy-paste
results into a document, which is time-consuming and loses formatting.

**Proposed Solution:**
Add "Export as PDF" button on research results page. The PDF should include:
- Executive summary
- Key findings (bulleted list)
- All sources with titles, URLs, and credibility scores
- Knowledge graph visualization (as image)
- ResearchHive branding/footer

**Alternatives:**
- Export as Word doc (less universal)
- Export as HTML (harder to share)
- Print to PDF (loses interactive elements)

**Priority:** High - Would use this multiple times per day
**User Type:** Business Professional
```

---

## Code Contributions

### Development Setup

**Prerequisites:**
- Node.js ≥ 20.0.0
- pnpm ≥ 8.0.0
- Git

**Setup Steps:**

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/researchhive.git
cd researchhive

# 3. Add upstream remote
git remote add upstream https://github.com/mrkingsleyobi/researchhive.git

# 4. Install dependencies
pnpm install

# 5. Copy environment file
cp .env.example .env

# 6. Generate Prisma client
pnpm db:generate

# 7. Push database schema
pnpm db:push

# 8. Start development servers
pnpm dev
```

**Verify Setup:**
- Web app: http://localhost:3000
- API server: http://localhost:4000
- No console errors

### Project Structure

```
researchhive/
├── apps/
│   ├── api/              # Fastify API server
│   │   ├── src/
│   │   │   ├── router/   # tRPC routes
│   │   │   ├── middleware/ # Auth, etc.
│   │   │   └── index.ts
│   │   └── package.json
│   └── web/              # Next.js frontend
│       ├── src/
│       │   ├── app/      # App router pages
│       │   ├── components/ # React components
│       │   └── lib/      # Utilities
│       └── package.json
├── packages/
│   ├── ai/               # AI services & agents
│   │   ├── agents/       # Research agents
│   │   └── services/     # Orchestration
│   ├── database/         # Prisma schema
│   ├── monitoring/       # Sentry, Prometheus
│   ├── cache/            # Redis wrapper
│   └── types/            # Shared types
├── docs/                 # Documentation
├── k6/                   # Load tests
└── pnpm-workspace.yaml
```

### Making Changes

**1. Create a Branch**

```bash
# Sync with upstream
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch Naming:**
- `feature/add-pdf-export` - New features
- `fix/research-stuck-bug` - Bug fixes
- `docs/api-reference-typos` - Documentation
- `refactor/optimize-agents` - Refactoring
- `test/add-e2e-tests` - Tests

**2. Write Code**

Follow our [Coding Standards](#coding-standards) below.

**3. Test Your Changes**

```bash
# Lint
pnpm lint

# Type check
pnpm typecheck

# Run tests
pnpm test

# E2E tests (optional but recommended)
pnpm test:e2e

# Build (make sure it builds)
pnpm build
```

**4. Commit Changes**

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format:
# <type>(<scope>): <description>

git commit -m "feat(api): add PDF export endpoint"
git commit -m "fix(web): resolve research stuck at 75% bug"
git commit -m "docs(readme): update installation steps"
git commit -m "test(agents): add unit tests for credibility scorer"
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style (formatting, no logic change)
- `refactor` - Code refactoring
- `test` - Adding/updating tests
- `chore` - Build process, dependencies

**5. Push to Your Fork**

```bash
git push origin feature/your-feature-name
```

---

## Pull Request Process

### Creating a Pull Request

1. **Push your branch** to your fork
2. **Open PR** on GitHub from your branch to `main`
3. **Fill out the PR template** (auto-populated)
4. **Link related issues** (e.g., "Closes #123")
5. **Request review** (if you know who should review)

### PR Title Format

```
<type>(<scope>): <description>

Examples:
feat(api): add PDF export endpoint
fix(web): resolve research progress stuck bug
docs(guide): add beta testing section
```

### PR Description Template

```markdown
## What does this PR do?

Brief description of changes.

## Why is this needed?

Explain the problem this solves or feature it adds.

## How was this tested?

- [ ] Unit tests
- [ ] E2E tests
- [ ] Manual testing
- [ ] Tested on Chrome, Firefox, Safari

## Screenshots (if applicable)

[Add screenshots of UI changes]

## Related Issues

Closes #123
Related to #456

## Checklist

- [ ] Code follows project coding standards
- [ ] Tests pass locally
- [ ] Documentation updated (if needed)
- [ ] No console errors or warnings
- [ ] Reviewed my own code
```

### Review Process

1. **Automated Checks** - CI/CD runs (lint, test, build)
2. **Code Review** - Maintainer reviews code
3. **Feedback** - Address review comments
4. **Approval** - Maintainer approves PR
5. **Merge** - PR is merged to main

**Review Timeline:**
- Simple fixes: 1-2 days
- New features: 3-5 days
- Major changes: 1-2 weeks

**What Reviewers Look For:**
- Code quality and readability
- Test coverage
- Performance impact
- Security considerations
- Breaking changes
- Documentation updates

---

## Coding Standards

### TypeScript

**Use TypeScript everywhere:**

```typescript
// ✅ Good - Explicit types
function calculateCredibility(source: Source): number {
  return score;
}

// ❌ Bad - Implicit any
function calculateCredibility(source) {
  return score;
}
```

**Avoid `any`:**

```typescript
// ✅ Good
const data: SearchResult[] = [];

// ❌ Bad
const data: any = [];
```

### Code Style

**Follow existing patterns:**

```typescript
// ✅ Good - Consistent with codebase
export class WebScraperAgent extends BaseAgent {
  async search(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    await this.checkRateLimit();
    return await this.retry(() => this.searchGoogle(query));
  }
}

// ❌ Bad - Different pattern
export class WebScraperAgent {
  search = async (query, options) => {
    this.checkRateLimit();
    return this.searchGoogle(query);
  }
}
```

**Use descriptive names:**

```typescript
// ✅ Good
const credibilityScore = calculateSourceCredibility(source);
const filteredResults = removeDuplicateSources(results);

// ❌ Bad
const score = calc(s);
const filtered = remove(r);
```

### File Organization

**One component per file:**

```typescript
// ✅ Good
// components/ResearchCard.tsx
export function ResearchCard({ research }: Props) { ... }

// ❌ Bad
// components/index.tsx
export function ResearchCard() { ... }
export function SourceCard() { ... }
export function GraphCard() { ... }
```

**Group related files:**

```
packages/ai/agents/
├── base-agent.ts
├── web-scraper-agent.ts
├── academic-agent.ts
├── credibility-scorer.ts
└── index.ts (exports)
```

### Testing

**Write tests for new features:**

```typescript
// agents/credibility-scorer.test.ts
describe('CredibilityScorer', () => {
  it('should score academic sources highly', () => {
    const source: SearchResult = {
      url: 'https://arxiv.org/paper',
      source: 'arXiv',
      // ...
    };

    const scored = CredibilityScorer.scoreResult(source);
    expect(scored.credibilityScore).toBeGreaterThan(90);
  });

  it('should filter sources below minimum credibility', () => {
    const results = [
      { credibilityScore: 95 },
      { credibilityScore: 45 }, // Below threshold
      { credibilityScore: 75 },
    ];

    const filtered = CredibilityScorer.filterByCredibility(results, 60);
    expect(filtered).toHaveLength(2);
  });
});
```

### Documentation

**Add JSDoc comments for public APIs:**

```typescript
/**
 * Scores a search result based on credibility factors
 *
 * @param result - The search result to score
 * @returns The result with added credibility score (0-100)
 *
 * @example
 * ```typescript
 * const scored = CredibilityScorer.scoreResult({
 *   url: 'https://arxiv.org/paper',
 *   source: 'arXiv',
 * });
 * console.log(scored.credibilityScore); // 98
 * ```
 */
export static scoreResult(result: SearchResult): ScoredResult {
  // ...
}
```

### Error Handling

**Use proper error handling:**

```typescript
// ✅ Good
try {
  const results = await this.searchGoogle(query);
  return results;
} catch (error) {
  console.error(`[WebScraperAgent] Search error:`, error);
  throw new Error(`Failed to search: ${error.message}`);
}

// ❌ Bad
try {
  return await this.searchGoogle(query);
} catch (e) {
  console.log(e);
}
```

### Performance

**Be mindful of performance:**

```typescript
// ✅ Good - Parallel execution
const results = await Promise.all([
  agent1.search(query),
  agent2.search(query),
  agent3.search(query),
]);

// ❌ Bad - Sequential execution
const results = [];
results.push(await agent1.search(query));
results.push(await agent2.search(query));
results.push(await agent3.search(query));
```

---

## Community

### Where to Get Help

**Documentation:**
- [README.md](README.md) - Project overview
- [docs/](docs/) - Complete documentation
- [API Reference](docs/API_REFERENCE.md) - API docs
- [Beta User Guide](docs/BETA_USER_GUIDE.md) - User guide

**Discussion Forums:**
- [GitHub Discussions](https://github.com/mrkingsleyobi/researchhive/discussions) - General discussion
- [Discord](https://discord.gg/researchhive) - Real-time chat (if available)

**Issue Tracking:**
- [GitHub Issues](https://github.com/mrkingsleyobi/researchhive/issues) - Bug reports and features

### Communication Guidelines

**When Asking Questions:**
- Search for existing answers first
- Provide context and details
- Include code samples when relevant
- Be patient and respectful

**When Providing Answers:**
- Be helpful and constructive
- Provide examples when possible
- Link to relevant documentation
- Be patient with beginners

---

## Recognition

Contributors will be recognized in:
- GitHub contributors page
- CHANGELOG.md (for significant contributions)
- Release notes
- README.md (for major features)

Beta testers who provide valuable feedback will receive:
- Early access to new features
- Special "Beta Tester" badge (if implemented)
- Lifetime discount on paid plans (post-beta)
- Credit in release announcements

---

## License

By contributing to ResearchHive, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

## Questions?

If you have questions about contributing:
- Open a [Discussion](https://github.com/mrkingsleyobi/researchhive/discussions)
- Check the [FAQ](docs/BETA_USER_GUIDE.md#faq)
- Read the [documentation](docs/)

---

**Thank you for contributing to ResearchHive! 🎉**
