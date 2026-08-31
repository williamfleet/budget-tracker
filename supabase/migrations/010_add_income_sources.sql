-- Create income_sources table (projected monthly income lines)
CREATE TABLE "public"."income_sources" (
  "id" UUID DEFAULT uuid_generate_v4() NOT NULL,
  "user_id" UUID NOT NULL REFERENCES "auth"."users"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "amount" BIGINT DEFAULT 0 NOT NULL, -- Store in milliunits
  "sort_order" INTEGER DEFAULT 0,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY ("id")
);

-- Create index for better query performance
CREATE INDEX idx_income_sources_user_id ON public.income_sources(user_id);

-- Enable Row Level Security (RLS) on income_sources
ALTER TABLE public.income_sources ENABLE ROW LEVEL SECURITY;

-- RLS Policies for income_sources
CREATE POLICY "Users can view their own income sources" ON public.income_sources
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own income sources" ON public.income_sources
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income sources" ON public.income_sources
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income sources" ON public.income_sources
  FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE "public"."income_sources" IS 'Projected monthly income lines used only on the Categories page to compare against total category targets. Not linked to transactions or assignments.';
