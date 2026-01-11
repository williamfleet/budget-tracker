import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Navigation from '@/components/Navigation';
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
      <Navigation userEmail={user.email} />

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
