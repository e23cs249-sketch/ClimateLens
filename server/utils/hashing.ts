import crypto from 'crypto';
import { canonicalize } from './canonicalize.ts';

/**
 * Calculates SHA-256 hash of a canonicalized JSON object or raw string.
 * Returns lowercase hex digest.
 */
export function calculateSha256(data: any): { hash: string; canonicalPayload: string } {
  const canonicalPayload = typeof data === 'string' ? data : canonicalize(data);
  const hash = crypto.createHash('sha256').update(canonicalPayload, 'utf8').digest('hex');
  return { hash, canonicalPayload };
}

/**
 * Verifies if recalculating SHA-256 matches the registered hash.
 */
export function verifySha256(canonicalPayload: string, expectedHash: string): boolean {
  const recalculated = crypto.createHash('sha256').update(canonicalPayload, 'utf8').digest('hex');
  return recalculated.toLowerCase() === expectedHash.toLowerCase();
}
