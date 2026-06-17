# guardian-risk-vpn

> **Stub package** — API may change before `1.0.0`.

VPN, proxy, and Tor detection for [guardian-risk](https://www.npmjs.com/package/guardian-risk). Resolves client IP and adds network risk signals.

## Planned signals

| Signal | Description |
|--------|-------------|
| `vpn` | VPN exit node detected |
| `proxy` | Public proxy detected |
| `tor` | Tor exit node detected |
| `country` | ISO country code from IP |
| `asn` | Autonomous system number |

## Usage (stub)

```typescript
import { Guardian } from 'guardian-risk';
import { vpnPlugin, checkIp } from 'guardian-risk-vpn';

const guardian = new Guardian().use(
  vpnPlugin({ provider: 'maxmind', vpnScore: 20, registerDefaultRules: true }),
);

await checkIp('203.0.113.10', guardian);
const report = guardian.analyze();
```

## Default rules (optional)

When `registerDefaultRules: true`, the plugin registers:

| Rule | Condition | Default score |
|------|-----------|---------------|
| VpnDetected | `vpn === true` | `vpnScore` (20) |
| ProxyDetected | `proxy === true` | `vpnScore` (20) |
| TorDetected | `tor === true` | `vpnScore + 10` (30) |

## Status

Not yet published. Implementation in progress.
