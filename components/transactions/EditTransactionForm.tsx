'use client';

import { useState, useEffect } from 'react';
import { Category, CategoryGroup } from '@/lib/types/budget';
import { TransactionWithCategory } from '@/lib/services/transactions';
import { milliunitsToDollars } from '@/lib/utils/money';
import SplitEditor, { Split } from './SplitEditor';

interface EditTransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionWithCategory | null;
  categories: Category[];
  groups: CategoryGroup[];
  onSubmit: (formData: EditTransactionFormData) => Promise<void>;
}

export interface EditTransactionFormData {
  id: string;
  type: 'expense' | 'income';
  amount: string;
  date: string;
  payee: string;
  category_id: string | null;
  account_id: string | null;
  memo: string;
  splits?: Split[];
}

export default function EditTransactionForm({
  isOpen,
  onClose,
  transaction,
  categories,
  groups,
  onSubmit,
}: EditTransactionFormProps) {
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [payee, setPayee] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [memo, setMemo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSplit, setIsSplit] = useState(false);
  const [splits, setSplits] = useState<Split[]>([]);

  // Populate form when transaction changes
  useEffect(() => {
    if (transaction) {
      setType(transaction.amount > 0 ? 'income' : 'expense');
      setAmount(milliunitsToDollars(Math.abs(transaction.amount)).toFixed(2));
      setDate(transaction.date);
      setPayee(transaction.payee || '');
      setCategoryId(transaction.category_id || '');
      setAccountId(transaction.account_id || '');
      setMemo(transaction.memo || '');

      // Handle splits
      if (transaction.is_split && transaction.splits) {
        setIsSplit(true);
        setSplits(
          transaction.splits.map((split) => ({
            id: split.id,
            category_id: split.category_id,
            amount: milliunitsToDollars(Math.abs(split.amount)).toFixed(2),
            memo: split.memo || '',
          }))
        );
      } else {
        setIsSplit(false);
        setSplits([]);
      }
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!transaction) return;

      // Validate amount
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        setError('Please enter a valid amount');
        setIsSubmitting(false);
        return;
      }

      // Validate splits if enabled
      if (isSplit && type === 'expense') {
        if (splits.length === 0) {
          setError('Please add at least one split');
          setIsSubmitting(false);
          return;
        }

        // Validate that all splits have categories
        if (splits.some((s) => !s.category_id)) {
          setError('All splits must have a category');
          setIsSubmitting(false);
          return;
        }

        // Validate that split amounts add up to total
        const splitTotal = splits.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
        if (Math.abs(splitTotal - amountNum) > 0.01) {
          setError('Split amounts must add up to the total amount');
          setIsSubmitting(false);
          return;
        }
      }

      // Validate category for non-split expenses
      if (!isSplit && type === 'expense' && !categoryId) {
        setError('Please select a category');
        setIsSubmitting(false);
        return;
      }

      await onSubmit({
        id: transaction.id,
        type,
        amount,
        date,
        payee,
        category_id: type === 'income' || isSplit ? null : categoryId,
        account_id: accountId || null,
        memo,
        splits: isSplit && type === 'expense' ? splits : undefined,
      });

      onClose();
    } catch (err) {
      setError('Failed to update transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !transaction) return null;

  // Group categories by group
  const categoriesByGroup = groups.map((group) => ({
    group,
    categories: categories.filter((cat) => cat.group_id === group.id),
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white dark:bg-gray-800 w-full sm:max-w-lg sm:rounded-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Edit Transaction</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-300"
            type="button"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 px-4 rounded-md font-medium ${
                type === 'expense'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2 px-4 rounded-md font-medium ${
                type === 'income'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Income
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Amount */}
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-400 dark:text-gray-500">$</span>
              <input
                type="number"
                id="amount"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Date
            </label>
            <input
              type="date"
              id="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Payee */}
          <div>
            <label
              htmlFor="payee"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Payee
            </label>
            <input
              type="text"
              id="payee"
              value={payee}
              onChange={(e) => setPayee(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Starbucks"
            />
          </div>

          {/* Category (only for expenses and not split) */}
          {type === 'expense' && !isSplit && (
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Category
              </label>
              <select
                id="category"
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="">Select a category</option>
                {categoriesByGroup.map(({ group, categories: groupCats }) => (
                  <optgroup key={group.id} label={group.name}>
                    {groupCats.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          )}

          {/* Split Toggle (only for expenses) */}
          {type === 'expense' && (
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isSplit}
                  onChange={(e) => {
                    setIsSplit(e.target.checked);
                    if (!e.target.checked) {
                      setSplits([]);
                    }
                  }}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Split across multiple categories
                </span>
              </label>
            </div>
          )}

          {/* Split Editor */}
          {type === 'expense' && isSplit && (
            <SplitEditor
              splits={splits}
              onSplitsChange={setSplits}
              totalAmount={amount}
              categories={categories}
              groups={groups}
            />
          )}

          {/* Memo */}
          <div>
            <label
              htmlFor="memo"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Memo (optional)
            </label>
            <input
              type="text"
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Add a note..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 px-4 rounded-md font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
