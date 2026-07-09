/**
 * Registration codes are derived from the captain's phone number: same
 * phone -> same code, always. That's what makes "one phone can't captain
 * two teams" enforceable for free by the existing `registration_code`
 * unique constraint - no separate lookup needed.
 *
 * The digits are run through a reversible affine cipher (mod 10^length) so
 * the code doesn't read as a phone number at a glance. This is obfuscation,
 * not encryption - the formula is simple and lives in this file, so anyone
 * with the source can decode any code. Don't rely on it to keep a phone
 * number secret from someone who can read this repo.
 *
 * Uses BigInt(...) calls rather than `123n` literals / the `**` operator,
 * since this project's tsconfig target predates ES2020 for those.
 */

// Coprime with 10 (ends in 9) so it's invertible mod any power of 10,
// regardless of how many digits the phone number has.
const MULT = BigInt(104729);
const OFFSET = BigInt(7418529);
const ZERO = BigInt(0);
const ONE = BigInt(1);
const TEN = BigInt(10);

function pow10(exponent: number): bigint {
  let result = ONE;
  for (let i = 0; i < exponent; i++) result *= TEN;
  return result;
}

function extendedGcd(a: bigint, b: bigint): [bigint, bigint, bigint] {
  if (b === ZERO) return [a, ONE, ZERO];
  const [g, x1, y1] = extendedGcd(b, a % b);
  return [g, y1, x1 - (a / b) * y1];
}

function modInverse(a: bigint, m: bigint): bigint {
  const aMod = ((a % m) + m) % m;
  const [, x] = extendedGcd(aMod, m);
  return ((x % m) + m) % m;
}

/** Strips everything but digits, e.g. "+961 71 414 071" -> "96171414071". */
export function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** digits -> same-length, scrambled-looking digit string. Empty in, empty out. */
export function encodePhoneDigits(digits: string): string {
  if (!digits) return "";
  const mod = pow10(digits.length);
  const n = BigInt(digits);
  const offset = OFFSET % mod;
  const c = (n * MULT + offset) % mod;
  return c.toString().padStart(digits.length, "0");
}

/** Inverse of encodePhoneDigits - recovers the original phone digits. */
export function decodePhoneDigits(code: string): string {
  if (!code) return "";
  const mod = pow10(code.length);
  const c = BigInt(code);
  const offset = OFFSET % mod;
  const inv = modInverse(MULT, mod);
  const diff = (((c - offset) % mod) + mod) % mod;
  const n = (diff * inv) % mod;
  return n.toString().padStart(code.length, "0");
}
