import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Navigation from '@/components/Navigation';
import DebtsPageClient from '@/components/debts/DebtsPageClient';
import { getDebts, getDebtStatistics } from '@/lib/services/debts';
import { getAccounts } from '@/lib/services/accounts';

export default async function DebtsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch debts, accounts, and statistics
  const [debts, accounts, statistics] = await Promise.all([
    getDebts(user.id, true), // Include inactive debts
    getAccounts(user.id),
    getDebtStatistics(user.id),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation userEmail={user.email} />

      <main className="px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <DebtsPageClient
          debts={debts}
          accounts={accounts}
          statistics={statistics}
        />
      </main>
    </div>
  );
}
