import { createClient } from '@/lib/supabase/server';
import { IncomeSource } from '@/lib/types/income';

/**
 * Get all projected income sources for a user
 *
 * Returns an empty list on error rather than throwing, so the Categories page
 * still renders if migration 010 has not been applied yet.
 */
export async function getIncomeSources(userId: string): Promise<IncomeSource[]> {
  const supabase = await createClient();

  const { data: incomeSources, error } = await supabase
    .from('income_sources')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching income sources:', error);
    return [];
  }

  return incomeSources || [];
}
