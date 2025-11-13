'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { dollarsToMilliunits } from '@/lib/utils/money';

interface CreateCategoryInput {
  name: string;
  group_id: string;
  target_amount: string; // in dollars
}

interface UpdateCategoryInput {
  id: string;
  name: string;
  target_amount: string; // in dollars
}

export async function createCategory(input: CreateCategoryInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const targetInMilliunits = dollarsToMilliunits(parseFloat(input.target_amount));

  const { error } = await supabase.from('categories').insert({
    user_id: user.id,
    group_id: input.group_id,
    name: input.name,
    target_amount: targetInMilliunits,
  });

  if (error) {
    console.error('Error creating category:', error);
    throw new Error('Failed to create category');
  }

  revalidatePath('/categories');
  revalidatePath('/');
}

export async function updateCategory(input: UpdateCategoryInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const targetInMilliunits = dollarsToMilliunits(parseFloat(input.target_amount));

  const { error } = await supabase
    .from('categories')
    .update({
      name: input.name,
      target_amount: targetInMilliunits,
    })
    .eq('id', input.id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error updating category:', error);
    throw new Error('Failed to update category');
  }

  revalidatePath('/categories');
  revalidatePath('/');
}

export async function archiveCategory(categoryId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Archive the category - it won't show in current/future months
  // but historical data is preserved
  const { error } = await supabase
    .from('categories')
    .update({ archived: true })
    .eq('id', categoryId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error archiving category:', error);
    throw new Error('Failed to archive category');
  }

  revalidatePath('/categories');
  revalidatePath('/');
}

export async function unarchiveCategory(categoryId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Unarchive the category - it will appear in current/future months again
  const { error } = await supabase
    .from('categories')
    .update({ archived: false })
    .eq('id', categoryId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error unarchiving category:', error);
    throw new Error('Failed to unarchive category');
  }

  revalidatePath('/categories');
  revalidatePath('/');
}

export async function updateCategorySortOrder(
  categoryId: string,
  newSortOrder: number
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('categories')
    .update({ sort_order: newSortOrder })
    .eq('id', categoryId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error updating sort order:', error);
    throw new Error('Failed to update sort order');
  }

  revalidatePath('/categories');
  revalidatePath('/');
}
