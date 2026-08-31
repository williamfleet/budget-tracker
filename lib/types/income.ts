// Projected monthly income line (Categories page only — not linked to transactions)
export interface IncomeSource {
  id: string;
  user_id: string;
  name: string;
  amount: number; // in milliunits
  sort_order: number;
  created_at: string;
}
