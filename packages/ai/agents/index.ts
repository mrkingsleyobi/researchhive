/**
 * Research Agents Package
 *
 * Exports all research agents and utilities
 */

export { BaseAgent } from './base-agent';
export type { SearchResult, AgentConfig } from './base-agent';

export { WebScraperAgent } from './web-scraper-agent';
export { AcademicAgent } from './academic-agent';
export { NewsAgent } from './news-agent';
export { SocialAgent } from './social-agent';

export { CredibilityScorer } from './credibility-scorer';
export type { CredibilityFactors, ScoredResult } from './credibility-scorer';

export { DuplicateDetector } from './duplicate-detector';
