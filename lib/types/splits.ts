export interface TransactionSplit {
  id: string;
  user_id: string;
  transaction_id: string;
  category_id: string;
  amount: number; // in milliunits
  memo: string | null;
  created_at: string;
}

export interface TransactionSplitWithCategory extends TransactionSplit {
  category_name: string;
}
