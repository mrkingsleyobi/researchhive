/**
 * K6 Spike Testing Script
 * Tests system behavior under sudden traffic spikes
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 10 },    // Normal load
    { duration: '1m', target: 1000 },   // SPIKE! 1000 users
    { duration: '3m', target: 1000 },   // Sustain spike
    { duration: '10s', target: 10 },    // Return to normal
    { duration: '3m', target: 10 },     // Recovery
  ],
};

const BASE_URL = __ENV.API_URL || 'http://localhost:4000';

export default function () {
  const res = http.get(`${BASE_URL}/health`);

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(0.5);
}
