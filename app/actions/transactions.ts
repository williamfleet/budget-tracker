'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { dollarsToMilliunits } from '@/lib/utils/money';

export interface CreateTransactionInput {
  type: 'expense' | 'income';
  amount: string; // Dollar amount as string (e.g., "10.50")
  date: string; // ISO date string (e.g., "2025-11-11")
  payee: string | null;
  category_id: string | null;
  memo: string | null;
}

export async function createTransaction(input: CreateTransactionInput) {
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
  if (isNaN(amountInDollars) || amountInDollars <= 0) {
    throw new Error('Invalid amount');
  }

  const milliunits = dollarsToMilliunits(amountInDollars);

  // For expenses: amount is negative
  // For income: amount is positive
  const amount = input.type === 'expense' ? -milliunits : milliunits;

  // Validate category for expenses
  if (input.type === 'expense' && !input.category_id) {
    throw new Error('Category is required for expenses');
  }

  // Insert transaction
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      category_id: input.category_id,
      date: input.date,
      payee: input.payee || null,
      amount: amount,
      memo: input.memo || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating transaction:', error);
    throw new Error('Failed to create transaction');
  }

  // Revalidate the home page to refresh the budget data
  revalidatePath('/');

  return data;
}
