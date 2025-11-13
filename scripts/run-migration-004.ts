import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🔧 Running migration 004: Add missing categories\n');

  const userId = '52c34dcc-ee3a-4145-8707-7316bd73bdbe';

  // Get group IDs
  const { data: billsGroup } = await supabase
    .from('category_groups')
    .select('id')
    .eq('user_id', userId)
    .eq('name', 'Bills')
    .single();

  const { data: goalsGroup } = await supabase
    .from('category_groups')
    .select('id')
    .eq('user_id', userId)
    .eq('name', 'Goals')
    .single();

  if (!billsGroup || !goalsGroup) {
    console.error('Error: Could not find category groups');
    process.exit(1);
  }

  // Add missing Bills categories
  console.log('Adding missing Bills categories...');
  const { error: bills1 } = await supabase.from('categories').insert([
    { user_id: userId, group_id: billsGroup.id, name: 'Smart Sales & Lease', target_amount: 10000, sort_order: 19 },
    { user_id: userId, group_id: billsGroup.id, name: 'Peacock', target_amount: 2130, sort_order: 20 },
    { user_id: userId, group_id: billsGroup.id, name: 'Tempo', target_amount: 0, sort_order: 21 },
    { user_id: userId, group_id: billsGroup.id, name: 'Tempo Fit', target_amount: 0, sort_order: 22 },
  ]);

  if (bills1) {
    console.log('Note: Some categories may already exist:', bills1.message);
  } else {
    console.log('✓ Added Bills categories');
  }

  // Update William Therapy category name
  console.log('Updating William Therapy category name...');
  const { error: updateError } = await supabase
    .from('categories')
    .update({ name: 'William Therapy/Health Coaching' })
    .eq('user_id', userId)
    .eq('name', 'William Therapy/Coaching');

  if (updateError) {
    console.log('Note:', updateError.message);
  } else {
    console.log('✓ Updated William Therapy category name');
  }

  // Add Savings to Goals
  console.log('Adding Savings category...');
  const { error: savings } = await supabase.from('categories').insert([
    { user_id: userId, group_id: goalsGroup.id, name: 'Savings', target_amount: 0, sort_order: 2 },
  ]);

  if (savings) {
    console.log('Note:', savings.message);
  } else {
    console.log('✓ Added Savings category');
  }

  console.log('\n✅ Migration complete!\n');
}

runMigration();
