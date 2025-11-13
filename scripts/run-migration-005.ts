import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🔧 Running migration 005: Add archived column to categories\n');

  // Read the SQL file
  const sqlPath = path.join(
    process.cwd(),
    'supabase/migrations/005_add_archived_to_categories.sql'
  );
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  // Execute the SQL
  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    console.error('Error running migration:', error);
    console.log('\n⚠️  If you see an error about exec_sql not existing:');
    console.log('Run this SQL in Supabase SQL Editor instead:\n');
    console.log(sql);
    process.exit(1);
  }

  console.log('✅ Migration complete!\n');
  console.log('Categories now have an "archived" column.');
  console.log('Archived categories will not appear in current/future budget months.\n');
}

runMigration();
