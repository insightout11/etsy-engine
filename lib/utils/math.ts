/**
 * Compute the p-th percentile of a numeric array using linear interpolation.
 * @param sorted - sorted array (ascending)
 * @param p - percentile in range [0, 100]
 */
export function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];

  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const fraction = index - lower;

  if (lower === upper) return sorted[lower];
  return sorted[lower] * (1 - fraction) + sorted[upper] * fraction;
}

export function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  return percentile(sorted, 50);
}

export function mean(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}

/**
 * Return the most frequently occurring value in an array.
 */
export function mode(nums: number[]): number {
  if (nums.length === 0) return 0;
  const freq = new Map<number, number>();
  for (const n of nums) {
    freq.set(n, (freq.get(n) ?? 0) + 1);
  }
  let maxCount = 0;
  let modeVal = nums[0];
  Array.from(freq.entries()).forEach(([val, count]) => {
    if (count > maxCount) {
      maxCount = count;
      modeVal = val;
    }
  });
  return modeVal;
}

/**
 * Round to a given number of decimal places.
 */
export function round(n: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(n * factor) / factor;
}
