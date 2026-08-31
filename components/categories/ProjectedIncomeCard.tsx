'use client';

import { useState } from 'react';
import { IncomeSource } from '@/lib/types/income';
import { formatCurrency } from '@/lib/utils/money';
import {
  createIncomeSource,
  updateIncomeSource,
  deleteIncomeSource,
} from '@/app/actions/income';
import IncomeSourceRow from './IncomeSourceRow';

interface ProjectedIncomeCardProps {
  incomeSources: IncomeSource[];
  totalTarget: number; // in milliunits
}

export default function ProjectedIncomeCard({
  incomeSources,
  totalTarget,
}: ProjectedIncomeCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftAmount, setDraftAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const totalProjected = incomeSources.reduce(
    (sum, source) => sum + source.amount,
    0
  );
  const difference = totalProjected - totalTarget;

  const differenceColor =
    difference > 0
      ? 'text-green-600 dark:text-green-400'
      : difference < 0
      ? 'text-red-600 dark:text-red-400'
      : 'text-gray-600 dark:text-gray-300';

  const differenceLabel =
    difference > 0 ? 'left over' : difference < 0 ? 'short' : 'break even';

  const handleCancelAdd = () => {
    setIsAdding(false);
    setDraftName('');
    setDraftAmount('');
  };

  const handleSaveAdd = async () => {
    if (!draftName.trim()) {
      alert('Please enter a name for this income source');
      return;
    }

    try {
      setIsSaving(true);
      await createIncomeSource({ name: draftName.trim(), amount: draftAmount });
      handleCancelAdd();
    } catch (error: any) {
      alert(error.message || 'Failed to add income source');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDraftKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveAdd();
    } else if (e.key === 'Escape') {
      handleCancelAdd();
    }
  };

  const handleUpdate = async (
    source: IncomeSource,
    name: string,
    amount: string
  ) => {
    await updateIncomeSource({ id: source.id, name, amount });
  };

  const handleDelete = async (source: IncomeSource) => {
    if (!confirm(`Remove "${source.name}" from projected income?`)) return;

    try {
      await deleteIncomeSource(source.id);
    } catch (error: any) {
      alert(error.message || 'Failed to remove income source');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
      {/* Card Header */}
      <div className="flex items-center justify-between gap-2 bg-gray-50 dark:bg-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
            Projected Monthly Income
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Planning only — not counted anywhere else in the budget
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="shrink-0 px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-xs sm:text-sm"
        >
          Add Income
        </button>
      </div>

      {/* Income Lines */}
      {incomeSources.length === 0 && !isAdding ? (
        <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
          No projected income yet — add a line to compare against your targets
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {incomeSources.map((source) => (
            <IncomeSourceRow
              key={source.id}
              source={source}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}

          {isAdding && (
            <div className="flex items-center gap-2 px-4 py-3">
              <input
                type="text"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={handleDraftKeyDown}
                placeholder="Income source"
                className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                autoFocus
              />
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={draftAmount}
                  onChange={(e) => setDraftAmount(e.target.value)}
                  onKeyDown={handleDraftKeyDown}
                  placeholder="0.00"
                  className="w-24 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <button
                onClick={handleSaveAdd}
                disabled={isSaving}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 text-sm font-medium disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={handleCancelAdd}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-3 space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-300">
            Projected Income
          </span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {formatCurrency(totalProjected)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-300">
            Target Expenses
          </span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {formatCurrency(totalTarget)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm pt-1 border-t border-gray-200 dark:border-gray-700">
          <span className="font-medium text-gray-700 dark:text-gray-200">
            Difference
          </span>
          <span className={`font-bold ${differenceColor}`}>
            {formatCurrency(Math.abs(difference))} {differenceLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
