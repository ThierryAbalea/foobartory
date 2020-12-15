/**
 * Generate a random number between two values, both inclusives.
 */
export function getRandomIntInclusive(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Returns a random boolean from a Bernoulli distribution with success probability p.
 *
 * @link https://mathworld.wolfram.com/BernoulliDistribution.html
 *
 * @param p the probability of returning true
 * @return true with probability p and false with probability 1 - p.
 * @throws Error unless 0 <= p <= 1
 */
export function bernoulli(p: number): boolean {
  if (!(p >= 0 && p <= 1)) {
    throw new Error("Probability p must be between 0 and 1 (both inclusives)");
  }
  return Math.random() < p;
}
