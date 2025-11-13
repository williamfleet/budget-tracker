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
                  className="text-sm sm:text-base text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Transactions
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
