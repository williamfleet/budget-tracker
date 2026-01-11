import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Navigation from '@/components/Navigation';
import AccountsPageClient from '@/components/accounts/AccountsPageClient';
import { getAccounts, getAllAccountBalances } from '@/lib/services/accounts';

export default async function AccountsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const accounts = await getAccounts(user.id);
  const balances = await getAllAccountBalances(user.id);

  // Convert balances Map to object for serialization
  const balancesObj = Object.fromEntries(balances);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation userEmail={user.email} />

      <main className="px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <AccountsPageClient accounts={accounts} balances={balancesObj} />
      </main>
    </div>
  );
}
