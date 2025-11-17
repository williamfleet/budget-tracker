import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SignOutButton from '@/components/SignOutButton';
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-4 sm:gap-8">
              <h1 className="text-base sm:text-xl font-bold text-gray-900">
                Epps Budget
              </h1>
              <div className="flex gap-3 sm:gap-4">
                <a
                  href="/"
                  className="text-sm sm:text-base text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Budget
                </a>
                <a
                  href="/transactions"
                  className="text-sm sm:text-base text-gray-600 hover:text-gray-900 font-medium"
                >
                  Transactions
                </a>
                <a
                  href="/categories"
                  className="text-sm sm:text-base text-gray-600 hover:text-gray-900 font-medium"
                >
                  Categories
                </a>
                <a
                  href="/reports"
                  className="text-sm sm:text-base text-gray-600 hover:text-gray-900 font-medium"
                >
                  Reports
                </a>
                <a
                  href="/accounts"
                  className="text-sm sm:text-base text-gray-600 hover:text-gray-900 font-medium"
                >
                  Accounts
                </a>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden sm:inline text-sm text-gray-600">
                {user.email}
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>

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
