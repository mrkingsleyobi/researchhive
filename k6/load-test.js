/**
 * K6 Load Testing Script
 * Tests API performance under various load conditions
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend, Rate } from 'k6/metrics';

// Custom metrics
const researchCreated = new Counter('research_created');
const researchDuration = new Trend('research_duration');
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Warm-up: 10 users
    { duration: '1m', target: 50 },    // Ramp-up: 50 users
    { duration: '3m', target: 100 },   // Normal load: 100 users
    { duration: '2m', target: 200 },   // Peak load: 200 users
    { duration: '1m', target: 50 },    // Ramp-down: 50 users
    { duration: '30s', target: 0 },    // Cool-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% < 500ms, 99% < 1s
    http_req_failed: ['rate<0.01'], // Error rate < 1%
    checks: ['rate>0.95'], // 95% of checks should pass
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:4000';

/**
 * Test scenario
 */
export default function () {
  const scenarios = [
    testHealthEndpoint,
    testResearchCreation,
    testResearchProgress,
    testCitationGeneration,
  ];

  // Randomly select a scenario
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  scenario();

  sleep(1);
}

/**
 * Test health endpoint
 */
function testHealthEndpoint() {
  const res = http.get(`${BASE_URL}/health`);

  check(res, {
    'health status 200': (r) => r.status === 200,
    'health returns OK': (r) => JSON.parse(r.body).status === 'ok',
    'response time < 100ms': (r) => r.timings.duration < 100,
  });

  errorRate.add(res.status !== 200);
}

/**
 * Test research creation
 */
function testResearchCreation() {
  const payload = JSON.stringify({
    topic: `Load test research ${Date.now()}`,
    depth: 'quick',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const startTime = Date.now();
  const res = http.post(`${BASE_URL}/trpc/research.create`, payload, params);
  const duration = Date.now() - startTime;

  const success = check(res, {
    'research created (200)': (r) => r.status === 200,
    'response has researchId': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.result?.data?.id !== undefined;
      } catch {
        return false;
      }
    },
  });

  if (success) {
    researchCreated.add(1);
    researchDuration.add(duration);
  }

  errorRate.add(!success);
}

/**
 * Test research progress endpoint
 */
function testResearchProgress() {
  const researchId = 'test-research-id'; // Would be dynamic in real scenario

  const res = http.get(`${BASE_URL}/trpc/research.getProgress?input="${researchId}"`);

  check(res, {
    'progress status 200': (r) => r.status === 200,
    'progress has status': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.result?.data?.status !== undefined;
      } catch {
        return false;
      }
    },
  });

  errorRate.add(res.status !== 200);
}

/**
 * Test citation generation
 */
function testCitationGeneration() {
  const payload = JSON.stringify({
    citation: {
      title: 'Test Paper',
      authors: ['John Doe'],
      year: 2024,
      source: 'web',
      url: 'https://example.com',
    },
    style: 'apa',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(`${BASE_URL}/trpc/citation.format`, payload, params);

  check(res, {
    'citation status 200': (r) => r.status === 200,
    'citation formatted': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.result?.data?.formatted !== undefined;
      } catch {
        return false;
      }
    },
  });

  errorRate.add(res.status !== 200);
}

/**
 * Setup function (runs once per VU)
 */
export function setup() {
  console.log('Starting load test...');
  console.log(`Base URL: ${BASE_URL}`);
  return { timestamp: Date.now() };
}

/**
 * Teardown function (runs once after test)
 */
export function teardown(data) {
  const duration = (Date.now() - data.timestamp) / 1000;
  console.log(`Load test completed in ${duration}s`);
}
