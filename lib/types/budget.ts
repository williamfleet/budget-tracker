// Database types
export interface CategoryGroup {
  id: string;
  user_id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  group_id: string;
  name: string;
  target_amount: number; // in milliunits
  sort_order: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  date: string;
  payee: string | null;
  amount: number; // in milliunits (negative = spending, positive = income)
  memo: string | null;
  created_at: string;
}

export interface MonthlyAssignment {
  id: string;
  user_id: string;
  category_id: string;
  month: string; // Always 1st of month: 'YYYY-MM-01'
  assigned_amount: number; // in milliunits
  created_at: string;
}

// Computed types for the UI
export interface CategoryBudgetData {
  id: string;
  name: string;
  target_amount: number; // in milliunits
  sort_order: number;
  assigned: number; // in milliunits - money budgeted TO this category this month
  activity: number; // in milliunits - total spending FROM this category this month (negative)
  available: number; // in milliunits - remaining balance (rolls over)
}

export interface CategoryGroupBudgetData {
  id: string;
  name: string;
  sort_order: number;
  categories: CategoryBudgetData[];
  totalAssigned: number; // Sum of all category assigned amounts
  totalActivity: number; // Sum of all category activity
  totalAvailable: number; // Sum of all category available balances
}

export interface BudgetSummary {
  moneyToAssign: number; // in milliunits
  totalIncome: number; // in milliunits
  totalAssigned: number; // in milliunits
  groups: CategoryGroupBudgetData[];
}
