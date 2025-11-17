-- Create debts table
CREATE TABLE "public"."debts" (
  "id" UUID DEFAULT uuid_generate_v4() NOT NULL,
  "user_id" UUID NOT NULL REFERENCES "auth"."users"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL CHECK (type IN ('credit_card', 'personal_loan', 'auto_loan', 'student_loan', 'mortgage', 'medical', 'other')),
  "balance" BIGINT NOT NULL, -- Current balance in milliunits
  "original_balance" BIGINT NOT NULL, -- Original balance in milliunits
  "interest_rate" NUMERIC(5,2) NOT NULL, -- Annual percentage rate (e.g., 18.99 for 18.99%)
  "minimum_payment" BIGINT NOT NULL, -- Minimum monthly payment in milliunits
  "due_day" INTEGER, -- Day of month payment is due (1-31)
  "account_id" UUID REFERENCES "public"."accounts"("id") ON DELETE SET NULL, -- Link to account if tracked there
  "notes" TEXT,
  "is_active" BOOLEAN DEFAULT true, -- Set to false when paid off
  "paid_off_date" DATE, -- Date debt was paid off
  "sort_order" INTEGER DEFAULT 0,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("id")
);

-- Create debt payments tracking table
CREATE TABLE "public"."debt_payments" (
  "id" UUID DEFAULT uuid_generate_v4() NOT NULL,
  "user_id" UUID NOT NULL REFERENCES "auth"."users"("id") ON DELETE CASCADE,
  "debt_id" UUID NOT NULL REFERENCES "public"."debts"("id") ON DELETE CASCADE,
  "transaction_id" UUID REFERENCES "public"."transactions"("id") ON DELETE SET NULL,
  "amount" BIGINT NOT NULL, -- Payment amount in milliunits
  "principal_amount" BIGINT NOT NULL, -- Amount applied to principal
  "interest_amount" BIGINT NOT NULL, -- Amount applied to interest
  "date" DATE NOT NULL,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("id")
);

-- Create indexes for better query performance
CREATE INDEX idx_debts_user_id ON public.debts(user_id);
CREATE INDEX idx_debts_is_active ON public.debts(is_active);
CREATE INDEX idx_debt_payments_user_id ON public.debt_payments(user_id);
CREATE INDEX idx_debt_payments_debt_id ON public.debt_payments(debt_id);
CREATE INDEX idx_debt_payments_date ON public.debt_payments(date);

-- Enable Row Level Security (RLS) on debts
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for debts
CREATE POLICY "Users can view their own debts" ON public.debts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debts" ON public.debts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts" ON public.debts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts" ON public.debts
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for debt_payments
CREATE POLICY "Users can view their own debt payments" ON public.debt_payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debt payments" ON public.debt_payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debt payments" ON public.debt_payments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debt payments" ON public.debt_payments
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update debt balance when payment is added
CREATE OR REPLACE FUNCTION update_debt_balance_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Update debt balance
  UPDATE public.debts
  SET
    balance = balance - NEW.principal_amount,
    updated_at = NOW(),
    is_active = CASE WHEN (balance - NEW.principal_amount) <= 0 THEN false ELSE is_active END,
    paid_off_date = CASE WHEN (balance - NEW.principal_amount) <= 0 THEN NEW.date ELSE paid_off_date END
  WHERE id = NEW.debt_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update debt balance when payment is inserted
CREATE TRIGGER trigger_update_debt_balance
  AFTER INSERT ON public.debt_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_debt_balance_on_payment();
