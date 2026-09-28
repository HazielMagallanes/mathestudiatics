/**
 * Formats a result for display: hides binary floating-point noise
 * (0.1 + 0.2 → 0.3), keeps up to 12 significant digits, and switches to
 * scientific notation only for very large or very small magnitudes.
 */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return value > 0 ? '∞' : '-∞'
  }

  if (value === 0) {
    return '0'
  }

  if (Number.isInteger(value) && Math.abs(value) < 1e15) {
    return String(value)
  }

  const rounded = Number(value.toPrecision(12))

  if (rounded === 0) {
    return '0'
  }

  if (Math.abs(rounded) >= 1e15 || Math.abs(rounded) < 1e-9) {
    return rounded
      .toExponential(8)
      .replace(/\.?0+e/, 'e')
      .replace('e+', 'e')
  }

  return String(rounded)
}
