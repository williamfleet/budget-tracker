import { Debt, PayoffCalculation, PayoffStrategy } from '@/lib/types/debts';

/**
 * Calculate monthly interest for a debt
 */
export function calculateMonthlyInterest(
  balance: number,
  annualRate: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  return Math.round(balance * monthlyRate);
}

/**
 * Calculate months to payoff with given monthly payment
 */
export function calculateMonthsToPayoff(
  balance: number,
  annualRate: number,
  monthlyPayment: number
): number {
  if (monthlyPayment <= 0) return Infinity;

  const monthlyRate = annualRate / 100 / 12;

  // If payment is less than or equal to monthly interest, debt will never be paid off
  const monthlyInterest = balance * monthlyRate;
  if (monthlyPayment <= monthlyInterest) return Infinity;

  // Calculate using amortization formula
  const months = Math.log(
    monthlyPayment / (monthlyPayment - balance * monthlyRate)
  ) / Math.log(1 + monthlyRate);

  return Math.ceil(months);
}

/**
 * Calculate total interest paid over the life of the debt
 */
export function calculateTotalInterest(
  balance: number,
  annualRate: number,
  monthlyPayment: number,
  months: number
): number {
  let remainingBalance = balance;
  let totalInterest = 0;
  const monthlyRate = annualRate / 100 / 12;

  for (let i = 0; i < months && remainingBalance > 0; i++) {
    const interestForMonth = Math.round(remainingBalance * monthlyRate);
    totalInterest += interestForMonth;

    const principalPayment = monthlyPayment - interestForMonth;
    remainingBalance = Math.max(0, remainingBalance - principalPayment);
  }

  return totalInterest;
}

/**
 * Calculate payoff date from current date
 */
export function calculatePayoffDate(monthsFromNow: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsFromNow);
  return date.toISOString().split('T')[0];
}

/**
 * Calculate detailed payoff schedule for a single debt
 */
export function calculateDebtPayoff(
  debt: Debt,
  monthlyPayment: number
): PayoffCalculation {
  const months = calculateMonthsToPayoff(
    debt.balance,
    debt.interest_rate,
    monthlyPayment
  );

  const totalInterest = calculateTotalInterest(
    debt.balance,
    debt.interest_rate,
    monthlyPayment,
    months
  );

  const totalPaid = debt.balance + totalInterest;
  const payoffDate = calculatePayoffDate(months);

  return {
    debt_id: debt.id,
    debt_name: debt.name,
    current_balance: debt.balance,
    interest_rate: debt.interest_rate,
    months_to_payoff: months,
    total_interest: totalInterest,
    total_amount_paid: totalPaid,
    monthly_payment: monthlyPayment,
    payoff_date: payoffDate,
  };
}

/**
 * Calculate Snowball strategy (pay smallest balance first)
 */
export function calculateSnowballStrategy(
  debts: Debt[],
  extraPayment: number // Extra amount beyond minimum payments
): PayoffStrategy {
  const activeDebts = debts
    .filter((d) => d.is_active && d.balance > 0)
    .sort((a, b) => a.balance - b.balance); // Sort by balance ascending

  return simulatePayoffStrategy(activeDebts, extraPayment, 'snowball');
}

/**
 * Calculate Avalanche strategy (pay highest interest rate first)
 */
export function calculateAvalancheStrategy(
  debts: Debt[],
  extraPayment: number
): PayoffStrategy {
  const activeDebts = debts
    .filter((d) => d.is_active && d.balance > 0)
    .sort((a, b) => b.interest_rate - a.interest_rate); // Sort by interest rate descending

  return simulatePayoffStrategy(activeDebts, extraPayment, 'avalanche');
}

/**
 * Simulate debt payoff strategy
 */
function simulatePayoffStrategy(
  sortedDebts: Debt[],
  extraPayment: number,
  strategy: 'snowball' | 'avalanche'
): PayoffStrategy {
  // Clone debts for simulation
  const debtStates = sortedDebts.map((d) => ({
    ...d,
    balance: d.balance,
  }));

  const payoffSchedule: PayoffCalculation[] = [];
  let totalInterest = 0;
  let totalPaid = 0;
  let currentMonth = 0;
  const maxMonths = 600; // 50 years safety limit

  // Calculate total minimum payments
  const totalMinimumPayments = debtStates.reduce(
    (sum, d) => sum + d.minimum_payment,
    0
  );
  const totalMonthlyPayment = totalMinimumPayments + extraPayment;

  while (
    debtStates.some((d) => d.balance > 0) &&
    currentMonth < maxMonths
  ) {
    currentMonth++;

    // Apply interest to all debts
    for (const debt of debtStates) {
      if (debt.balance > 0) {
        const interest = calculateMonthlyInterest(
          debt.balance,
          debt.interest_rate
        );
        totalInterest += interest;
      }
    }

    // Pay minimum on all debts
    let remainingPayment = totalMonthlyPayment;
    for (const debt of debtStates) {
      if (debt.balance > 0) {
        const minPayment = Math.min(debt.minimum_payment, debt.balance);
        const interest = calculateMonthlyInterest(
          debt.balance,
          debt.interest_rate
        );
        const principal = minPayment - interest;
        debt.balance = Math.max(0, debt.balance - principal);
        remainingPayment -= minPayment;
        totalPaid += minPayment;
      }
    }

    // Apply extra payment to first debt with balance (already sorted by strategy)
    if (remainingPayment > 0) {
      const targetDebt = debtStates.find((d) => d.balance > 0);
      if (targetDebt) {
        const extraPrincipal = Math.min(remainingPayment, targetDebt.balance);
        targetDebt.balance -= extraPrincipal;
        totalPaid += extraPrincipal;

        // Record when debt is paid off
        if (targetDebt.balance === 0) {
          const originalDebt = sortedDebts.find((d) => d.id === targetDebt.id)!;
          payoffSchedule.push({
            debt_id: targetDebt.id,
            debt_name: targetDebt.name,
            current_balance: originalDebt.balance,
            interest_rate: targetDebt.interest_rate,
            months_to_payoff: currentMonth,
            total_interest: totalInterest,
            total_amount_paid: totalPaid,
            monthly_payment: totalMonthlyPayment,
            payoff_date: calculatePayoffDate(currentMonth),
          });
        }
      }
    }
  }

  return {
    strategy,
    total_months: currentMonth,
    total_interest: totalInterest,
    total_paid: totalPaid,
    payoff_schedule: payoffSchedule,
  };
}

/**
 * Calculate interest saved comparing two strategies
 */
export function compareStrategies(
  snowball: PayoffStrategy,
  avalanche: PayoffStrategy
): {
  savings: number;
  monthsSaved: number;
  betterStrategy: 'snowball' | 'avalanche' | 'equal';
} {
  const interestDiff = snowball.total_interest - avalanche.total_interest;
  const monthsDiff = snowball.total_months - avalanche.total_months;

  let betterStrategy: 'snowball' | 'avalanche' | 'equal' = 'equal';
  if (interestDiff > 0) betterStrategy = 'avalanche';
  else if (interestDiff < 0) betterStrategy = 'snowball';

  return {
    savings: Math.abs(interestDiff),
    monthsSaved: Math.abs(monthsDiff),
    betterStrategy,
  };
}
