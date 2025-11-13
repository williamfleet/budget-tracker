-- Add archived column to categories table
ALTER TABLE "public"."categories"
ADD COLUMN "archived" BOOLEAN DEFAULT FALSE NOT NULL;

-- Create index for faster queries filtering by archived status
CREATE INDEX "idx_categories_archived" ON "public"."categories"("archived");

-- Add comment to explain the column
COMMENT ON COLUMN "public"."categories"."archived" IS 'When true, category will not appear in current or future months, but historical data is preserved';
