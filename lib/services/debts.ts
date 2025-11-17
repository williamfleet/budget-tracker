import { createClient } from '@/lib/supabase/server';
import { Debt, DebtPayment, DebtWithPayments } from '@/lib/types/debts';

/**
 * Get all debts for a user
 */
export async function getDebts(
  userId: string,
  includeInactive: boolean = false
): Promise<Debt[]> {
  const supabase = await createClient();

  let query = supabase
    .from('debts')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching debts:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get a single debt with payment history
 */
export async function getDebtWithPayments(
  userId: string,
  debtId: string
): Promise<DebtWithPayments | null> {
  const supabase = await createClient();

  // Get debt
  const { data: debt, error: debtError } = await supabase
    .from('debts')
    .select('*')
    .eq('user_id', userId)
    .eq('id', debtId)
    .single();

  if (debtError || !debt) {
    console.error('Error fetching debt:', debtError);
    return null;
  }

  // Get payment history
  const { data: payments, error: paymentsError } = await supabase
    .from('debt_payments')
    .select('*')
    .eq('debt_id', debtId)
    .order('date', { ascending: false });

  if (paymentsError) {
    console.error('Error fetching debt payments:', paymentsError);
    return { ...debt, payments: [], total_paid: 0, total_interest_paid: 0 };
  }

  const paymentsData = payments || [];
  const totalPaid = paymentsData.reduce((sum, p) => sum + p.amount, 0);
  const totalInterestPaid = paymentsData.reduce(
    (sum, p) => sum + p.interest_amount,
    0
  );

  return {
    ...debt,
    payments: paymentsData,
    total_paid: totalPaid,
    total_interest_paid: totalInterestPaid,
  };
}

/**
 * Get all debt payments for a user
 */
export async function getDebtPayments(
  userId: string,
  debtId?: string
): Promise<DebtPayment[]> {
  const supabase = await createClient();

  let query = supabase
    .from('debt_payments')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (debtId) {
    query = query.eq('debt_id', debtId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching debt payments:', error);
    throw error;
  }

  return data || [];
}

/**
 * Calculate total debt balance
 */
export async function getTotalDebtBalance(userId: string): Promise<number> {
  const debts = await getDebts(userId, false);
  return debts.reduce((sum, debt) => sum + debt.balance, 0);
}

/**
 * Calculate total minimum monthly payment
 */
export async function getTotalMinimumPayment(userId: string): Promise<number> {
  const debts = await getDebts(userId, false);
  return debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
}

/**
 * Get debt statistics
 */
export async function getDebtStatistics(userId: string): Promise<{
  total_debt: number;
  total_minimum_payment: number;
  active_debts_count: number;
  paid_off_count: number;
  highest_interest_rate: number;
  average_interest_rate: number;
}> {
  const activeDebts = await getDebts(userId, false);
  const allDebts = await getDebts(userId, true);

  const totalDebt = activeDebts.reduce((sum, d) => sum + d.balance, 0);
  const totalMinimumPayment = activeDebts.reduce(
    (sum, d) => sum + d.minimum_payment,
    0
  );
  const paidOffCount = allDebts.filter((d) => !d.is_active).length;
  const highestRate =
    activeDebts.length > 0
      ? Math.max(...activeDebts.map((d) => d.interest_rate))
      : 0;
  const avgRate =
    activeDebts.length > 0
      ? activeDebts.reduce((sum, d) => sum + d.interest_rate, 0) /
        activeDebts.length
      : 0;

  return {
    total_debt: totalDebt,
    total_minimum_payment: totalMinimumPayment,
    active_debts_count: activeDebts.length,
    paid_off_count: paidOffCount,
    highest_interest_rate: highestRate,
    average_interest_rate: avgRate,
  };
}
