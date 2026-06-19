import { describe, it, expect } from 'vitest';
import { Guardian } from 'guardian-risk';
import { fromRequest, expressPlugin } from './index.js';

describe('fromRequest', () => {
  it('extracts HTTP signals from a request-like object', () => {
    const guardian = new Guardian();
    const req = {
      ip: '203.0.113.10',
      method: 'POST',
      path: '/api/login',
      headers: {
        'user-agent': 'Mozilla/5.0',
        'content-length': '42',
        'accept-language': 'en-US',
      },
    };

    fromRequest(req, guardian);
    guardian.rule({
      name: 'PostLogin',
      when: (s) => s.requestMethod === 'POST' && s.requestPath === '/api/login',
      score: 5,
    });

    expect(guardian.analyze().score).toBe(5);
  });

  it('uses x-forwarded-for when trustProxy is enabled', async () => {
    const template = new Guardian().use(expressPlugin({ trustProxy: true })).rule({
      name: 'CheckIp',
      when: (s) => s.clientIp === '198.51.100.1',
      score: 10,
    });

    const req = {
      ip: '10.0.0.1',
      method: 'GET',
      path: '/',
      headers: { 'x-forwarded-for': '198.51.100.1, 10.0.0.1' },
    };

    const report = await template.fork().analyzeAsync(req);
    expect(report.score).toBe(10);
  });
});
