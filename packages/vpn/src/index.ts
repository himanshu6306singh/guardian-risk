import type { Plugin } from 'guardian-risk';
import { isPrivateIp, parseIpAddress } from 'guardian-risk';
import {
  IpApiProvider,
  StaticIpProvider,
  type IpIntelligence,
  type IpProvider,
} from './providers.js';

/** Options for the VPN plugin. */
export interface VpnPluginOptions {
  /** Required for production. Defaults to empty static provider (no external calls). */
  readonly provider?: IpProvider;
  readonly vpnScore?: number;
  readonly registerDefaultRules?: boolean;
}

const EMPTY_PROVIDER = new StaticIpProvider({});

/**
 * VPN / proxy detection plugin for guardian-risk.
 */
export function vpnPlugin(options: VpnPluginOptions = {}): Plugin {
  const {
    provider = EMPTY_PROVIDER,
    vpnScore = 20,
    registerDefaultRules = true,
  } = options;

  return {
    name: 'guardian-risk-vpn',
    install(guardian) {
      if (registerDefaultRules) {
        registerVpnRules(guardian, vpnScore);
      }

      guardian.beforeAnalyze(async ({ data, guardian: g }) => {
        const ip = resolveIpForLookup(g, data);
        if (!ip) {
          return;
        }
        await applyIpSignals(ip, g, provider);
      });
    },
  };
}

export interface IpContext {
  readonly clientIp: string;
}

export async function checkIp(
  ip: string,
  guardian: import('guardian-risk').Guardian,
  provider: IpProvider = EMPTY_PROVIDER,
): Promise<import('guardian-risk').Guardian> {
  const parsed = parseIpAddress(ip);
  if (!parsed) {
    throw new TypeError('Invalid IP address');
  }
  await applyIpSignals(parsed, guardian, provider);
  return guardian;
}

function registerVpnRules(
  guardian: import('guardian-risk').Guardian,
  vpnScore: number,
): void {
  guardian
    .rule({
      name: 'VpnDetected',
      reason: 'Connection appears to use a VPN or datacenter',
      when: (s) => s.vpn === true || s.hosting === true,
      score: vpnScore,
    })
    .rule({
      name: 'ProxyDetected',
      reason: 'Connection appears to use a proxy',
      when: (s) => s.proxy === true,
      score: vpnScore,
    })
    .rule({
      name: 'TorDetected',
      reason: 'Connection appears to use Tor',
      when: (s) => s.tor === true,
      score: vpnScore + 10,
    });
}

async function applyIpSignals(
  ip: string,
  guardian: import('guardian-risk').Guardian,
  provider: IpProvider,
): Promise<void> {
  const intel = isPrivateIp(ip) ? localIntel() : await provider.lookup(ip);

  guardian
    .signal('clientIp', ip)
    .signal('vpn', intel.vpn)
    .signal('proxy', intel.proxy)
    .signal('tor', intel.tor)
    .signal('country', intel.country)
    .signal('hosting', intel.hosting)
    .signal('signalSource', 'vpn');
}

function localIntel(): IpIntelligence {
  return { vpn: false, proxy: false, tor: false, country: 'local', hosting: false };
}

function resolveIpForLookup(
  guardian: import('guardian-risk').Guardian,
  data: unknown,
): string | null {
  const fromSignal = guardian.getSignal('clientIp');
  if (typeof fromSignal === 'string') {
    const parsed = parseIpAddress(fromSignal);
    if (parsed) {
      return parsed;
    }
  }

  if (data !== null && typeof data === 'object' && 'clientIp' in data) {
    const ip = (data as IpContext).clientIp;
    const parsed = typeof ip === 'string' ? parseIpAddress(ip) : null;
    if (parsed) {
      return parsed;
    }
  }

  if (data !== null && typeof data === 'object' && 'headers' in data) {
    const req = data as {
      ip?: string;
      ips?: readonly string[];
      socket?: { remoteAddress?: string };
    };

    if (req.ips) {
      for (const candidate of req.ips) {
        const parsed = parseIpAddress(candidate);
        if (parsed) {
          return parsed;
        }
      }
    }

    if (req.ip) {
      const parsed = parseIpAddress(req.ip);
      if (parsed) {
        return parsed;
      }
    }

    if (req.socket?.remoteAddress) {
      return parseIpAddress(req.socket.remoteAddress);
    }
  }

  if (typeof data === 'string') {
    return parseIpAddress(data);
  }

  return null;
}

export {
  IpApiProvider,
  StaticIpProvider,
  type IpIntelligence,
  type IpProvider,
};
