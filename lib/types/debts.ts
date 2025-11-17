export type DebtType =
  | 'credit_card'
  | 'personal_loan'
  | 'auto_loan'
  | 'student_loan'
  | 'mortgage'
  | 'medical'
  | 'other';

export interface Debt {
  id: string;
  user_id: string;
  name: string;
  type: DebtType;
  balance: number; // in milliunits
  original_balance: number; // in milliunits
  interest_rate: number; // annual percentage rate (e.g., 18.99)
  minimum_payment: number; // in milliunits
  due_day: number | null; // day of month (1-31)
  account_id: string | null;
  notes: string | null;
  is_active: boolean;
  paid_off_date: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DebtPayment {
  id: string;
  user_id: string;
  debt_id: string;
  transaction_id: string | null;
  amount: number; // in milliunits
  principal_amount: number; // in milliunits
  interest_amount: number; // in milliunits
  date: string;
  notes: string | null;
  created_at: string;
}

export interface DebtWithPayments extends Debt {
  payments: DebtPayment[];
  total_paid: number; // in milliunits
  total_interest_paid: number; // in milliunits
}

export interface PayoffCalculation {
  debt_id: string;
  debt_name: string;
  current_balance: number;
  interest_rate: number;
  months_to_payoff: number;
  total_interest: number;
  total_amount_paid: number;
  monthly_payment: number;
  payoff_date: string;
}

export interface PayoffStrategy {
  strategy: 'snowball' | 'avalanche' | 'custom';
  total_months: number;
  total_interest: number;
  total_paid: number;
  payoff_schedule: PayoffCalculation[];
}

export const DEBT_TYPE_LABELS: Record<DebtType, string> = {
  credit_card: 'Credit Card',
  personal_loan: 'Personal Loan',
  auto_loan: 'Auto Loan',
  student_loan: 'Student Loan',
  mortgage: 'Mortgage',
  medical: 'Medical',
  other: 'Other',
};

export const DEBT_TYPE_ICONS: Record<DebtType, string> = {
  credit_card: '💳',
  personal_loan: '💰',
  auto_loan: '🚗',
  student_loan: '🎓',
  mortgage: '🏠',
  medical: '🏥',
  other: '📄',
};
