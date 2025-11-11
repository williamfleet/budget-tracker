import { createClient } from '@/lib/supabase/server';
import {
  CategoryGroup,
  Category,
  Transaction,
  MonthlyAssignment,
  BudgetSummary,
  CategoryGroupBudgetData,
  CategoryBudgetData,
} from '@/lib/types/budget';
import { getCurrentMonth, getMonthRange } from '@/lib/utils/date';

/**
 * Get the complete budget summary for a specific month with rollover
 */
export async function getBudgetSummary(
  userId: string,
  month?: string
): Promise<BudgetSummary> {
  const supabase = await createClient();
  const targetMonth = month || getCurrentMonth();
  const { start, end } = getMonthRange(targetMonth);

  // Fetch all category groups
  const { data: groups, error: groupsError } = await supabase
    .from('category_groups')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });

  if (groupsError) throw groupsError;

  // Fetch all categories
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });

  if (categoriesError) throw categoriesError;

  // Fetch transactions for current month only (for Activity)
  const { data: currentMonthTransactions, error: currentTxError } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', start)
    .lte('date', end);

  if (currentTxError) throw currentTxError;

  // Fetch ALL transactions up to end of this month (for Available rollover)
  const { data: allTransactions, error: allTxError } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .lte('date', end);

  if (allTxError) throw allTxError;

  // Fetch monthly assignments for current month only (for Assigned)
  const { data: currentMonthAssignments, error: currentAssignError } =
    await supabase
      .from('monthly_assignments')
      .select('*')
      .eq('user_id', userId)
      .eq('month', targetMonth);

  if (currentAssignError) throw currentAssignError;

  // Fetch ALL assignments up to and including this month (for Available rollover)
  const { data: allAssignments, error: allAssignError } = await supabase
    .from('monthly_assignments')
    .select('*')
    .eq('user_id', userId)
    .lte('month', targetMonth);

  if (allAssignError) throw allAssignError;

  // Calculate Activity per category (current month only)
  const activityByCategory = new Map<string, number>();
  currentMonthTransactions?.forEach((tx: Transaction) => {
    if (tx.category_id) {
      const current = activityByCategory.get(tx.category_id) || 0;
      activityByCategory.set(tx.category_id, current + tx.amount);
    }
  });

  // Get Assigned amounts per category (current month only)
  const assignedByCategory = new Map<string, number>();
  currentMonthAssignments?.forEach((assignment: MonthlyAssignment) => {
    assignedByCategory.set(assignment.category_id, assignment.assigned_amount);
  });

  // Calculate Available per category WITH ROLLOVER
  // Available = sum(all assignments up to this month) + sum(all transactions up to this month)
  const availableByCategory = new Map<string, number>();
  categories?.forEach((category: Category) => {
    // Sum all assignments for this category up to and including target month
    const totalAssigned =
      allAssignments
        ?.filter((a: MonthlyAssignment) => a.category_id === category.id)
        .reduce((sum, a) => sum + a.assigned_amount, 0) || 0;

    // Sum all transactions for this category up to end of target month
    const totalActivity =
      allTransactions
        ?.filter((tx: Transaction) => tx.category_id === category.id)
        .reduce((sum, tx) => sum + tx.amount, 0) || 0;

    // Available = Total Assigned + Total Activity (activity is negative for spending)
    availableByCategory.set(category.id, totalAssigned + totalActivity);
  });

  // Build the category group data structure
  const groupsData: CategoryGroupBudgetData[] = (groups || []).map(
    (group: CategoryGroup) => {
      const groupCategories = (categories || [])
        .filter((cat: Category) => cat.group_id === group.id)
        .map((cat: Category) => {
          const assigned = assignedByCategory.get(cat.id) || 0;
          const activity = activityByCategory.get(cat.id) || 0;
          const available = availableByCategory.get(cat.id) || 0;

          return {
            id: cat.id,
            name: cat.name,
            target_amount: cat.target_amount,
            sort_order: cat.sort_order,
            assigned,
            activity,
            available,
          } as CategoryBudgetData;
        });

      const totalAssigned = groupCategories.reduce(
        (sum, cat) => sum + cat.assigned,
        0
      );
      const totalActivity = groupCategories.reduce(
        (sum, cat) => sum + cat.activity,
        0
      );
      const totalAvailable = groupCategories.reduce(
        (sum, cat) => sum + cat.available,
        0
      );

      return {
        id: group.id,
        name: group.name,
        sort_order: group.sort_order,
        categories: groupCategories,
        totalAssigned,
        totalActivity,
        totalAvailable,
      };
    }
  );

  // Calculate total income for current month only
  const totalIncome =
    currentMonthTransactions
      ?.filter((tx: Transaction) => tx.category_id === null && tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0) || 0;

  // Calculate total assigned for current month only
  const totalAssigned = groupsData.reduce(
    (sum, group) => sum + group.totalAssigned,
    0
  );

  // Money to Assign = Total Income - Total Assigned (current month only)
  const moneyToAssign = totalIncome - totalAssigned;

  return {
    moneyToAssign,
    totalIncome,
    totalAssigned,
    groups: groupsData,
  };
}

/**
 * Get all categories for a user (for dropdowns, etc.)
 */
export async function getCategories(
  userId: string
): Promise<{ groups: CategoryGroup[]; categories: Category[] }> {
  const supabase = await createClient();

  const { data: groups, error: groupsError } = await supabase
    .from('category_groups')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });

  if (groupsError) throw groupsError;

  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });

  if (categoriesError) throw categoriesError;

  return {
    groups: groups || [],
    categories: categories || [],
  };
}
