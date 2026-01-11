import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Navigation from '@/components/Navigation';
import BudgetPage from '@/components/BudgetPage';
import { getBudgetSummary, getCategories } from '@/lib/services/budget';
import { getAccounts } from '@/lib/services/accounts';
import { getCurrentMonth } from '@/lib/utils/date';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get month from URL query params or use current month
  const params = await searchParams;
  const selectedMonth = params.month || getCurrentMonth();

  // Fetch budget data, categories, and accounts
  const [budgetData, { groups, categories }, accounts] = await Promise.all([
    getBudgetSummary(user.id, selectedMonth),
    getCategories(user.id),
    getAccounts(user.id),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation userEmail={user.email} />

      <main className="px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <BudgetPage
          budgetData={budgetData}
          categories={categories}
          groups={groups}
          accounts={accounts}
          currentMonth={selectedMonth}
        />
      </main>
    </div>
  );
}
