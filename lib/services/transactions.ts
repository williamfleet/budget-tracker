import { createClient } from '@/lib/supabase/server';
import { Transaction } from '@/lib/types/budget';

export interface TransactionWithCategory extends Transaction {
  category_name: string | null;
}

export interface GetTransactionsOptions {
  limit?: number;
  offset?: number;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

/**
 * Get all transactions for a user with optional filtering
 */
export async function getTransactions(
  userId: string,
  options: GetTransactionsOptions = {}
): Promise<{ transactions: TransactionWithCategory[]; total: number }> {
  const supabase = await createClient();
  const {
    limit = 50,
    offset = 0,
    categoryId,
    startDate,
    endDate,
    searchQuery,
  } = options;

  // Build query
  let query = supabase
    .from('transactions')
    .select('*, categories(name)', { count: 'exact' })
    .eq('user_id', userId);

  // Apply filters
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  if (startDate) {
    query = query.gte('date', startDate);
  }

  if (endDate) {
    query = query.lte('date', endDate);
  }

  if (searchQuery) {
    query = query.or(
      `payee.ilike.%${searchQuery}%,memo.ilike.%${searchQuery}%`
    );
  }

  // Order by date descending (newest first), then by created_at
  query = query.order('date', { ascending: false }).order('created_at', { ascending: false });

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }

  // Transform data to include category_name
  const transactions: TransactionWithCategory[] = (data || []).map((tx: any) => ({
    id: tx.id,
    user_id: tx.user_id,
    category_id: tx.category_id,
    date: tx.date,
    payee: tx.payee,
    amount: tx.amount,
    memo: tx.memo,
    created_at: tx.created_at,
    category_name: tx.categories?.name || null,
  }));

  return {
    transactions,
    total: count || 0,
  };
}

/**
 * Get a single transaction by ID
 */
export async function getTransaction(
  userId: string,
  transactionId: string
): Promise<TransactionWithCategory | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('transactions')
    .select('*, categories(name)')
    .eq('user_id', userId)
    .eq('id', transactionId)
    .single();

  if (error) {
    console.error('Error fetching transaction:', error);
    return null;
  }

  return {
    id: data.id,
    user_id: data.user_id,
    category_id: data.category_id,
    date: data.date,
    payee: data.payee,
    amount: data.amount,
    memo: data.memo,
    created_at: data.created_at,
    category_name: data.categories?.name || null,
  };
}
