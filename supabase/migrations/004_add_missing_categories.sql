-- Add missing categories found in historical CSV data
DO $$
DECLARE
  admin_user_id UUID;
  bills_group_id UUID;
  goals_group_id UUID;
BEGIN
  -- Find the admin user and groups
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'eppswf@gmail.com' LIMIT 1;
  SELECT id INTO bills_group_id FROM public.category_groups WHERE user_id = admin_user_id AND name = 'Bills' LIMIT 1;
  SELECT id INTO goals_group_id FROM public.category_groups WHERE user_id = admin_user_id AND name = 'Goals' LIMIT 1;

  -- Add missing Bills categories
  INSERT INTO public.categories (user_id, group_id, name, target_amount, sort_order) VALUES
    (admin_user_id, bills_group_id, 'Smart Sales & Lease', 10000, 19),
    (admin_user_id, bills_group_id, 'Peacock', 2130, 20)
  ON CONFLICT DO NOTHING;

  -- Add Tempo Fit as alias (some months have "Tempo", others "Tempo Fit")
  INSERT INTO public.categories (user_id, group_id, name, target_amount, sort_order) VALUES
    (admin_user_id, bills_group_id, 'Tempo', 0, 21),
    (admin_user_id, bills_group_id, 'Tempo Fit', 0, 22)
  ON CONFLICT DO NOTHING;

  -- Update William Therapy category name to match CSV
  UPDATE public.categories
  SET name = 'William Therapy/Health Coaching'
  WHERE user_id = admin_user_id
    AND name = 'William Therapy/Coaching';

  -- Add Savings to Goals
  INSERT INTO public.categories (user_id, group_id, name, target_amount, sort_order) VALUES
    (admin_user_id, goals_group_id, 'Savings', 0, 2)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Missing categories added successfully';
END $$;
