'use client';

import { useState } from 'react';
import { Category, CategoryGroup } from '@/lib/types/budget';
import { formatCurrency, milliunitsToDollars, dollarsToMilliunits } from '@/lib/utils/money';

export interface Split {
  id: string; // temporary ID for UI, will be replaced on save
  category_id: string;
  amount: string; // dollar amount as string
  memo: string;
}

interface SplitEditorProps {
  splits: Split[];
  onSplitsChange: (splits: Split[]) => void;
  totalAmount: string; // the total transaction amount
  categories: Category[];
  groups: CategoryGroup[];
}

export default function SplitEditor({
  splits,
  onSplitsChange,
  totalAmount,
  categories,
  groups,
}: SplitEditorProps) {
  const addSplit = () => {
    const newSplit: Split = {
      id: `temp-${Date.now()}`,
      category_id: '',
      amount: '',
      memo: '',
    };
    onSplitsChange([...splits, newSplit]);
  };

  const removeSplit = (id: string) => {
    onSplitsChange(splits.filter((s) => s.id !== id));
  };

  const updateSplit = (id: string, field: keyof Split, value: string) => {
    onSplitsChange(
      splits.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  // Calculate remaining amount
  const totalAmountNum = parseFloat(totalAmount) || 0;
  const splitTotal = splits.reduce((sum, split) => {
    const amount = parseFloat(split.amount) || 0;
    return sum + amount;
  }, 0);
  const remaining = totalAmountNum - splitTotal;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Split Transaction
        </h3>
        <button
          type="button"
          onClick={addSplit}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
        >
          + Add Split
        </button>
      </div>

      {splits.length > 0 && (
        <>
          <div className="space-y-3">
            {splits.map((split, index) => (
              <div
                key={split.id}
                className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Split {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSplit(split.id)}
                    className="text-xs text-red-600 dark:text-red-400 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Category
                    </label>
                    <select
                      value={split.category_id}
                      onChange={(e) =>
                        updateSplit(split.id, 'category_id', e.target.value)
                      }
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:text-gray-100"
                    >
                      <option value="">Select category</option>
                      {groups.map((group) => (
                        <optgroup key={group.id} label={group.name}>
                          {categories
                            .filter((cat) => cat.group_id === group.id && !cat.archived)
                            .map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={split.amount}
                      onChange={(e) =>
                        updateSplit(split.id, 'amount', e.target.value)
                      }
                      placeholder="0.00"
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Memo (optional)
                  </label>
                  <input
                    type="text"
                    value={split.memo}
                    onChange={(e) =>
                      updateSplit(split.id, 'memo', e.target.value)
                    }
                    placeholder="Note for this split"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-600 dark:text-gray-100"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Total:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(Math.round(totalAmountNum * 1000))}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-600 dark:text-gray-400">Split:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(Math.round(splitTotal * 1000))}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-600 dark:text-gray-400">Remaining:</span>
              <span
                className={`font-medium ${
                  Math.abs(remaining) < 0.01
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {formatCurrency(Math.round(remaining * 1000))}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
