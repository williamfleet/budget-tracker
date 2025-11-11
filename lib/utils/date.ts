/**
 * Get the first day of the current month as a string
 * Returns: 'YYYY-MM-01'
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}

/**
 * Get the first day of a specific month as a string
 * Returns: 'YYYY-MM-01'
 */
export function getMonthString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}

/**
 * Get the first and last day of a month
 * Returns: { start: 'YYYY-MM-01', end: 'YYYY-MM-31' }
 */
export function getMonthRange(monthString: string): {
  start: string;
  end: string;
} {
  const date = new Date(monthString);
  const year = date.getFullYear();
  const month = date.getMonth();

  // First day of month
  const start = monthString;

  // Last day of month
  const lastDay = new Date(year, month + 1, 0).getDate();
  const monthNum = String(month + 1).padStart(2, '0');
  const end = `${year}-${monthNum}-${lastDay}`;

  return { start, end };
}

/**
 * Format a month string for display
 * Example: '2025-11-01' -> 'November 2025'
 */
export function formatMonth(monthString: string): string {
  const date = new Date(monthString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });
}

/**
 * Check if a date is in a specific month
 */
export function isDateInMonth(dateString: string, monthString: string): boolean {
  const date = new Date(dateString);
  const month = new Date(monthString);

  return (
    date.getFullYear() === month.getFullYear() &&
    date.getMonth() === month.getMonth()
  );
}
