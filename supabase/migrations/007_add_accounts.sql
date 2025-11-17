-- Create accounts table
CREATE TABLE "public"."accounts" (
  "id" UUID DEFAULT uuid_generate_v4() NOT NULL,
  "user_id" UUID NOT NULL REFERENCES "auth"."users"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'credit_card', 'cash', 'investment')),
  "balance" BIGINT DEFAULT 0 NOT NULL, -- Store in milliunits
  "notes" TEXT,
  "sort_order" INTEGER DEFAULT 0,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("id")
);

-- Add account_id to transactions table
ALTER TABLE "public"."transactions"
  ADD COLUMN "account_id" UUID REFERENCES "public"."accounts"("id") ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX idx_transactions_account_id ON public.transactions(account_id);

-- Enable Row Level Security (RLS) on accounts
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for accounts
CREATE POLICY "Users can view their own accounts" ON public.accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own accounts" ON public.accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts" ON public.accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts" ON public.accounts
  FOR DELETE USING (auth.uid() = user_id);
