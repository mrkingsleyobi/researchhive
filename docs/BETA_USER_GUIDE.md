# 🎓 ResearchHive Beta User Guide

**Welcome to ResearchHive Beta!**

Thank you for being an early adopter. This guide will help you get the most out of ResearchHive's AI-powered research automation.

---

## Table of Contents

1. [What is ResearchHive?](#what-is-researchhive)
2. [Getting Started](#getting-started)
3. [Creating Your First Research](#creating-your-first-research)
4. [Understanding Research Depths](#understanding-research-depths)
5. [Reading Research Results](#reading-research-results)
6. [Exploring the Knowledge Graph](#exploring-the-knowledge-graph)
7. [Tips for Best Results](#tips-for-best-results)
8. [Beta Testing Guidelines](#beta-testing-guidelines)
9. [Known Limitations](#known-limitations)
10. [Providing Feedback](#providing-feedback)
11. [FAQ](#faq)

---

## What is ResearchHive?

### The Problem We Solve

Traditional research is:
- ⏰ **Time-consuming** - Hours spent searching and reading
- 🔍 **Inconsistent** - Different people, different results
- 💸 **Expensive** - Manual research teams cost thousands
- 📚 **Overwhelming** - Too much information, no structure

### Our Solution

ResearchHive deploys **8-16 specialized AI agents** that work in parallel to:
- ✅ Gather high-quality sources from academic, news, and web sources
- ✅ Analyze and synthesize findings automatically
- ✅ Generate comprehensive reports with citations
- ✅ Complete research in **under 10 seconds**

### Key Benefits

| Traditional Research | ResearchHive |
|---------------------|--------------|
| 2-4 hours per topic | 5-10 seconds |
| Manual source vetting | AI credibility scoring |
| Biased by researcher | Multi-perspective analysis |
| Scattered notes | Structured report |
| No citations | Full citation management |

---

## Getting Started

### Step 1: Sign In

1. **Visit** https://your-domain.com
2. **Click** "Sign In" button
3. **Authenticate** via Logto (Google, GitHub, or email)
4. **Redirect** back to ResearchHive

**Demo Mode:** If you see "Demo User" in the top-right, you're using demo mode (no sign-in required for testing).

### Step 2: Dashboard Overview

After signing in, you'll see your **Research Dashboard**:

```
┌─────────────────────────────────────────┐
│  ResearchHive                  [Profile] │
├─────────────────────────────────────────┤
│  📊 Your Research                        │
│  ┌────────────────┐ [+ New Research]   │
│  │ Recent:        │                     │
│  │ • Research 1   │                     │
│  │ • Research 2   │                     │
│  └────────────────┘                     │
└─────────────────────────────────────────┘
```

**Dashboard Sections:**
- **Recent Research** - Your last 10 research tasks
- **New Research Button** - Start a new research
- **Profile Menu** - Account settings, logout

---

## Creating Your First Research

### Step 1: Click "New Research"

Click the **"+ New Research"** button on your dashboard.

### Step 2: Fill in the Form

You'll see a form with 3 fields:

#### 1. **Research Topic** (Required)

Enter what you want to research. Be specific!

**Good Examples:**
- ✅ "Latest advances in quantum computing for drug discovery"
- ✅ "Best practices for React performance optimization in 2024"
- ✅ "Impact of remote work on employee productivity"

**Avoid:**
- ❌ "Technology" (too broad)
- ❌ "Help me" (not a research topic)
- ❌ Single words like "AI" or "Business"

#### 2. **Research Depth** (Required)

Choose how comprehensive you want the research:

| Depth | Agents | Sources | Time | Best For |
|-------|--------|---------|------|----------|
| **Quick** | 4 | 6-12 | ~3-5s | Fast overviews, initial exploration |
| **Standard** | 8 | 12-24 | ~5-8s | Comprehensive research, most use cases |
| **Deep** | 16 | 24-48 | ~8-12s | Extensive reviews, academic research |

**Recommendation for first time:** Start with **Quick** to see how it works, then try **Standard** for your real research.

#### 3. **Description** (Optional)

Add any specific focus areas or constraints.

**Examples:**
- "Focus on practical applications, not theory"
- "Include recent developments from 2024 only"
- "Prioritize peer-reviewed academic sources"

### Step 3: Submit

Click **"Start Research"** button.

You'll be redirected to the **Progress Page**.

---

## Understanding Research Depths

### Quick Depth (4 Agents)

**Agents Used:**
1. Overview & Fundamentals
2. Recent Developments
3. Best Practices
4. Web Scraper

**Best For:**
- Quick fact-checking
- Initial topic exploration
- Simple questions
- Time-sensitive research

**Expected Output:** 6-12 sources, 3-5 key findings

### Standard Depth (8 Agents) ⭐ Recommended

**Agents Used:**
1. Overview & Fundamentals
2. Recent Developments
3. Best Practices
4. Case Studies
5. Academic Papers
6. Industry Reports
7. Web Scraper
8. News Aggregator

**Best For:**
- Most research needs
- Comprehensive topic coverage
- Business decisions
- Content creation research

**Expected Output:** 12-24 sources, 5-10 key findings

### Deep Depth (16 Agents)

**All 8 Standard Agents** + **8 Specialized Agents:**
- Social Media Analyzer
- Expert Opinion Aggregator
- Tools & Technology Scanner
- Historical Context Analyzer
- Trend Forecaster
- Competitor Analyzer
- Academic Deep Dive
- International Perspective

**Best For:**
- Academic literature reviews
- Strategic business analysis
- PhD research
- Comprehensive reports

**Expected Output:** 24-48 sources, 10-20 key findings

---

## Reading Research Results

### Progress Page

While research is running, you'll see:

```
┌─────────────────────────────────────────┐
│  Researching: "AI in Healthcare"        │
├─────────────────────────────────────────┤
│  Status: Gathering sources              │
│  Progress: ████████░░░░░░░░ 45%        │
│                                         │
│  📊 Current Stats:                      │
│  • Agents deployed: 8                   │
│  • Sources found: 12                    │
│  • Estimated time: 15 seconds           │
└─────────────────────────────────────────┘
```

**Status Updates:**
1. **Pending** - Research queued
2. **Gathering** - AI agents collecting sources (30-50% progress)
3. **Analyzing** - Synthesizing findings (50-90% progress)
4. **Completed** - Results ready! (100%)

### Results Page

Once completed, you'll see **5 tabs**:

#### 1. **Summary Tab** (Default)

**What you'll see:**
- **Executive Summary** - 2-3 paragraph overview
- **Key Findings** - 5-10 bullet points of main insights
- **Quick Stats** - Sources used, agents deployed, credibility score

**Example Summary:**
```
Quantum computing shows promising applications in healthcare,
particularly in drug discovery, medical imaging, and genomics.
Current 50-100 qubit systems already demonstrate advantages over
classical computing for specific molecular simulation tasks...

Key Findings:
• Quantum algorithms can accelerate drug discovery by 100x
• Medical imaging benefits from quantum machine learning
• Major pharma companies investing $500M+ in quantum research
• Expected mainstream adoption by 2027-2030
• Current limitation: error correction and qubit stability
```

#### 2. **Sources Tab**

**What you'll see:**
- List of all sources (12-48 depending on depth)
- Each source shows:
  - **Title** - Source name
  - **URL** - Link to original
  - **Description** - 1-2 sentence summary
  - **Credibility Score** - 0-100 (higher = more trustworthy)
  - **Relevance** - 0.0-1.0 (how relevant to your topic)
  - **Source Type** - Academic, News, Web, Social
  - **Publication Date** - When published

**Source Quality Indicators:**
- 🟢 **90-100** - Excellent (peer-reviewed, authoritative)
- 🟡 **70-89** - Good (reputable news, industry reports)
- 🟠 **60-69** - Fair (general web, blogs)
- 🔴 **<60** - Low (filtered out automatically)

**Example Source:**
```
┌────────────────────────────────────────────┐
│ Quantum Computing in Drug Discovery        │
│ https://arxiv.org/abs/2024.12345          │
│ Credibility: 98 🟢 | Relevance: 0.95      │
│ Source: arXiv | Date: Sep 2024            │
│                                            │
│ Analysis of quantum algorithms for         │
│ molecular simulation in pharmaceutical     │
│ research. Demonstrates 100x speedup for... │
│                                            │
│ Authors: Dr. Jane Smith, Dr. John Doe     │
└────────────────────────────────────────────┘
```

#### 3. **Insights Tab**

**What you'll see:**
- **Deep Analysis** - AI-generated insights from cross-referencing sources
- **Trends** - Emerging patterns identified
- **Contradictions** - Areas where sources disagree
- **Gaps** - What's missing from current research

**Example Insights:**
```
🔍 Trend Identified:
All academic sources from 2024 mention quantum error
correction as the primary challenge, while industry
sources focus on commercialization timelines.

⚠️ Contradiction Found:
Academic estimate (2027-2030) for mainstream adoption
contradicts industry roadmaps (2025-2026). This suggests
potential over-optimism in commercial projections.

📊 Data Point:
3 independent sources confirm $500M+ investment by
top 5 pharmaceutical companies in quantum computing.
```

#### 4. **Recommendations Tab**

**What you'll see:**
- **Actionable Next Steps** - Based on research findings
- **Further Reading** - Related topics to explore
- **Tools & Resources** - Relevant tools or services

**Example Recommendations:**
```
✅ Immediate Actions:
1. Pilot quantum drug discovery project with IBM Quantum
2. Partner with academic institution for expertise
3. Allocate $100K budget for proof-of-concept

📚 Further Research Suggested:
• "Quantum error correction techniques"
• "Classical vs quantum molecular simulation benchmarks"
• "Quantum computing cloud service comparison"

🛠️ Recommended Tools:
• IBM Quantum Experience (free cloud access)
• Qiskit (quantum computing framework)
• PennyLane (quantum ML library)
```

#### 5. **Knowledge Graph Tab** 🌐

**What you'll see:**
- Interactive graph visualization
- **Nodes** - Topics, concepts, sources, authors
- **Edges** - Relationships between nodes
- **3 Layout Options:**
  - Force-directed (default)
  - Hierarchical
  - Circular

**How to Use:**
- **Click nodes** - See details
- **Drag nodes** - Rearrange graph
- **Scroll** - Zoom in/out
- **Switch layouts** - Try different visualizations

**Example Graph:**
```
      [Quantum Computing]
         /    |    \
        /     |     \
   [Drug]  [Medical] [Genomics]
   Discovery Imaging
      |       |        |
   [IBM]   [GE]    [Illumina]
```

---

## Exploring the Knowledge Graph

### What is a Knowledge Graph?

A **knowledge graph** visualizes the relationships between:
- **Topics** - Main subjects
- **Concepts** - Ideas and themes
- **Sources** - Research papers, articles
- **Authors** - Researchers and experts
- **Organizations** - Companies and institutions

### How to Read the Graph

#### Node Types (by color)

- 🔵 **Blue** - Main topic
- 🟢 **Green** - Related concepts
- 🟡 **Yellow** - Sources/papers
- 🟠 **Orange** - Authors
- 🔴 **Red** - Organizations

#### Edge Types (connection lines)

- **Solid line** - Strong relationship
- **Dashed line** - Weak relationship
- **Thick line** - Multiple citations
- **Thin line** - Single citation

### Interactive Features

**Hover over nodes:**
- See node details
- View connection count
- Read descriptions

**Click on nodes:**
- Open source URL (for source nodes)
- See full metadata
- Highlight connected nodes

**Layout switching:**
1. **Force-Directed** - Natural clustering, shows communities
2. **Hierarchical** - Top-down structure, shows hierarchy
3. **Circular** - Equal spacing, shows all connections

### Example Use Cases

**1. Find Related Topics**

Look for **green concept nodes** connected to your main topic. These are related areas to explore.

**2. Identify Key Authors**

**Orange author nodes** with many connections are influential researchers in the field.

**3. Discover Authoritative Sources**

**Large yellow nodes** with many edges are frequently cited sources - likely authoritative.

**4. Spot Research Clusters**

Groups of tightly connected nodes indicate **research communities** or **subtopics**.

---

## Tips for Best Results

### 1. Be Specific with Topics

**Instead of:** "AI"
**Use:** "AI applications in customer service chatbots for e-commerce"

**Instead of:** "Marketing"
**Use:** "Email marketing best practices for SaaS companies in 2024"

### 2. Use the Right Depth

- **Quick:** Simple questions, fact-checking
- **Standard:** Most research needs (⭐ recommended)
- **Deep:** Academic work, strategic decisions

### 3. Add Helpful Descriptions

**Good descriptions:**
- "Focus on practical implementation, not theory"
- "Include cost analysis and ROI data"
- "Compare Python vs JavaScript frameworks"
- "Only sources from 2023-2024"

### 4. Review Source Credibility

- Look for sources with **credibility > 80**
- Check **publication dates** for recency
- Verify **author credentials** for expertise

### 5. Cross-Reference Insights

- Check if multiple sources agree
- Note where sources contradict
- Look for **data-backed claims** (citations)

### 6. Use Knowledge Graph

- Explore **related concepts** for adjacent research
- Follow **author connections** to find experts
- Identify **research gaps** (sparse areas)

### 7. Export and Save

- Download results as **PDF** (coming soon)
- Bookmark important sources
- Share research links with team

---

## Beta Testing Guidelines

### What We're Testing

As a beta tester, you're helping us improve:

1. **Research Quality** - Are results accurate and useful?
2. **User Experience** - Is the interface intuitive?
3. **Performance** - Is it fast enough?
4. **Reliability** - Does it work consistently?

### How to Beta Test Effectively

#### 1. **Try Different Research Types**

Test various topics:
- ✅ Academic research
- ✅ Business/market research
- ✅ Technical documentation
- ✅ Current events
- ✅ How-to guides

#### 2. **Test All Depth Levels**

Run same topic at:
- Quick depth
- Standard depth
- Deep depth

**Compare:** Are deeper results noticeably better?

#### 3. **Verify Source Quality**

For 2-3 sources:
- Click the URL and verify it exists
- Check if description matches content
- Confirm credibility score feels accurate

#### 4. **Test Edge Cases**

Try:
- Very niche topics
- Brand new topics (last month)
- Controversial topics
- Non-English topics
- Technical jargon-heavy topics

#### 5. **Use Multiple Devices**

Test on:
- Desktop (Chrome, Firefox, Safari)
- Mobile (iOS Safari, Android Chrome)
- Tablet

### What to Report

#### Report Bugs For:

- ❌ Research gets stuck (doesn't complete)
- ❌ Sources have broken links
- ❌ UI elements don't work
- ❌ Incorrect or misleading information
- ❌ Slow performance (>20 seconds)
- ❌ Authentication issues

#### Report Feedback For:

- 💡 UI/UX improvements
- 💡 Missing features
- 💡 Confusing workflows
- 💡 Source quality concerns
- 💡 Better ways to present results

---

## Known Limitations

### Beta Version Limitations

We're aware of these limitations (no need to report):

**1. Source Coverage**

- Currently **8 source types** (academic, news, web, social)
- **Social media** requires API keys (may not be configured)
- **Paywalled content** not accessible
- **Non-English sources** limited

**2. Research Speed**

- **Standard depth:** 5-10 seconds (target: 3-5s)
- **Deep depth:** 8-15 seconds (target: 5-8s)
- **Peak times** may be slower

**3. Knowledge Graph**

- Only generated **after research completes**
- **Large graphs** (>100 nodes) may be slow
- Not available for **Quick depth** research

**4. Export Features**

- **PDF export** - Coming soon
- **CSV export** - Coming soon
- **API access** - Beta users only

**5. Collaboration**

- **Sharing** - Currently view-only
- **Team features** - Coming Q1 2025
- **Comments** - Coming Q1 2025

### Technical Requirements

**Minimum Requirements:**
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- JavaScript enabled
- Internet connection: 5 Mbps+
- Screen resolution: 1280x720+

**Not Supported:**
- Internet Explorer
- Opera Mini
- Browsers with ad blockers (may break)

---

## Providing Feedback

We **really** value your feedback! Here's how to share it:

### For Bugs 🐛

**Where:** GitHub Issues
**URL:** https://github.com/mrkingsleyobi/researchhive/issues

**Include:**
1. **What happened** - Describe the bug
2. **What you expected** - What should have happened
3. **Steps to reproduce** - How to recreate the bug
4. **Screenshots** - If applicable
5. **Browser/Device** - What you were using

**Example Bug Report:**
```
Title: Research stuck at 75% progress

Description:
Created a standard depth research on "AI in healthcare".
Progress bar reached 75% then stopped. Waited 5 minutes,
no change. Refreshed page, still stuck.

Expected: Research should complete in 5-10 seconds.

Steps to reproduce:
1. Click "New Research"
2. Enter topic: "AI in healthcare applications"
3. Select depth: "Standard"
4. Click "Start Research"
5. Wait at progress page

Browser: Chrome 119, macOS 14.1
Screenshot: [attached]
```

### For Feature Requests 💡

**Where:** GitHub Discussions
**URL:** https://github.com/mrkingsleyobi/researchhive/discussions

**Include:**
1. **Feature description** - What you want
2. **Use case** - Why you need it
3. **Alternatives** - Current workarounds

**Example Feature Request:**
```
Title: Add ability to save favorite sources

Description:
I want to bookmark/favorite specific sources from
research results so I can find them later across
different research projects.

Use case:
I often find great sources that are relevant to
multiple projects. Currently, I have to manually
copy URLs to a separate note.

Suggested implementation:
- Star icon next to each source
- "Favorites" tab in dashboard
- Ability to tag favorites with categories
```

### For General Feedback 📣

**Where:** Email or Discord
**Email:** feedback@researchhive.com (if available)
**Discord:** [Join our community] (if available)

**Share:**
- What you love ❤️
- What frustrates you 😤
- What confuses you 🤔
- What's missing 🔍

---

## FAQ

### General

**Q: Is ResearchHive free during beta?**
A: Yes! Beta access is completely free. We may introduce paid plans after beta.

**Q: How long is the beta period?**
A: Approximately 2-3 months. Beta testers get lifetime discount.

**Q: Can I use ResearchHive for commercial purposes?**
A: Yes! Use it for work, business, or personal projects.

**Q: Are my research results private?**
A: Yes. Your research is only visible to you (when authenticated).

### Research Questions

**Q: How does ResearchHive ensure source quality?**
A: We use a **credibility scoring algorithm** that considers:
- Domain reputation (academic > news > web)
- Publication type (peer-reviewed > report > blog)
- Recency (newer = better for most topics)
- Author credentials (when available)

Sources below 60/100 credibility are filtered out.

**Q: Can I customize which sources are searched?**
A: Not yet, but coming soon! You'll be able to:
- Exclude specific domains
- Prioritize source types (academic, news, etc.)
- Set date ranges

**Q: How many research can I create?**
A: Beta testers: **Unlimited** ✅
(Post-beta may have tier-based limits)

**Q: Can I re-run old research?**
A: Yes! Click "Re-run" on any completed research to get updated results.

**Q: What languages are supported?**
A: Currently **English only**. Multi-language support coming Q1 2025.

### Technical Questions

**Q: Does ResearchHive store my data?**
A: Yes, we store:
- Your research topics and results
- Account information (email, name)
- Usage analytics

We **do not** store:
- Payment information (no payments during beta)
- Third-party credentials

**Q: Can I delete my research?**
A: Yes! Click the trash icon on any research to delete it permanently.

**Q: Can I export research results?**
A: Coming soon! PDF and CSV export in development.

**Q: Is there an API?**
A: Yes! Beta testers get API access. See [API_REFERENCE.md](API_REFERENCE.md).

**Q: Does ResearchHive work offline?**
A: No, active internet connection required.

### Troubleshooting

**Q: Research is stuck/not completing**
A:
1. Wait 2 minutes (may be processing)
2. Refresh the page
3. If still stuck, click "Re-run"
4. If problem persists, report bug

**Q: Source links are broken**
A: Some sources may be:
- Behind paywalls
- Removed by publisher
- Temporarily down

Try other sources or report if many links are broken.

**Q: Knowledge graph not loading**
A:
1. Check if research is completed
2. Refresh page
3. Try different layout
4. Disable browser extensions (ad blockers)

**Q: "Authentication failed" error**
A:
1. Try logging out and back in
2. Clear browser cache
3. Try different browser
4. Contact support

---

## Getting Help

### Resources

- **Documentation:** https://github.com/mrkingsleyobi/researchhive/tree/main/docs
- **API Reference:** [API_REFERENCE.md](API_REFERENCE.md)
- **FAQ:** This guide, FAQ section above
- **GitHub Issues:** https://github.com/mrkingsleyobi/researchhive/issues

### Contact

- **Bug Reports:** GitHub Issues (see above)
- **Feature Requests:** GitHub Discussions
- **General Questions:** Email or Discord
- **Urgent Issues:** Email with subject "URGENT: [issue]"

### Response Times

- **Critical bugs:** <24 hours
- **Non-critical bugs:** 2-3 days
- **Feature requests:** Acknowledged within 1 week
- **General questions:** 1-2 days

---

## Thank You! 🙏

Thank you for being a ResearchHive beta tester! Your feedback is invaluable in making ResearchHive the best AI research platform.

**Happy Researching! 🚀**

---

**Beta Version:** 1.0.0
**Last Updated:** November 30, 2024
**Questions?** feedback@researchhive.com
