import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanup() {
  const userId = process.env.USER_ID;
  if (!userId) {
    console.error('ERROR: Please set USER_ID environment variable');
    process.exit(1);
  }

  console.log('🧹 Cleaning up previously imported data...\n');
  console.log(`User ID: ${userId}\n`);

  // Delete all transactions
  const { error: txError, count: txCount } = await supabase
    .from('transactions')
    .delete()
    .eq('user_id', userId);

  if (txError) {
    console.error('Error deleting transactions:', txError);
    process.exit(1);
  }

  console.log(`✓ Deleted ${txCount || 0} transactions`);

  // Delete all monthly assignments
  const { error: assignError, count: assignCount } = await supabase
    .from('monthly_assignments')
    .delete()
    .eq('user_id', userId);

  if (assignError) {
    console.error('Error deleting assignments:', assignError);
    process.exit(1);
  }

  console.log(`✓ Deleted ${assignCount || 0} monthly assignments`);

  console.log('\n✅ Cleanup complete! Ready for fresh import.\n');
}

cleanup();
