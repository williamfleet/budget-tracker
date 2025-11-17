'use client';

import { Debt, DEBT_TYPE_ICONS } from '@/lib/types/debts';
import { formatCurrency } from '@/lib/utils/money';
import { deleteDebt, markDebtAsPaidOff } from '@/app/actions/debts';
import { useState } from 'react';

interface DebtCardProps {
  debt: Debt;
  onEdit: (debt: Debt) => void;
}

export default function DebtCard({ debt, onEdit }: DebtCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const progressPercentage =
    ((debt.original_balance - debt.balance) / debt.original_balance) * 100;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this debt?')) return;

    setIsDeleting(true);
    const result = await deleteDebt(debt.id);
    if (!result.success) {
      alert(result.error || 'Failed to delete debt');
      setIsDeleting(false);
    }
  };

  const handleMarkPaidOff = async () => {
    if (!confirm('Mark this debt as paid off?')) return;

    const result = await markDebtAsPaidOff(debt.id);
    if (!result.success) {
      alert(result.error || 'Failed to mark debt as paid off');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{DEBT_TYPE_ICONS[debt.type]}</span>
          <div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{debt.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
              {debt.interest_rate}% APR
              {debt.due_day && ` • Due: Day ${debt.due_day}`}
            </p>
          </div>
        </div>
        {!debt.is_active && (
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
            Paid Off
          </span>
        )}
      </div>

      <div className="space-y-3 mb-4">
        {/* Current Balance */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-300">Current Balance</span>
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(debt.balance)}
          </span>
        </div>

        {/* Minimum Payment */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-300">Minimum Payment</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {formatCurrency(debt.minimum_payment)}/mo
          </span>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
              {formatCurrency(debt.original_balance - debt.balance)} paid
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
              {progressPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {debt.notes && (
        <p className="text-xs text-gray-600 dark:text-gray-300 mb-4 italic">{debt.notes}</p>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(debt)}
          className="flex-1 px-3 py-2 text-sm bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 rounded-md hover:bg-indigo-100 font-medium"
        >
          Edit
        </button>
        {debt.is_active && debt.balance > 0 && (
          <button
            onClick={handleMarkPaidOff}
            className="flex-1 px-3 py-2 text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md hover:bg-green-100 font-medium"
          >
            Mark Paid Off
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-3 py-2 text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md hover:bg-red-100 font-medium disabled:opacity-50"
        >
          {isDeleting ? '...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
