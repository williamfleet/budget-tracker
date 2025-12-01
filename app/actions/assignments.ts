'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { dollarsToMilliunits } from '@/lib/utils/money';
import { getCurrentMonth } from '@/lib/utils/date';

export interface UpdateAssignmentInput {
  category_id: string;
  amount: string; // Dollar amount as string (e.g., "100.00")
  month?: string; // Optional month (e.g., "2025-11-01"), defaults to current month
}

export async function updateAssignment(input: UpdateAssignmentInput) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // Convert dollar amount to milliunits
  const amountInDollars = parseFloat(input.amount);
  if (isNaN(amountInDollars) || amountInDollars < 0) {
    throw new Error('Invalid amount');
  }

  const milliunits = dollarsToMilliunits(amountInDollars);
  const targetMonth = input.month || getCurrentMonth();

  // Upsert the monthly assignment (insert or update)
  const { data, error } = await supabase
    .from('monthly_assignments')
    .upsert(
      {
        user_id: user.id,
        category_id: input.category_id,
        month: targetMonth,
        assigned_amount: milliunits,
      },
      {
        onConflict: 'user_id,category_id,month',
      }
    )
    .select()
    .single();

  if (error) {
    console.error('Error updating assignment:', error);
    throw new Error('Failed to update assignment');
  }

  // Revalidate the home page to refresh the budget data
  revalidatePath('/');

  return data;
}
