import { isIP } from 'node:net';
import {
  MAX_SESSION_ID_LENGTH,
  SESSION_ID_PATTERN,
} from '../constants/security.js';

/**
 * Parse and validate an IP address (v4 or v6). Returns null if invalid.
 */
export function parseIpAddress(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 45) {
    return null;
  }
  return isIP(trimmed) === 0 ? null : trimmed;
}

/**
 * Whether an IP is private, loopback, link-local, or CGNAT (skip external lookup).
 */
export function isPrivateIp(ip: string): boolean {
  const parsed = parseIpAddress(ip);
  if (!parsed) {
    return true;
  }

  if (isIP(parsed) === 4) {
    if (
      parsed.startsWith('10.') ||
      parsed.startsWith('127.') ||
      parsed.startsWith('192.168.') ||
      parsed.startsWith('169.254.') ||
      parsed.startsWith('0.')
    ) {
      return true;
    }
    if (parsed.startsWith('172.')) {
      const second = Number(parsed.split('.')[1]);
      if (second >= 16 && second <= 31) {
        return true;
      }
    }
    if (parsed.startsWith('100.')) {
      const second = Number(parsed.split('.')[1]);
      if (second >= 64 && second <= 127) {
        return true;
      }
    }
    return false;
  }

  const lower = parsed.toLowerCase();
  return (
    lower === '::1' ||
    lower.startsWith('fc') ||
    lower.startsWith('fd') ||
    lower.startsWith('fe80')
  );
}

/**
 * Validate a session identifier (length + charset).
 */
export function sanitizeSessionId(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_SESSION_ID_LENGTH) {
    return null;
  }
  if (!SESSION_ID_PATTERN.test(trimmed)) {
    return null;
  }
  return trimmed;
}
