'use client';

import { useState } from 'react';
import { TransactionWithCategory } from '@/lib/services/transactions';
import { Category, CategoryGroup } from '@/lib/types/budget';
import TransactionRow from './TransactionRow';
import TransactionCard from './TransactionCard';
import EditTransactionForm, {
  EditTransactionFormData,
} from './EditTransactionForm';
import {
  updateTransaction,
  deleteTransaction,
} from '@/app/actions/transactions';

interface TransactionsPageClientProps {
  initialTransactions: TransactionWithCategory[];
  total: number;
  categories: Category[];
  groups: CategoryGroup[];
}

export default function TransactionsPageClient({
  initialTransactions,
  total,
  categories,
  groups,
}: TransactionsPageClientProps) {
  const [editingTransaction, setEditingTransaction] =
    useState<TransactionWithCategory | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEdit = (transaction: TransactionWithCategory) => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
    setEditingTransaction(null);
  };

  const handleUpdate = async (formData: EditTransactionFormData) => {
    await updateTransaction(formData);
    handleCloseEdit();
  };

  const handleDelete = async (id: string) => {
    await deleteTransaction(id);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Transactions
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {total} {total === 1 ? 'transaction' : 'transactions'}
          </p>
        </div>

        {/* Transactions */}
        {initialTransactions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 text-center">
            <p className="text-gray-600 text-sm sm:text-base">
              No transactions yet. Click the + button on the Budget page to add
              your first transaction.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="sm:hidden space-y-3">
              {initialTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Payee
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Memo
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {initialTransactions.map((transaction) => (
                    <TransactionRow
                      key={transaction.id}
                      transaction={transaction}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Edit Transaction Modal */}
      <EditTransactionForm
        isOpen={isEditModalOpen}
        onClose={handleCloseEdit}
        transaction={editingTransaction}
        categories={categories}
        groups={groups}
        onSubmit={handleUpdate}
      />
    </>
  );
}
