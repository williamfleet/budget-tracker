'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { dollarsToMilliunits } from '@/lib/utils/money';
import { AccountType } from '@/lib/types/accounts';

interface CreateAccountInput {
  name: string;
  type: AccountType;
  initial_balance: string; // in dollars
  notes?: string;
}

interface UpdateAccountInput {
  id: string;
  name: string;
  type: AccountType;
  notes?: string;
}

interface TransferInput {
  from_account_id: string;
  to_account_id: string;
  amount: string; // in dollars
  date: string;
  memo?: string;
}

export async function createAccount(input: CreateAccountInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const balanceInMilliunits = dollarsToMilliunits(parseFloat(input.initial_balance));

  const { error } = await supabase.from('accounts').insert({
    user_id: user.id,
    name: input.name,
    type: input.type,
    balance: balanceInMilliunits,
    notes: input.notes || null,
  });

  if (error) {
    console.error('Error creating account:', error);
    throw new Error('Failed to create account');
  }

  revalidatePath('/accounts');
  revalidatePath('/transactions');
}

export async function updateAccount(input: UpdateAccountInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('accounts')
    .update({
      name: input.name,
      type: input.type,
      notes: input.notes || null,
    })
    .eq('id', input.id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error updating account:', error);
    throw new Error('Failed to update account');
  }

  revalidatePath('/accounts');
  revalidatePath('/transactions');
}

export async function deleteAccount(accountId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Check if account has transactions
  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select('id')
    .eq('account_id', accountId)
    .limit(1);

  if (txError) {
    console.error('Error checking transactions:', txError);
    throw new Error('Failed to check account transactions');
  }

  if (transactions && transactions.length > 0) {
    throw new Error('Cannot delete account with existing transactions');
  }

  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', accountId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting account:', error);
    throw new Error('Failed to delete account');
  }

  revalidatePath('/accounts');
  revalidatePath('/transactions');
}

export async function createTransfer(input: TransferInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const amountInMilliunits = dollarsToMilliunits(parseFloat(input.amount));

  // Create two transactions: one negative (from) and one positive (to)
  const transactions = [
    {
      user_id: user.id,
      account_id: input.from_account_id,
      category_id: null, // Transfers don't have categories
      date: input.date,
      payee: 'Transfer',
      amount: -amountInMilliunits, // Negative for outgoing
      memo: input.memo ? `Transfer to account: ${input.memo}` : 'Transfer',
    },
    {
      user_id: user.id,
      account_id: input.to_account_id,
      category_id: null,
      date: input.date,
      payee: 'Transfer',
      amount: amountInMilliunits, // Positive for incoming
      memo: input.memo ? `Transfer from account: ${input.memo}` : 'Transfer',
    },
  ];

  const { error } = await supabase.from('transactions').insert(transactions);

  if (error) {
    console.error('Error creating transfer:', error);
    throw new Error('Failed to create transfer');
  }

  revalidatePath('/accounts');
  revalidatePath('/transactions');
  revalidatePath('/');
}
