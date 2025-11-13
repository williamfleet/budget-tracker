# Historical Data Import Instructions

This guide will help you import your historical budget data from CSV files.

## Prerequisites

1. All your CSV files (01-25.csv through 11-25.csv) should be in the `historical-data/` folder
2. Each CSV file should follow the same format as the example (01-25.csv)

## Steps to Import

### 1. Get Your User ID

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on "Authentication" in the left sidebar
4. Click on "Users"
5. Find your user (eppswf@gmail.com)
6. Click on the user to open the details
7. Copy the UUID shown as "UID" - this is your USER_ID

### 2. Add Remaining CSV Files

Currently only `01-25.csv` is present. Add the remaining files:
- 02-25.csv (February 2025)
- 03-25.csv (March 2025)
- 04-25.csv (April 2025)
- 05-25.csv (May 2025)
- 06-25.csv (June 2025)
- 07-25.csv (July 2025)
- 08-25.csv (August 2025)
- 09-25.csv (September 2025)
- 10-25.csv (October 2025)
- 11-25.csv (November 2025)

All files should be placed in the `historical-data/` folder.

### 3. Run the Import

Open your terminal and run:

```bash
USER_ID=your-user-id-here npm run import-historical
```

Replace `your-user-id-here` with the UUID you copied in step 1.

### 4. What the Import Does

The script will:
1. Read all CSV files from the `historical-data/` folder in order
2. For each month:
   - Create an income transaction with the total monthly income
   - Create monthly assignments for each category's "Assigned" amount
   - Create aggregate spending transactions for each category's "Activity" amount
3. All transactions are dated on the last day of each month
4. Categories are matched by name to your existing category setup

### 5. Verify the Import

After the import completes:
1. Visit http://localhost:3000
2. Navigate through the months using the arrow buttons
3. Verify that:
   - Money to Assign shows correct amounts
   - Assigned amounts match your CSV files
   - Activity amounts match your CSV files
   - Available balances roll over correctly month to month

## Troubleshooting

- **Error: "Please set USER_ID environment variable"** - Make sure you're passing the USER_ID when running the command
- **Warning: "Skipping unknown category"** - Some category names in your CSV don't match the seeded categories. You may need to add these categories manually first
- **No CSV files found** - Make sure all CSV files are in the `historical-data/` folder with the correct naming format (MM-YY.csv)

## CSV Format

Each CSV file should have:
- Column I (index 8) on the first line: Total monthly income
- Row 3+: Category data with columns:
  - Column A: Category name
  - Column B: Assigned amount
  - Column C: Activity amount

The script will stop reading when it encounters an empty line or a line starting with ",,"
