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
 * Get the complete budget summary for the current month
 */
export async function getBudgetSummary(userId: string): Promise<BudgetSummary> {
  const supabase = await createClient();
  const currentMonth = getCurrentMonth();
  const { start, end } = getMonthRange(currentMonth);

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

  // Fetch all transactions for the current month
  const { data: transactions, error: transactionsError } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', start)
    .lte('date', end);

  if (transactionsError) throw transactionsError;

  // Fetch all monthly assignments for the current month
  const { data: assignments, error: assignmentsError } = await supabase
    .from('monthly_assignments')
    .select('*')
    .eq('user_id', userId)
    .eq('month', currentMonth);

  if (assignmentsError) throw assignmentsError;

  // Calculate Activity per category (sum of spending)
  const activityByCategory = new Map<string, number>();
  transactions?.forEach((tx: Transaction) => {
    if (tx.category_id) {
      const current = activityByCategory.get(tx.category_id) || 0;
      activityByCategory.set(tx.category_id, current + tx.amount);
    }
  });

  // Get Assigned amounts per category
  const assignedByCategory = new Map<string, number>();
  assignments?.forEach((assignment: MonthlyAssignment) => {
    assignedByCategory.set(assignment.category_id, assignment.assigned_amount);
  });

  // Calculate Available per category
  // For now: Available = Assigned + Activity
  // TODO: Implement rollover from previous month
  const availableByCategory = new Map<string, number>();
  categories?.forEach((category: Category) => {
    const assigned = assignedByCategory.get(category.id) || 0;
    const activity = activityByCategory.get(category.id) || 0;
    availableByCategory.set(category.id, assigned + activity);
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

  // Calculate total income (transactions with no category_id and positive amount)
  const totalIncome =
    transactions
      ?.filter((tx: Transaction) => tx.category_id === null && tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0) || 0;

  // Calculate total assigned across all categories
  const totalAssigned = groupsData.reduce(
    (sum, group) => sum + group.totalAssigned,
    0
  );

  // Money to Assign = Total Income - Total Assigned
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
