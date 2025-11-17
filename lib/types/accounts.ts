export type AccountType = 'checking' | 'savings' | 'credit_card' | 'cash' | 'investment';

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  balance: number; // in milliunits
  notes: string | null;
  sort_order: number;
  created_at: string;
}

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking: 'Checking',
  savings: 'Savings',
  credit_card: 'Credit Card',
  cash: 'Cash',
  investment: 'Investment',
};

export const ACCOUNT_TYPE_ICONS: Record<AccountType, string> = {
  checking: '💳',
  savings: '🏦',
  credit_card: '💰',
  cash: '💵',
  investment: '📈',
};
