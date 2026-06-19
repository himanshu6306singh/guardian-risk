import { isPrivateIp, parseIpAddress } from 'guardian-risk';

/** IP intelligence result used for VPN/proxy/Tor signals. */
export interface IpIntelligence {
  readonly vpn: boolean;
  readonly proxy: boolean;
  readonly tor: boolean;
  readonly country: string;
  readonly hosting: boolean;
}

/** Pluggable IP lookup for VPN detection. */
export interface IpProvider {
  lookup(ip: string): Promise<IpIntelligence>;
}

export interface IpApiProviderOptions {
  readonly timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 5_000;
const LOOKUP_URL = 'https://ip-api.com/json';

/**
 * ip-api.com provider (rate-limited). For production use MaxMind or IPinfo.
 */
export class IpApiProvider implements IpProvider {
  constructor(private readonly options: IpApiProviderOptions = {}) {}

  async lookup(ip: string): Promise<IpIntelligence> {
    const parsed = parseIpAddress(ip);
    if (!parsed || isPrivateIp(parsed)) {
      return localResult();
    }

    const controller = new AbortController();
    const timeoutMs = this.options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(
        `${LOOKUP_URL}/${encodeURIComponent(parsed)}?fields=status,country,proxy,hosting`,
        { signal: controller.signal },
      );

      if (!response.ok) {
        throw new Error(`IP lookup failed with status ${response.status}`);
      }

      const data = (await response.json()) as {
        status?: string;
        country?: string;
        proxy?: boolean;
        hosting?: boolean;
      };

      if (data.status !== 'success') {
        return unknownResult();
      }

      return {
        vpn: false,
        proxy: data.proxy === true,
        tor: false,
        country: data.country ?? 'unknown',
        hosting: data.hosting === true,
      };
    } finally {
      clearTimeout(timer);
    }
  }
}

/** Static provider for tests and offline use. */
export class StaticIpProvider implements IpProvider {
  constructor(private readonly results: Readonly<Record<string, IpIntelligence>>) {}

  async lookup(ip: string): Promise<IpIntelligence> {
    const parsed = parseIpAddress(ip);
    if (!parsed) {
      return unknownResult();
    }
    return this.results[parsed] ?? unknownResult();
  }
}

function localResult(): IpIntelligence {
  return { vpn: false, proxy: false, tor: false, country: 'local', hosting: false };
}

function unknownResult(): IpIntelligence {
  return { vpn: false, proxy: false, tor: false, country: 'unknown', hosting: false };
}
