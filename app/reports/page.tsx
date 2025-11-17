import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SignOutButton from '@/components/SignOutButton';
import ReportsPageClient from '@/components/reports/ReportsPageClient';
import {
  getSpendingByCategory,
  getMonthlyTrends,
  getIncomeVsExpenses,
} from '@/lib/services/reports';

export default async function ReportsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Default to current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split('T')[0];
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split('T')[0];

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
                  className="text-sm sm:text-base text-gray-600 hover:text-gray-900 font-medium"
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
                  className="text-sm sm:text-base text-indigo-600 hover:text-indigo-800 font-medium"
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
        <ReportsPageClient
          initialSpendingByCategory={spendingByCategory}
          initialMonthlyTrends={monthlyTrends}
          initialIncomeVsExpenses={incomeVsExpenses}
        />
      </main>
    </div>
  );
}
