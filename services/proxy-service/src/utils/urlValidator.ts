import logger from './logger';

const BLACKLISTED_DOMAINS = (process.env.BLACKLISTED_DOMAINS || '')
  .split(',')
  .filter(Boolean)
  .map((d) => d.trim().toLowerCase());

// Default blacklist for sensitive domains
const DEFAULT_BLACKLIST = [
  'bankofamerica.com',
  'chase.com',
  'wellsfargo.com',
  'citibank.com',
  'paypal.com',
  'stripe.com',
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
];

const PRIVATE_IP_PATTERNS = [
  /^10\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^192\.168\./,
  /^127\./,
  /^169\.254\./,
  /^::1$/,
  /^fe80:/,
  /^fc00:/,
];

export const isValidUrl = (urlString: string): boolean => {
  try {
    const url = new URL(urlString);

    // Only allow http and https protocols
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      logger.warn(`Invalid protocol: ${url.protocol}`);
      return false;
    }

    return true;
  } catch (error) {
    logger.warn(`Invalid URL format: ${urlString}`);
    return false;
  }
};

export const isBlacklistedDomain = (urlString: string): boolean => {
  try {
    const url = new URL(urlString);
    const hostname = url.hostname.toLowerCase();

    const allBlacklisted = [...DEFAULT_BLACKLIST, ...BLACKLISTED_DOMAINS];

    // Check exact match or subdomain match
    const isBlacklisted = allBlacklisted.some(
      (domain) =>
        hostname === domain || hostname.endsWith(`.${domain}`)
    );

    if (isBlacklisted) {
      logger.warn(`Blacklisted domain detected: ${hostname}`);
    }

    return isBlacklisted;
  } catch (error) {
    return false;
  }
};

export const isPrivateIP = (urlString: string): boolean => {
  try {
    const url = new URL(urlString);
    const hostname = url.hostname;

    // Check if it's a private IP
    const isPrivate = PRIVATE_IP_PATTERNS.some((pattern) =>
      pattern.test(hostname)
    );

    if (isPrivate) {
      logger.warn(`Private IP detected (SSRF prevention): ${hostname}`);
    }

    return isPrivate;
  } catch (error) {
    return false;
  }
};

export const validateProxyUrl = (
  urlString: string
): { valid: boolean; error?: string } => {
  if (!urlString) {
    return { valid: false, error: 'URL is required' };
  }

  if (!isValidUrl(urlString)) {
    return { valid: false, error: 'Invalid URL format. Must be http:// or https://' };
  }

  if (isPrivateIP(urlString)) {
    return { valid: false, error: 'Private IP addresses are not allowed (security restriction)' };
  }

  if (isBlacklistedDomain(urlString)) {
    return {
      valid: false,
      error: 'This domain is blacklisted (banking/payment sites cannot be proxied)',
    };
  }

  return { valid: true };
};

export default {
  isValidUrl,
  isBlacklistedDomain,
  isPrivateIP,
  validateProxyUrl,
};
