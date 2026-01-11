import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Navigation from '@/components/Navigation';
import TransactionsPageClient from '@/components/transactions/TransactionsPageClient';
import { getTransactions } from '@/lib/services/transactions';
import { getCategories } from '@/lib/services/budget';

export default async function TransactionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch transactions and categories
  const [{ transactions, total }, { groups, categories }] = await Promise.all([
    getTransactions(user.id),
    getCategories(user.id),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation userEmail={user.email} />

      <main className="px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <TransactionsPageClient
          initialTransactions={transactions}
          total={total}
          categories={categories}
          groups={groups}
        />
      </main>
    </div>
  );
}
