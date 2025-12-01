import { createClient } from '@/lib/supabase/server';
import { Category, Transaction } from '@/lib/types/budget';

export interface SpendingByCategory {
  category_id: string;
  category_name: string;
  total_spent: number; // in milliunits (negative value)
  transaction_count: number;
}

export interface MonthlyTrend {
  month: string; // YYYY-MM
  income: number; // in milliunits
  expenses: number; // in milliunits (absolute value)
  net: number; // in milliunits
}

export interface IncomeVsExpenses {
  total_income: number; // in milliunits
  total_expenses: number; // in milliunits (absolute value)
  net: number; // in milliunits
}

/**
 * Get spending breakdown by category for a date range
 */
export async function getSpendingByCategory(
  userId: string,
  startDate: string,
  endDate: string
): Promise<SpendingByCategory[]> {
  const supabase = await createClient();

  // Get all transactions in date range
  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .not('category_id', 'is', null) // Only categorized expenses
    .lt('amount', 0); // Only spending (negative amounts)

  if (txError) throw txError;

  // Get all categories
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId);

  if (catError) throw catError;

  // Group by category
  const categoryMap = new Map<string, SpendingByCategory>();

  transactions?.forEach((tx: Transaction) => {
    if (!tx.category_id) return;

    const category = categories?.find((c: Category) => c.id === tx.category_id);
    if (!category) return;

    const existing = categoryMap.get(tx.category_id);
    if (existing) {
      existing.total_spent += tx.amount; // tx.amount is negative
      existing.transaction_count += 1;
    } else {
      categoryMap.set(tx.category_id, {
        category_id: tx.category_id,
        category_name: category.name,
        total_spent: tx.amount,
        transaction_count: 1,
      });
    }
  });

  // Convert to array and sort by total spent (most spending first)
  return Array.from(categoryMap.values()).sort(
    (a, b) => a.total_spent - b.total_spent // More negative = more spending
  );
}

/**
 * Get monthly spending trends for the past N months
 * Can optionally filter by category
 */
export async function getMonthlyTrends(
  userId: string,
  monthsBack: number = 6,
  categoryId?: string
): Promise<MonthlyTrend[]> {
  const supabase = await createClient();

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - monthsBack);

  // Format dates as YYYY-MM-DD
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  // Build query
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDateStr)
    .lte('date', endDateStr);

  // Filter by category if provided
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data: transactions, error } = await query;

  if (error) throw error;

  // Group by month
  const monthMap = new Map<string, MonthlyTrend>();

  transactions?.forEach((tx: Transaction) => {
    const month = tx.date.substring(0, 7); // YYYY-MM

    const existing = monthMap.get(month);
    if (existing) {
      if (tx.amount > 0) {
        existing.income += tx.amount;
      } else {
        existing.expenses += Math.abs(tx.amount);
      }
      existing.net += tx.amount;
    } else {
      monthMap.set(month, {
        month,
        income: tx.amount > 0 ? tx.amount : 0,
        expenses: tx.amount < 0 ? Math.abs(tx.amount) : 0,
        net: tx.amount,
      });
    }
  });

  // Convert to array and sort by month
  return Array.from(monthMap.values()).sort((a, b) =>
    a.month.localeCompare(b.month)
  );
}

/**
 * Get total income vs expenses for a date range
 */
export async function getIncomeVsExpenses(
  userId: string,
  startDate: string,
  endDate: string
): Promise<IncomeVsExpenses> {
  const supabase = await createClient();

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) throw error;

  let total_income = 0;
  let total_expenses = 0;

  transactions?.forEach((tx: Transaction) => {
    if (tx.amount > 0) {
      total_income += tx.amount;
    } else {
      total_expenses += Math.abs(tx.amount);
    }
  });

  return {
    total_income,
    total_expenses,
    net: total_income - total_expenses,
  };
}
