/**
 * Convert milliunits to dollars
 * Example: 10500 milliunits = $10.50
 */
export function milliunitsToDollars(milliunits: number): number {
  return milliunits / 1000;
}

/**
 * Convert dollars to milliunits
 * Example: $10.50 = 10500 milliunits
 */
export function dollarsToMilliunits(dollars: number): number {
  return Math.round(dollars * 1000);
}

/**
 * Format milliunits as currency string
 * Example: 10500 milliunits = "$10.50"
 */
export function formatCurrency(milliunits: number): string {
  const dollars = milliunitsToDollars(milliunits);
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(dollars);
}

/**
 * Format milliunits as currency with color coding
 * Positive = green, Negative = red, Zero = gray
 */
export function formatCurrencyWithColor(milliunits: number): {
  formatted: string;
  color: 'text-green-600' | 'text-red-600' | 'text-gray-600';
} {
  const formatted = formatCurrency(Math.abs(milliunits));

  if (milliunits > 0) {
    return { formatted, color: 'text-green-600' };
  } else if (milliunits < 0) {
    return { formatted: `-${formatted}`, color: 'text-red-600' };
  } else {
    return { formatted, color: 'text-gray-600' };
  }
}

/**
 * Parse a dollar string to milliunits
 * Examples: "$10.50" -> 10500, "10.50" -> 10500, "10" -> 10000
 */
export function parseDollarString(str: string): number {
  if (!str || str.trim() === '') return 0;

  // Remove $, commas, and whitespace
  const cleaned = str.replace(/[$,\s]/g, '');
  const amount = parseFloat(cleaned);

  return isNaN(amount) ? 0 : dollarsToMilliunits(amount);
}
