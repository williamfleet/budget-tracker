import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SignOutButton from '@/components/SignOutButton';
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-gray-900">Epps Budget</h1>
              <div className="flex gap-4">
                <a
                  href="/"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Budget
                </a>
                <a
                  href="/transactions"
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Transactions
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="px-4 sm:px-6 lg:px-8 py-8">
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
