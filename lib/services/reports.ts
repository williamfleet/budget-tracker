import { createClient } from '@/lib/supabase/server';
import { fetchAllRows } from '@/lib/supabase/fetch-all';
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
  const transactions = await fetchAllRows<Transaction>(() =>
    supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .not('category_id', 'is', null) // Only categorized expenses
      .lt('amount', 0) // Only spending (negative amounts)
  );

  // Get transaction splits in date range (for split transactions)
  const splits = await fetchAllRows<any>(() =>
    supabase
      .from('transaction_splits')
      .select('*, transactions!inner(date)')
      .eq('user_id', userId)
      .gte('transactions.date', startDate)
      .lte('transactions.date', endDate)
  );

  // Collect parent transaction IDs that have splits to avoid double-counting
  const splitParentIds = new Set(
    splits?.map((s: any) => s.transaction_id) ?? []
  );

  // Get all categories
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId);

  if (catError) throw catError;

  // Group by category
  const categoryMap = new Map<string, SpendingByCategory>();

  const addToCategory = (categoryId: string, amount: number) => {
    const category = categories?.find((c: Category) => c.id === categoryId);
    if (!category) return;

    const existing = categoryMap.get(categoryId);
    if (existing) {
      existing.total_spent += amount;
      existing.transaction_count += 1;
    } else {
      categoryMap.set(categoryId, {
        category_id: categoryId,
        category_name: category.name,
        total_spent: amount,
        transaction_count: 1,
      });
    }
  };

  // Add non-split transactions
  transactions?.forEach((tx: Transaction) => {
    if (!tx.category_id || splitParentIds.has(tx.id)) return;
    addToCategory(tx.category_id, tx.amount);
  });

  // Add split transaction amounts
  splits?.forEach((split: any) => {
    if (split.amount < 0) {
      addToCategory(split.category_id, split.amount);
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

  const transactions = await fetchAllRows<Transaction>(() => {
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

    return query;
  });

  // If filtering by category, also fetch matching splits
  let splits: any[] = [];
  let splitParentIds = new Set<string>();
  if (categoryId) {
    splits = await fetchAllRows<any>(() =>
      supabase
        .from('transaction_splits')
        .select('*, transactions!inner(date)')
        .eq('user_id', userId)
        .eq('category_id', categoryId)
        .gte('transactions.date', startDateStr)
        .lte('transactions.date', endDateStr)
    );
    splitParentIds = new Set(splits.map((s: any) => s.transaction_id));
  }

  // Group by month
  const monthMap = new Map<string, MonthlyTrend>();

  const addToMonth = (month: string, amount: number) => {
    const existing = monthMap.get(month);
    if (existing) {
      if (amount > 0) {
        existing.income += amount;
      } else {
        existing.expenses += Math.abs(amount);
      }
      existing.net += amount;
    } else {
      monthMap.set(month, {
        month,
        income: amount > 0 ? amount : 0,
        expenses: amount < 0 ? Math.abs(amount) : 0,
        net: amount,
      });
    }
  };

  transactions?.forEach((tx: Transaction) => {
    // Skip parent transactions that have splits (when filtering by category)
    if (splitParentIds.has(tx.id)) return;
    addToMonth(tx.date.substring(0, 7), tx.amount);
  });

  // Add split amounts
  splits.forEach((split: any) => {
    const month = split.transactions.date.substring(0, 7);
    addToMonth(month, split.amount);
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

  const transactions = await fetchAllRows<Transaction>(() =>
    supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
  );

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
