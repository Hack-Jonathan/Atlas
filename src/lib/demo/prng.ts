/**
 * Deterministic pseudo-random numbers for the demo history, so the generated
 * seed file is byte-identical on every run (no Math.random anywhere).
 */

/** mulberry32: small, fast, good-enough 32-bit PRNG. Returns floats in [0, 1). */
export function createPrng(seed: number) {
  let state = seed >>> 0;
  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    /** Normally distributed value, clamped to ±`clampSd` standard deviations. */
    normal(mean: number, sd: number, clampSd = 1.5): number {
      const u = Math.max(next(), 1e-12);
      const v = next();
      const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
      return mean + sd * Math.max(-clampSd, Math.min(clampSd, z));
    },
    /** Random UUID v4 built from the PRNG (deterministic). */
    uuid(): string {
      const hex = Array.from({ length: 32 }, () => Math.floor(next() * 16).toString(16));
      hex[12] = "4";
      hex[16] = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
      const h = hex.join("");
      return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
    },
  };
}

export type Prng = ReturnType<typeof createPrng>;
