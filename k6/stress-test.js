/**
 * K6 Stress Testing Script
 * Tests system behavior under extreme load
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 100 },   // Stay at 100 users
    { duration: '2m', target: 200 },   // Ramp up to 200 users
    { duration: '5m', target: 200 },   // Stay at 200 users
    { duration: '2m', target: 500 },   // Stress test: 500 users
    { duration: '5m', target: 500 },   // Stay at 500 users
    { duration: '2m', target: 1000 },  // Extreme: 1000 users
    { duration: '5m', target: 1000 },  // Stay at 1000 users
    { duration: '5m', target: 0 },     // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(99)<3000'], // 99% under 3s (relaxed for stress test)
    http_req_failed: ['rate<0.05'], // Error rate < 5%
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:4000';

export default function () {
  const res = http.get(`${BASE_URL}/health`);

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
