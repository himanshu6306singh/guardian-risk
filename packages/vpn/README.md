# guardian-risk-vpn

> **Requires:** [`guardian-risk`](https://www.npmjs.com/package/guardian-risk) (core)

```bash
npm install guardian-risk guardian-risk-vpn
```

VPN, proxy, hosting, and Tor detection for [guardian-risk](https://www.npmjs.com/package/guardian-risk).

## Signals

| Signal | Description |
|--------|-------------|
| `vpn` | VPN exit node detected |
| `proxy` | Public proxy detected |
| `tor` | Tor exit node detected |
| `hosting` | Datacenter / hosting ASN |
| `country` | ISO country code from provider |
| `asn` | Autonomous system number |

## Production usage

```typescript
import { Guardian } from 'guardian-risk';
import { vpnPlugin, StaticIpProvider } from 'guardian-risk-vpn';

// Use your own IP intelligence — MaxMind, IPinfo, etc.
const provider = new StaticIpProvider({
  '203.0.113.10': { vpn: false, proxy: false, tor: false, country: 'US' },
});

const template = new Guardian().use(
  vpnPlugin({
    provider,
    registerDefaultRules: true,
    vpnScore: 20,
  }),
);
```

For development only, `IpApiProvider` is available (HTTPS, 5s timeout) — **not recommended in production**.

## Security notes

- **No external provider by default** — you must supply `provider` for lookups.
- Reads **`clientIp` from guardian signals first** (set by express plugin).
- Only **validated public IPs** are looked up; private/reserved ranges are skipped.
- VPN signals are **hints** — use your own threat intel feed in production.

## API

- `vpnPlugin(options)` — `beforeAnalyze` hook + optional default rules
- `checkIp(ip, guardian, options?)` — manual lookup
- `StaticIpProvider`, `IpApiProvider` — built-in providers

See [SECURITY.md](../../SECURITY.md).
