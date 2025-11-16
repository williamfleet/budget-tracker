-- Add charge_day and is_checking fields to categories table
ALTER TABLE "public"."categories"
  ADD COLUMN "charge_day" INTEGER, -- Day of month (1-31) when charge typically occurs
  ADD COLUMN "is_checking" BOOLEAN DEFAULT false; -- Whether this is a checking account expense

-- Add constraint to ensure charge_day is between 1 and 31 if provided
ALTER TABLE "public"."categories"
  ADD CONSTRAINT "charge_day_range" CHECK (charge_day IS NULL OR (charge_day >= 1 AND charge_day <= 31));
