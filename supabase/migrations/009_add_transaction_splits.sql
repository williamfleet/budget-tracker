-- Transaction splits table (for splitting one transaction across multiple categories)
CREATE TABLE "public"."transaction_splits" (
  "id" UUID DEFAULT uuid_generate_v4() NOT NULL,
  "user_id" UUID NOT NULL REFERENCES "auth"."users"("id") ON DELETE CASCADE,
  "transaction_id" UUID NOT NULL REFERENCES "public"."transactions"("id") ON DELETE CASCADE,
  "category_id" UUID NOT NULL REFERENCES "public"."categories"("id") ON DELETE CASCADE,
  "amount" BIGINT NOT NULL, -- Store in milliunits; must be negative for expense splits
  "memo" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("id")
);

-- Create indexes for better query performance
CREATE INDEX idx_transaction_splits_user_id ON public.transaction_splits(user_id);
CREATE INDEX idx_transaction_splits_transaction_id ON public.transaction_splits(transaction_id);
CREATE INDEX idx_transaction_splits_category_id ON public.transaction_splits(category_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.transaction_splits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transaction_splits
CREATE POLICY "Users can view their own transaction splits" ON public.transaction_splits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transaction splits" ON public.transaction_splits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transaction splits" ON public.transaction_splits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transaction splits" ON public.transaction_splits
  FOR DELETE USING (auth.uid() = user_id);
