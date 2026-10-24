/**
 * Deterministic JSON Canonicalization Scheme (RFC 8785 compliant)
 * Shared client utility for TamperLab and cryptographic verification.
 */

export function canonicalize(obj: any, seen = new WeakSet()): string {
  if (obj === null) {
    return 'null';
  }

  if (obj === undefined || typeof obj === 'function' || typeof obj === 'symbol') {
    return 'null';
  }

  if (typeof obj === 'boolean') {
    return obj ? 'true' : 'false';
  }

  if (typeof obj === 'number') {
    if (!Number.isFinite(obj)) {
      throw new Error('RFC 8785 Canonicalization Error: NaN and Infinity are not valid JSON numbers.');
    }
    if (Object.is(obj, -0)) {
      return '0';
    }
    return JSON.stringify(obj);
  }

  if (typeof obj === 'string') {
    return JSON.stringify(obj);
  }

  if (obj instanceof Date) {
    return JSON.stringify(obj.toISOString());
  }

  if (Array.isArray(obj)) {
    if (seen.has(obj)) {
      throw new Error('RFC 8785 Canonicalization Error: Circular array reference detected.');
    }
    seen.add(obj);

    const elements = obj.map((item) => {
      if (item === undefined || typeof item === 'function' || typeof item === 'symbol') {
        return 'null';
      }
      return canonicalize(item, seen);
    });

    seen.delete(obj);
    return '[' + elements.join(',') + ']';
  }

  if (typeof obj === 'object') {
    if (seen.has(obj)) {
      throw new Error('RFC 8785 Canonicalization Error: Circular object reference detected.');
    }
    seen.add(obj);

    const sortedKeys = Object.keys(obj).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    const pairs: string[] = [];

    for (const key of sortedKeys) {
      const val = obj[key];
      if (val === undefined || typeof val === 'function' || typeof val === 'symbol') {
        continue;
      }
      pairs.push(`${JSON.stringify(key)}:${canonicalize(val, seen)}`);
    }

    seen.delete(obj);
    return '{' + pairs.join(',') + '}';
  }

  return JSON.stringify(obj);
}
