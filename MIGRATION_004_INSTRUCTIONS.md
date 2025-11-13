# Migration 004: Add Missing Categories

Before re-running the import, you need to add the missing categories to your database.

## Steps:

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New query"
5. Copy the entire contents of `supabase/migrations/004_add_missing_categories.sql`
6. Paste it into the SQL editor
7. Click "Run" (or press Cmd/Ctrl + Enter)
8. You should see "Success. No rows returned" or a notice message

## What this migration does:

- Adds "Smart Sales & Lease" category (Bills)
- Adds "Peacock" category (Bills)
- Adds "Tempo" and "Tempo Fit" categories (Bills)
- Updates "William Therapy/Coaching" to "William Therapy/Health Coaching"
- Adds "Savings" category (Goals)

## After running the migration:

Run the cleanup and import scripts using the commands below.
