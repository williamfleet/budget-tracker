'use server';

import { createClient } from '@/lib/supabase/server';
import { getMonthlyTrends } from '@/lib/services/reports';

export async function getMonthlyTrendsByCategory(categoryId?: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  return await getMonthlyTrends(user.id, 6, categoryId);
}
