import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SignOutButton from '@/components/SignOutButton';
import ReportsPageClient from '@/components/reports/ReportsPageClient';
import {
  getSpendingByCategory,
  getMonthlyTrends,
  getIncomeVsExpenses,
} from '@/lib/services/reports';
import { getCurrentMonth, getMonthRange } from '@/lib/utils/date';

export default async function ReportsPage({
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

  // Get month from URL params or default to current month
  const params = await searchParams;
  const selectedMonth = params.month || getCurrentMonth();
  const { start: startOfMonth, end: endOfMonth } = getMonthRange(selectedMonth);

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .eq('archived', false)
    .order('name', { ascending: true });

  // Fetch report data
  const spendingByCategory = await getSpendingByCategory(
    user.id,
    startOfMonth,
    endOfMonth
  );
  const monthlyTrends = await getMonthlyTrends(user.id, 6);
  const incomeVsExpenses = await getIncomeVsExpenses(
    user.id,
    startOfMonth,
    endOfMonth
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-4 sm:gap-8">
              <h1 className="text-base sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                Epps Budget
              </h1>
              <div className="flex gap-3 sm:gap-4">
                <a
                  href="/"
                  className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 dark:text-gray-100 font-medium"
                >
                  Budget
                </a>
                <a
                  href="/transactions"
                  className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 dark:text-gray-100 font-medium"
                >
                  Transactions
                </a>
                <a
                  href="/categories"
                  className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 dark:text-gray-100 font-medium"
                >
                  Categories
                </a>
                <a
                  href="/reports"
                  className="text-sm sm:text-base text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 dark:text-indigo-300 font-medium"
                >
                  Reports
                </a>
                <a
                  href="/accounts"
                  className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 dark:text-gray-100 font-medium"
                >
                  Accounts
                </a>
                <a
                  href="/debts"
                  className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 dark:text-gray-100 font-medium"
                >
                  Debts
                </a>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden sm:inline text-sm text-gray-600 dark:text-gray-300">
                {user.email}
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <ReportsPageClient
          initialSpendingByCategory={spendingByCategory}
          initialMonthlyTrends={monthlyTrends}
          initialIncomeVsExpenses={incomeVsExpenses}
          categories={categories || []}
          selectedMonth={selectedMonth}
        />
      </main>
    </div>
  );
}
