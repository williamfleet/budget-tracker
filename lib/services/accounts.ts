import { createClient } from '@/lib/supabase/server';
import { Account } from '@/lib/types/accounts';

/**
 * Get all accounts for a user
 */
export async function getAccounts(userId: string): Promise<Account[]> {
  const supabase = await createClient();

  const { data: accounts, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });

  if (error) throw error;

  return accounts || [];
}

/**
 * Get account balance including all transactions
 */
export async function getAccountBalance(
  userId: string,
  accountId: string
): Promise<number> {
  const supabase = await createClient();

  // Get all transactions for this account
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('account_id', accountId);

  if (error) throw error;

  // Calculate balance from transactions
  const balance = transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;

  return balance;
}

/**
 * Get balances for all accounts
 */
export async function getAllAccountBalances(
  userId: string
): Promise<Map<string, number>> {
  const supabase = await createClient();

  const accounts = await getAccounts(userId);
  const balanceMap = new Map<string, number>();

  for (const account of accounts) {
    const balance = await getAccountBalance(userId, account.id);
    balanceMap.set(account.id, balance);
  }

  return balanceMap;
}
