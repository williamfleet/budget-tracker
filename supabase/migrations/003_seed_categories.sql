-- Seed categories and groups for Epps Budget
-- This script assumes the admin user has already been created via Supabase Auth UI
-- User email: eppswf@gmail.com

-- Get the user_id for the admin user
DO $$
DECLARE
  admin_user_id UUID;
  bills_group_id UUID;
  monthly_group_id UUID;
  non_monthly_group_id UUID;
  goals_group_id UUID;
  qol_group_id UUID;
BEGIN
  -- Find the admin user by email (adjust email if different)
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'eppswf@gmail.com' LIMIT 1;

  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'Admin user not found. Please create user with email: eppswf@gmail.com';
  END IF;

  -- Create user profile
  INSERT INTO public.user_profiles (id) VALUES (admin_user_id)
  ON CONFLICT (id) DO NOTHING;

  -- Create Category Groups
  INSERT INTO public.category_groups (id, user_id, name, sort_order) VALUES
    (gen_random_uuid(), admin_user_id, 'Bills', 1)
  RETURNING id INTO bills_group_id;

  INSERT INTO public.category_groups (id, user_id, name, sort_order) VALUES
    (gen_random_uuid(), admin_user_id, 'Monthly Expenses', 2)
  RETURNING id INTO monthly_group_id;

  INSERT INTO public.category_groups (id, user_id, name, sort_order) VALUES
    (gen_random_uuid(), admin_user_id, 'Non-Monthly Expenses', 3)
  RETURNING id INTO non_monthly_group_id;

  INSERT INTO public.category_groups (id, user_id, name, sort_order) VALUES
    (gen_random_uuid(), admin_user_id, 'Goals', 4)
  RETURNING id INTO goals_group_id;

  INSERT INTO public.category_groups (id, user_id, name, sort_order) VALUES
    (gen_random_uuid(), admin_user_id, 'Quality of Life', 5)
  RETURNING id INTO qol_group_id;

  -- Insert Bills categories (target_amount in milliunits: $1.00 = 1000)
  INSERT INTO public.categories (user_id, group_id, name, target_amount, sort_order) VALUES
    (admin_user_id, bills_group_id, 'Liana Therapy/Couples Therapy', 60000, 1),
    (admin_user_id, bills_group_id, 'Liana Dental Insurance', 35530, 2),
    (admin_user_id, bills_group_id, 'Spotify', 18180, 3),
    (admin_user_id, bills_group_id, 'Cellphone', 143530, 4),
    (admin_user_id, bills_group_id, 'Liana Vision Insurance', 12390, 5),
    (admin_user_id, bills_group_id, 'Liana Apple Storage', 2990, 6),
    (admin_user_id, bills_group_id, 'Liana Health Insurance', 361520, 7),
    (admin_user_id, bills_group_id, 'William Apple Storage', 2990, 8),
    (admin_user_id, bills_group_id, 'Life Insurance', 46120, 9),
    (admin_user_id, bills_group_id, 'Fitness coaching/PT/Nutrition', 220000, 10),
    (admin_user_id, bills_group_id, 'Student Loans', 234000, 11),
    (admin_user_id, bills_group_id, 'Car Insurance', 136590, 12),
    (admin_user_id, bills_group_id, 'Money Lion/Balance', 11530, 13),
    (admin_user_id, bills_group_id, 'Mortgage', 1129280, 14),
    (admin_user_id, bills_group_id, 'William Therapy/Coaching', 220000, 15),
    (admin_user_id, bills_group_id, 'Amazon Prime student', 8010, 16),
    (admin_user_id, bills_group_id, 'Electric', 200000, 17),
    (admin_user_id, bills_group_id, 'Internet', 57700, 18);

  -- Insert Monthly Expenses categories
  INSERT INTO public.categories (user_id, group_id, name, target_amount, sort_order) VALUES
    (admin_user_id, monthly_group_id, 'Pets', 200000, 1),
    (admin_user_id, monthly_group_id, 'Groceries', 500000, 2),
    (admin_user_id, monthly_group_id, 'Eating Out', 200000, 3),
    (admin_user_id, monthly_group_id, 'Transportation', 200000, 4),
    (admin_user_id, monthly_group_id, 'Clothes', 40000, 5),
    (admin_user_id, monthly_group_id, 'Personal Care', 100000, 6),
    (admin_user_id, monthly_group_id, '7th Tradition', 20000, 7);

  -- Insert Non-Monthly Expenses categories
  INSERT INTO public.categories (user_id, group_id, name, target_amount, sort_order) VALUES
    (admin_user_id, non_monthly_group_id, 'Credit Card Debt', 0, 1),
    (admin_user_id, non_monthly_group_id, 'Medical Expenses', 51150, 2),
    (admin_user_id, non_monthly_group_id, 'Gifts', 40000, 3),
    (admin_user_id, non_monthly_group_id, 'Heating Oil', 0, 4),
    (admin_user_id, non_monthly_group_id, 'Home Maintenance', 40000, 5),
    (admin_user_id, non_monthly_group_id, 'Auto Maintenance', 40000, 6);

  -- Insert Goals categories
  INSERT INTO public.categories (user_id, group_id, name, target_amount, sort_order) VALUES
    (admin_user_id, goals_group_id, 'Baby', 20000, 1);

  -- Insert Quality of Life categories
  INSERT INTO public.categories (user_id, group_id, name, target_amount, sort_order) VALUES
    (admin_user_id, qol_group_id, 'Coffee', 40000, 1),
    (admin_user_id, qol_group_id, 'Liana Spending Money + Gifts', 80000, 2),
    (admin_user_id, qol_group_id, 'William Spending Money + Gifts', 80000, 3),
    (admin_user_id, qol_group_id, 'William - Professional Development', 45000, 4),
    (admin_user_id, qol_group_id, 'Entertainment', 40000, 5);

  RAISE NOTICE 'Seed data inserted successfully for user: %', admin_user_id;
END $$;
