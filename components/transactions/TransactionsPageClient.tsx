'use client';

import { useState } from 'react';
import { TransactionWithCategory } from '@/lib/services/transactions';
import { Category, CategoryGroup } from '@/lib/types/budget';
import TransactionRow from './TransactionRow';
import TransactionCard from './TransactionCard';
import EditTransactionForm, {
  EditTransactionFormData,
} from './EditTransactionForm';
import BulkEditModal, { BulkEditFormData } from './BulkEditModal';
import {
  updateTransaction,
  deleteTransaction,
} from '@/app/actions/transactions';
import {
  bulkUpdateTransactions,
  bulkDeleteTransactions,
} from '@/app/actions/bulkTransactions';

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
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(
    new Set()
  );
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);

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

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTransactions(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTransactions.size === initialTransactions.length) {
      setSelectedTransactions(new Set());
    } else {
      setSelectedTransactions(
        new Set(initialTransactions.map((t) => t.id))
      );
    }
  };

  const handleBulkEdit = () => {
    if (selectedTransactions.size === 0) {
      alert('Please select at least one transaction');
      return;
    }
    setIsBulkEditModalOpen(true);
  };

  const handleBulkUpdate = async (updates: BulkEditFormData) => {
    await bulkUpdateTransactions({
      transactionIds: Array.from(selectedTransactions),
      updates,
    });
    setSelectedTransactions(new Set());
    setIsBulkEditModalOpen(false);
  };

  const handleBulkDelete = async () => {
    if (selectedTransactions.size === 0) {
      alert('Please select at least one transaction');
      return;
    }

    const count = selectedTransactions.size;
    if (
      !confirm(
        `Are you sure you want to delete ${count} ${count === 1 ? 'transaction' : 'transactions'}?`
      )
    ) {
      return;
    }

    await bulkDeleteTransactions(Array.from(selectedTransactions));
    setSelectedTransactions(new Set());
  };

  return (
    <>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                Transactions
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {total} {total === 1 ? 'transaction' : 'transactions'}
                {selectedTransactions.size > 0 && (
                  <span className="ml-2 text-indigo-600 dark:text-indigo-400 font-medium">
                    ({selectedTransactions.size} selected)
                  </span>
                )}
              </p>
            </div>
            {selectedTransactions.size > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={handleBulkEdit}
                  className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  Edit Selected
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                >
                  Delete Selected
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Transactions */}
        {initialTransactions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sm:p-8 text-center">
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
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
                  isSelected={selectedTransactions.has(transaction.id)}
                  onToggleSelect={handleToggleSelect}
                />
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      <input
                        type="checkbox"
                        checked={
                          initialTransactions.length > 0 &&
                          selectedTransactions.size === initialTransactions.length
                        }
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider"
                    >
                      Payee
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider"
                    >
                      Memo
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                  {initialTransactions.map((transaction) => (
                    <TransactionRow
                      key={transaction.id}
                      transaction={transaction}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      isSelected={selectedTransactions.has(transaction.id)}
                      onToggleSelect={handleToggleSelect}
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

      {/* Bulk Edit Modal */}
      <BulkEditModal
        isOpen={isBulkEditModalOpen}
        onClose={() => setIsBulkEditModalOpen(false)}
        selectedCount={selectedTransactions.size}
        categories={categories}
        groups={groups}
        onSubmit={handleBulkUpdate}
      />
    </>
  );
}
