'use client';

import { TransactionWithCategory } from '@/lib/services/transactions';
import { formatCurrency, milliunitsToDollars } from '@/lib/utils/money';
import { useState } from 'react';

interface TransactionRowProps {
  transaction: TransactionWithCategory;
  onEdit: (transaction: TransactionWithCategory) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export default function TransactionRow({
  transaction,
  onEdit,
  onDelete,
  isSelected = false,
  onToggleSelect,
}: TransactionRowProps) {
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
    <tr className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'dark:bg-gray-900'}`}>
      {/* Checkbox */}
      {onToggleSelect && (
        <td className="px-6 py-4 whitespace-nowrap">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(transaction.id)}
            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
          />
        </td>
      )}

      {/* Date */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
        {new Date(transaction.date + 'T00:00:00').toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </td>

      {/* Payee */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
        {transaction.payee || '-'}
      </td>

      {/* Category */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
        {transaction.category_name || (
          <span className="text-green-600 dark:text-green-400 font-medium">Income</span>
        )}
      </td>

      {/* Memo */}
      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
        {transaction.memo || '-'}
      </td>

      {/* Amount */}
      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${amountColor}`}>
        {isIncome ? '+' : '-'}
        {formattedAmount}
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
        <button
          onClick={() => onEdit(transaction)}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 mr-4"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-600 dark:text-red-400 hover:text-red-900 disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </td>
    </tr>
  );
}
