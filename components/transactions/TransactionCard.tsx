'use client';

import { TransactionWithCategory } from '@/lib/services/transactions';
import { formatCurrency } from '@/lib/utils/money';
import { useState } from 'react';

interface TransactionCardProps {
  transaction: TransactionWithCategory;
  onEdit: (transaction: TransactionWithCategory) => void;
  onDelete: (id: string) => void;
}

export default function TransactionCard({
  transaction,
  onEdit,
  onDelete,
}: TransactionCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const isIncome = transaction.amount > 0;
  const formattedAmount = formatCurrency(Math.abs(transaction.amount));
  const amountColor = isIncome ? 'text-green-600' : 'text-red-600';

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      setIsDeleting(true);
      try {
        await onDelete(transaction.id);
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Failed to delete transaction');
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Top row: Date and Amount */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">
            {new Date(transaction.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          <p className="font-medium text-gray-900">
            {transaction.payee || 'No payee'}
          </p>
        </div>
        <p className={`text-lg font-bold ${amountColor}`}>
          {isIncome ? '+' : '-'}
          {formattedAmount}
        </p>
      </div>

      {/* Category */}
      <div className="mb-3">
        <p className="text-sm text-gray-600">
          {transaction.category_name || (
            <span className="text-green-600 font-medium">Income</span>
          )}
        </p>
        {transaction.memo && (
          <p className="text-xs text-gray-500 mt-1">{transaction.memo}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-3 border-t border-gray-100">
        <button
          onClick={() => onEdit(transaction)}
          className="flex-1 text-sm text-indigo-600 hover:text-indigo-900 font-medium"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex-1 text-sm text-red-600 hover:text-red-900 font-medium disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
