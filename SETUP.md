# Epps Budget - Database Setup Guide

This guide will walk you through setting up your Supabase database for the Epps Budget application.

## Prerequisites

- Supabase project created at: https://sxksxctwkzvjutctwlmg.supabase.co
- Environment variables already configured in `.env.local`

## Setup Steps

### Step 1: Create the Admin User

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/sxksxctwkzvjutctwlmg
2. Navigate to **Authentication** > **Users**
3. Click **"Add user"** > **"Create new user"**
4. Enter the following details:
   - **Email**: `eppswf@gmail.com`
   - **Password**: `PoombieKeet@n22!`
   - Check **"Auto Confirm User"** (important!)
5. Click **"Create user"**

### Step 2: Run Database Migrations

1. In your Supabase Dashboard, navigate to **SQL Editor**
2. Click **"New query"**
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL Editor and click **"Run"**
5. You should see a success message

### Step 3: Seed Categories and Groups

1. Still in the **SQL Editor**, create another new query
2. Copy the contents of `supabase/migrations/003_seed_categories.sql`
3. Paste into the SQL Editor and click **"Run"**
4. You should see a success message with: "Seed data inserted successfully for user: [user-id]"

## Verification

To verify everything is set up correctly:

1. In the SQL Editor, run:
   ```sql
   SELECT COUNT(*) FROM category_groups;
   SELECT COUNT(*) FROM categories;
   ```

   You should see:
   - 5 category groups
   - 37 categories

2. Check that your categories exist:
   ```sql
   SELECT cg.name as group_name, c.name as category_name, c.target_amount
   FROM categories c
   JOIN category_groups cg ON c.group_id = cg.id
   ORDER BY cg.sort_order, c.sort_order;
   ```

## What's Next?

Once the database is set up, you can:

1. Run the development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Log in with:
   - Email: `eppswf@gmail.com`
   - Password: `PoombieKeet@n22!`

## Database Schema Overview

### Tables

- **user_profiles**: Links to Supabase Auth users
- **category_groups**: Top-level groups (Bills, Monthly Expenses, etc.)
- **categories**: Individual budget categories with targets
- **transactions**: All spending and income entries
- **monthly_assignments**: Tracks assigned amounts per category per month

### Key Concepts

- **Milliunits**: All monetary amounts are stored as integers in "milliunits" (e.g., $10.50 = 10500) to avoid floating-point errors
- **Rollover Logic**: Category balances roll over month-to-month
- **Row Level Security**: Enabled on all tables to ensure users only see their own data

## Troubleshooting

**Error: "Admin user not found"**
- Make sure you created the user in Step 1 with the exact email: `eppswf@gmail.com`
- The user must be confirmed (check "Auto Confirm User")

**Error: "relation does not exist"**
- Make sure you ran the schema migration (Step 2) before the seed script (Step 3)

**Error: "permission denied"**
- You may need to run the SQL as the postgres role in Supabase's SQL Editor
