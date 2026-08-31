'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { dollarsToMilliunits } from '@/lib/utils/money';

interface CreateIncomeSourceInput {
  name: string;
  amount: string; // in dollars
}

interface UpdateIncomeSourceInput {
  id: string;
  name: string;
  amount: string; // in dollars
}

export async function createIncomeSource(input: CreateIncomeSourceInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Append new lines to the end of the list
  const { count } = await supabase
    .from('income_sources')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { error } = await supabase.from('income_sources').insert({
    user_id: user.id,
    name: input.name,
    amount: dollarsToMilliunits(parseFloat(input.amount) || 0),
    sort_order: count ?? 0,
  });

  if (error) {
    console.error('Error creating income source:', error);
    throw new Error('Failed to create income source');
  }

  revalidatePath('/categories');
}

export async function updateIncomeSource(input: UpdateIncomeSourceInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('income_sources')
    .update({
      name: input.name,
      amount: dollarsToMilliunits(parseFloat(input.amount) || 0),
    })
    .eq('id', input.id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error updating income source:', error);
    throw new Error('Failed to update income source');
  }

  revalidatePath('/categories');
}

export async function deleteIncomeSource(incomeSourceId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('income_sources')
    .delete()
    .eq('id', incomeSourceId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting income source:', error);
    throw new Error('Failed to delete income source');
  }

  revalidatePath('/categories');
}
