'use client';

import { TransactionWithCategory } from '@/lib/services/transactions';
import { formatCurrency, milliunitsToDollars } from '@/lib/utils/money';
import { useState } from 'react';

interface TransactionRowProps {
  transaction: TransactionWithCategory;
  onEdit: (transaction: TransactionWithCategory) => void;
  onDelete: (id: string) => void;
}

export default function TransactionRow({
  transaction,
  onEdit,
  onDelete,
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
    <tr className="hover:bg-gray-50">
      {/* Date */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {new Date(transaction.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </td>

      {/* Payee */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {transaction.payee || '-'}
      </td>

      {/* Category */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {transaction.category_name || (
          <span className="text-green-600 font-medium">Income</span>
        )}
      </td>

      {/* Memo */}
      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
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
          className="text-indigo-600 hover:text-indigo-900 mr-4"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-900 disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </td>
    </tr>
  );
}
