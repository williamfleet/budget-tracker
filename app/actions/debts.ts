'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { DebtType } from '@/lib/types/debts';

export interface CreateDebtInput {
  name: string;
  type: DebtType;
  balance: string; // dollar amount as string
  original_balance: string; // dollar amount as string
  interest_rate: string; // percentage as string
  minimum_payment: string; // dollar amount as string
  due_day: string; // day of month
  account_id: string | null;
  notes: string;
}

export interface UpdateDebtInput extends CreateDebtInput {
  id: string;
  is_active: boolean;
}

export interface CreateDebtPaymentInput {
  debt_id: string;
  amount: string; // dollar amount as string
  principal_amount: string; // dollar amount as string
  interest_amount: string; // dollar amount as string
  date: string;
  notes: string;
  transaction_id: string | null;
}

/**
 * Create a new debt
 */
export async function createDebt(input: CreateDebtInput) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Convert dollar amounts to milliunits
    const balanceInMilliunits = Math.round(parseFloat(input.balance) * 1000);
    const originalBalanceInMilliunits = Math.round(
      parseFloat(input.original_balance) * 1000
    );
    const minimumPaymentInMilliunits = Math.round(
      parseFloat(input.minimum_payment) * 1000
    );

    const { error } = await supabase.from('debts').insert({
      user_id: user.id,
      name: input.name,
      type: input.type,
      balance: balanceInMilliunits,
      original_balance: originalBalanceInMilliunits,
      interest_rate: parseFloat(input.interest_rate),
      minimum_payment: minimumPaymentInMilliunits,
      due_day: input.due_day ? parseInt(input.due_day) : null,
      account_id: input.account_id || null,
      notes: input.notes || null,
      is_active: true,
    });

    if (error) {
      console.error('Error creating debt:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/debts');
    return { success: true };
  } catch (error) {
    console.error('Error creating debt:', error);
    return { success: false, error: 'Failed to create debt' };
  }
}

/**
 * Update an existing debt
 */
export async function updateDebt(input: UpdateDebtInput) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Convert dollar amounts to milliunits
    const balanceInMilliunits = Math.round(parseFloat(input.balance) * 1000);
    const originalBalanceInMilliunits = Math.round(
      parseFloat(input.original_balance) * 1000
    );
    const minimumPaymentInMilliunits = Math.round(
      parseFloat(input.minimum_payment) * 1000
    );

    const { error } = await supabase
      .from('debts')
      .update({
        name: input.name,
        type: input.type,
        balance: balanceInMilliunits,
        original_balance: originalBalanceInMilliunits,
        interest_rate: parseFloat(input.interest_rate),
        minimum_payment: minimumPaymentInMilliunits,
        due_day: input.due_day ? parseInt(input.due_day) : null,
        account_id: input.account_id || null,
        notes: input.notes || null,
        is_active: input.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating debt:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/debts');
    return { success: true };
  } catch (error) {
    console.error('Error updating debt:', error);
    return { success: false, error: 'Failed to update debt' };
  }
}

/**
 * Delete a debt
 */
export async function deleteDebt(debtId: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('debts')
      .delete()
      .eq('id', debtId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting debt:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/debts');
    return { success: true };
  } catch (error) {
    console.error('Error deleting debt:', error);
    return { success: false, error: 'Failed to delete debt' };
  }
}

/**
 * Mark a debt as paid off
 */
export async function markDebtAsPaidOff(debtId: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('debts')
      .update({
        is_active: false,
        balance: 0,
        paid_off_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString(),
      })
      .eq('id', debtId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error marking debt as paid off:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/debts');
    return { success: true };
  } catch (error) {
    console.error('Error marking debt as paid off:', error);
    return { success: false, error: 'Failed to mark debt as paid off' };
  }
}

/**
 * Create a debt payment
 */
export async function createDebtPayment(input: CreateDebtPaymentInput) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Convert dollar amounts to milliunits
    const amountInMilliunits = Math.round(parseFloat(input.amount) * 1000);
    const principalInMilliunits = Math.round(
      parseFloat(input.principal_amount) * 1000
    );
    const interestInMilliunits = Math.round(
      parseFloat(input.interest_amount) * 1000
    );

    const { error } = await supabase.from('debt_payments').insert({
      user_id: user.id,
      debt_id: input.debt_id,
      amount: amountInMilliunits,
      principal_amount: principalInMilliunits,
      interest_amount: interestInMilliunits,
      date: input.date,
      notes: input.notes || null,
      transaction_id: input.transaction_id || null,
    });

    if (error) {
      console.error('Error creating debt payment:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/debts');
    return { success: true };
  } catch (error) {
    console.error('Error creating debt payment:', error);
    return { success: false, error: 'Failed to create debt payment' };
  }
}

/**
 * Delete a debt payment
 */
export async function deleteDebtPayment(paymentId: string) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('debt_payments')
      .delete()
      .eq('id', paymentId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting debt payment:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/debts');
    return { success: true };
  } catch (error) {
    console.error('Error deleting debt payment:', error);
    return { success: false, error: 'Failed to delete debt payment' };
  }
}
