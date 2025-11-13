import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getUserId() {
  // Get user_id from any category (they all have user_id)
  const { data: category, error } = await supabase
    .from('categories')
    .select('user_id')
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching user ID:', error);
    process.exit(1);
  }

  if (!category) {
    console.error('No categories found. Please run the seed script first.');
    process.exit(1);
  }

  console.log('\nUser ID:');
  console.log(category.user_id);
  console.log('\nTo run the import, use:');
  console.log(`USER_ID=${category.user_id} npm run import-historical`);
}

getUserId();
