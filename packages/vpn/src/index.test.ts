import { describe, it, expect } from 'vitest';
import { Guardian } from 'guardian-risk';
import { checkIp, StaticIpProvider } from './index.js';

describe('checkIp', () => {
  it('adds VPN signals from a static provider', async () => {
    const provider = new StaticIpProvider({
      '203.0.113.50': {
        vpn: true,
        proxy: false,
        tor: false,
        country: 'US',
        hosting: true,
      },
    });

    const guardian = new Guardian().rule({
      name: 'Vpn',
      when: (s) => s.vpn === true,
      score: 20,
    });

    await checkIp('203.0.113.50', guardian, provider);
    const report = guardian.analyze();
    expect(report.score).toBe(20);
  });
});
