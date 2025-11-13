import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { parse } from 'csv-parse/sync';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseServiceKey) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY not found in environment');
  console.error('Please add it to your .env.local file');
  console.error('Find it in: Supabase Dashboard > Project Settings > API > service_role key');
  process.exit(1);
}

// Create Supabase client with service role key (bypasses RLS for imports)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper to convert dollar string to milliunits
function parseDollarString(str: string): number {
  if (!str || str.trim() === '') return 0;
  const cleaned = str.replace(/[$,]/g, '');
  const amount = parseFloat(cleaned);
  return isNaN(amount) ? 0 : Math.round(amount * 1000);
}

// Get the last day of a month
function getLastDayOfMonth(monthString: string): string {
  const [year, month] = monthString.split('-').map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  const monthNum = String(month).padStart(2, '0');
  const dayNum = String(lastDay).padStart(2, '0');
  return `${year}-${monthNum}-${dayNum}`;
}

interface CategoryMapping {
  [name: string]: string; // category name -> category id
}

interface ImportData {
  month: string;
  totalIncome: number;
  categories: {
    name: string;
    assigned: number;
    activity: number;
  }[];
}

async function getCategoryMapping(userId: string): Promise<CategoryMapping> {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name')
    .eq('user_id', userId);

  if (error) throw error;

  const mapping: CategoryMapping = {};
  categories?.forEach((cat) => {
    mapping[cat.name] = cat.id;
  });

  return mapping;
}

function parseCSV(filePath: string, month: string): ImportData {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Parse CSV with proper handling of quoted values
  const records = parse(content, {
    skip_empty_lines: true,
    relax_column_count: true,
  }) as string[][];

  const data: ImportData = {
    month,
    totalIncome: 0,
    categories: [],
  };

  // Extract total income from third row (index 2), column I (index 8)
  // Row format: Bills,"$2,322.15","$2,322.15",$0.00,,,,,"$4,312.51",
  if (records.length > 2 && records[2].length >= 9) {
    data.totalIncome = parseDollarString(records[2][8]);
  }

  // Parse category data starting from row 3 (index 2)
  for (let i = 2; i < records.length; i++) {
    const row = records[i];

    // Stop at empty rows or summary rows
    if (!row[0] || row[0].trim() === '' || row[2] === 'Total Available') {
      break;
    }

    const categoryName = row[0]?.trim();
    const assigned = row[1]?.trim();
    const activity = row[2]?.trim();

    // Skip if no category name
    if (!categoryName) continue;

    const assignedValue = parseDollarString(assigned);
    const activityValue = parseDollarString(activity);

    // Only add if it has actual data (either assigned or activity)
    if (assignedValue > 0 || activityValue !== 0) {
      data.categories.push({
        name: categoryName,
        assigned: assignedValue,
        activity: activityValue,
      });
    }
  }

  return data;
}

async function importMonth(
  userId: string,
  data: ImportData,
  categoryMapping: CategoryMapping
): Promise<void> {
  console.log(`\nImporting ${data.month}...`);
  console.log(`Total Income: $${(data.totalIncome / 1000).toFixed(2)}`);
  console.log(`Categories to import: ${data.categories.length}`);

  const lastDayOfMonth = getLastDayOfMonth(data.month);

  // 1. Create income transaction if there's income
  if (data.totalIncome > 0) {
    const { error: incomeError } = await supabase.from('transactions').insert({
      user_id: userId,
      category_id: null,
      date: lastDayOfMonth,
      payee: `${data.month.substring(0, 7)} Income`,
      amount: data.totalIncome,
      memo: 'Aggregated monthly income from CSV import',
    });

    if (incomeError) {
      console.error('Error creating income:', incomeError);
      throw incomeError;
    }
    console.log(`✓ Created income transaction`);
  }

  // 2. Process each category
  let assignmentsCreated = 0;
  let transactionsCreated = 0;
  let skipped = 0;

  for (const cat of data.categories) {
    const categoryId = categoryMapping[cat.name];

    if (!categoryId) {
      console.log(`  ⚠ Skipping unknown category: ${cat.name}`);
      skipped++;
      continue;
    }

    // Create monthly assignment if assigned > 0
    if (cat.assigned > 0) {
      const { error: assignError } = await supabase
        .from('monthly_assignments')
        .insert({
          user_id: userId,
          category_id: categoryId,
          month: data.month,
          assigned_amount: cat.assigned,
        });

      if (assignError) {
        console.error(`Error creating assignment for ${cat.name}:`, assignError);
      } else {
        assignmentsCreated++;
      }
    }

    // Create aggregate transaction if activity != 0
    if (cat.activity !== 0) {
      const { error: txError } = await supabase.from('transactions').insert({
        user_id: userId,
        category_id: categoryId,
        date: lastDayOfMonth,
        payee: `${data.month.substring(0, 7)} Spending`,
        amount: -cat.activity, // Negate activity since CSV shows spending as positive
        memo: 'Aggregated monthly spending from CSV import',
      });

      if (txError) {
        console.error(`Error creating transaction for ${cat.name}:`, txError);
      } else {
        transactionsCreated++;
      }
    }
  }

  console.log(
    `✓ Created ${assignmentsCreated} assignments, ${transactionsCreated} transactions`
  );
  if (skipped > 0) {
    console.log(`⚠ Skipped ${skipped} unknown categories`);
  }
}

async function main() {
  console.log('🚀 Historical Data Import Tool\n');

  // Get user ID from environment or prompt
  const userId = process.env.USER_ID;
  if (!userId) {
    console.error('ERROR: Please set USER_ID environment variable');
    console.error('Example: USER_ID=your-uuid-here npm run import-historical');
    process.exit(1);
  }

  console.log(`User ID: ${userId}\n`);

  // Get category mapping
  console.log('Fetching category mappings...');
  const categoryMapping = await getCategoryMapping(userId);
  console.log(`Found ${Object.keys(categoryMapping).length} categories\n`);

  // Find all CSV files
  const historicalDataDir = path.join(process.cwd(), 'historical-data');
  const files = fs
    .readdirSync(historicalDataDir)
    .filter((f) => f.endsWith('.csv'))
    .sort();

  console.log(`Found ${files.length} CSV files to import:`);
  files.forEach((f) => console.log(`  - ${f}`));
  console.log();

  // Confirm before proceeding
  console.log('⚠️  This will create historical data in your database.');
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Process each file
  for (const file of files) {
    const filePath = path.join(historicalDataDir, file);

    // Extract month from filename (e.g., "01-25.csv" -> "2025-01-01")
    const match = file.match(/(\d{2})-(\d{2})\.csv/);
    if (!match) {
      console.log(`⚠ Skipping invalid filename: ${file}`);
      continue;
    }

    const [, month, year] = match;
    const monthString = `20${year}-${month}-01`;

    try {
      const data = parseCSV(filePath, monthString);
      await importMonth(userId, data, categoryMapping);
    } catch (error) {
      console.error(`❌ Error importing ${file}:`, error);
    }
  }

  console.log('\n✅ Import complete!');
  console.log('\nNext steps:');
  console.log('1. Visit http://localhost:3000');
  console.log('2. Navigate through months to verify data');
  console.log('3. Check that Available balances roll over correctly');
}

main();
