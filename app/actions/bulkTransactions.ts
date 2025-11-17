'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface BulkUpdateTransactionsInput {
  transactionIds: string[];
  updates: {
    category_id?: string | null;
    payee?: string | null;
    memo?: string | null;
    date?: string | null;
  };
}

export async function bulkUpdateTransactions(input: BulkUpdateTransactionsInput) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  if (input.transactionIds.length === 0) {
    throw new Error('No transactions selected');
  }

  // Build the update object with only the fields that are provided
  const updates: Record<string, string | null> = {};
  if (input.updates.category_id !== undefined) {
    updates.category_id = input.updates.category_id;
  }
  if (input.updates.payee !== undefined) {
    updates.payee = input.updates.payee;
  }
  if (input.updates.memo !== undefined) {
    updates.memo = input.updates.memo;
  }
  if (input.updates.date !== undefined) {
    updates.date = input.updates.date;
  }

  if (Object.keys(updates).length === 0) {
    throw new Error('No updates provided');
  }

  // Update transactions
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .in('id', input.transactionIds)
    .eq('user_id', user.id) // Ensure user owns these transactions
    .select();

  if (error) {
    console.error('Error updating transactions:', error);
    throw new Error('Failed to update transactions');
  }

  // Revalidate pages
  revalidatePath('/');
  revalidatePath('/transactions');

  return { updated: data.length };
}

export async function bulkDeleteTransactions(transactionIds: string[]) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  if (transactionIds.length === 0) {
    throw new Error('No transactions selected');
  }

  // Delete transactions
  const { error } = await supabase
    .from('transactions')
    .delete()
    .in('id', transactionIds)
    .eq('user_id', user.id); // Ensure user owns these transactions

  if (error) {
    console.error('Error deleting transactions:', error);
    throw new Error('Failed to delete transactions');
  }

  // Revalidate pages
  revalidatePath('/');
  revalidatePath('/transactions');

  return { deleted: transactionIds.length };
}
