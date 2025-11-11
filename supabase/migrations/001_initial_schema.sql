-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User profiles table (linked to auth.users)
CREATE TABLE "public"."user_profiles" (
  "id" UUID NOT NULL REFERENCES "auth"."users"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("id")
);

-- Category groups table (e.g., "Bills", "Monthly Expenses")
CREATE TABLE "public"."category_groups" (
  "id" UUID DEFAULT uuid_generate_v4() NOT NULL,
  "user_id" UUID NOT NULL REFERENCES "auth"."users"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "sort_order" INTEGER DEFAULT 0,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("id")
);

-- Categories table (e.g., "Groceries", "Mortgage")
CREATE TABLE "public"."categories" (
  "id" UUID DEFAULT uuid_generate_v4() NOT NULL,
  "user_id" UUID NOT NULL REFERENCES "auth"."users"("id") ON DELETE CASCADE,
  "group_id" UUID NOT NULL REFERENCES "public"."category_groups"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "target_amount" BIGINT DEFAULT 0, -- Store in milliunits (e.g., $100.00 = 100000)
  "sort_order" INTEGER DEFAULT 0,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("id")
);

-- Transactions table (spending and income)
CREATE TABLE "public"."transactions" (
  "id" UUID DEFAULT uuid_generate_v4() NOT NULL,
  "user_id" UUID NOT NULL REFERENCES "auth"."users"("id") ON DELETE CASCADE,
  "category_id" UUID REFERENCES "public"."categories"("id") ON DELETE SET NULL, -- NULL = income to be assigned
  "date" DATE NOT NULL,
  "payee" TEXT,
  "amount" BIGINT NOT NULL, -- Store in milliunits; spending = negative, income = positive
  "memo" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("id")
);

-- Monthly assignments table (stores "Assigned" amounts per category per month)
CREATE TABLE "public"."monthly_assignments" (
  "id" UUID DEFAULT uuid_generate_v4() NOT NULL,
  "user_id" UUID NOT NULL REFERENCES "auth"."users"("id") ON DELETE CASCADE,
  "category_id" UUID NOT NULL REFERENCES "public"."categories"("id") ON DELETE CASCADE,
  "month" DATE NOT NULL, -- Always store as 1st of month (e.g., '2025-11-01')
  "assigned_amount" BIGINT DEFAULT 0 NOT NULL, -- Store in milliunits
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("id"),
  UNIQUE("user_id", "category_id", "month")
);

-- Create indexes for better query performance
CREATE INDEX idx_category_groups_user_id ON public.category_groups(user_id);
CREATE INDEX idx_categories_user_id ON public.categories(user_id);
CREATE INDEX idx_categories_group_id ON public.categories(group_id);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX idx_transactions_date ON public.transactions(date);
CREATE INDEX idx_monthly_assignments_user_id ON public.monthly_assignments(user_id);
CREATE INDEX idx_monthly_assignments_category_month ON public.monthly_assignments(category_id, month);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for category_groups
CREATE POLICY "Users can view their own category groups" ON public.category_groups
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own category groups" ON public.category_groups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own category groups" ON public.category_groups
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own category groups" ON public.category_groups
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for categories
CREATE POLICY "Users can view their own categories" ON public.categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" ON public.categories
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for monthly_assignments
CREATE POLICY "Users can view their own monthly assignments" ON public.monthly_assignments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own monthly assignments" ON public.monthly_assignments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monthly assignments" ON public.monthly_assignments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own monthly assignments" ON public.monthly_assignments
  FOR DELETE USING (auth.uid() = user_id);
