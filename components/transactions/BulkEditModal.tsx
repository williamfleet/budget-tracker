'use client';

import { useState } from 'react';
import { Category, CategoryGroup } from '@/lib/types/budget';

export interface BulkEditFormData {
  category_id?: string | null;
  payee?: string | null;
  memo?: string | null;
  date?: string | null;
}

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  categories: Category[];
  groups: CategoryGroup[];
  onSubmit: (data: BulkEditFormData) => Promise<void>;
}

export default function BulkEditModal({
  isOpen,
  onClose,
  selectedCount,
  categories,
  groups,
  onSubmit,
}: BulkEditModalProps) {
  const [updateCategory, setUpdateCategory] = useState(false);
  const [updatePayee, setUpdatePayee] = useState(false);
  const [updateMemo, setUpdateMemo] = useState(false);
  const [updateDate, setUpdateDate] = useState(false);

  const [categoryId, setCategoryId] = useState<string>('');
  const [payee, setPayee] = useState('');
  const [memo, setMemo] = useState('');
  const [date, setDate] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updates: BulkEditFormData = {};
    if (updateCategory) {
      updates.category_id = categoryId || null;
    }
    if (updatePayee) {
      updates.payee = payee || null;
    }
    if (updateMemo) {
      updates.memo = memo || null;
    }
    if (updateDate) {
      updates.date = date || null;
    }

    if (Object.keys(updates).length === 0) {
      alert('Please select at least one field to update');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(updates);
      handleClose();
    } catch (error) {
      console.error('Error updating transactions:', error);
      alert('Failed to update transactions');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setUpdateCategory(false);
    setUpdatePayee(false);
    setUpdateMemo(false);
    setUpdateDate(false);
    setCategoryId('');
    setPayee('');
    setMemo('');
    setDate('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Bulk Edit {selectedCount} {selectedCount === 1 ? 'Transaction' : 'Transactions'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Update */}
            <div>
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={updateCategory}
                  onChange={(e) => setUpdateCategory(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Update Category
                </span>
              </label>
              {updateCategory && (
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
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
              )}
            </div>

            {/* Payee Update */}
            <div>
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={updatePayee}
                  onChange={(e) => setUpdatePayee(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Update Payee
                </span>
              </label>
              {updatePayee && (
                <input
                  type="text"
                  value={payee}
                  onChange={(e) => setPayee(e.target.value)}
                  placeholder="Enter payee name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
              )}
            </div>

            {/* Memo Update */}
            <div>
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={updateMemo}
                  onChange={(e) => setUpdateMemo(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Update Memo
                </span>
              </label>
              {updateMemo && (
                <input
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="Enter memo"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
              )}
            </div>

            {/* Date Update */}
            <div>
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={updateDate}
                  onChange={(e) => setUpdateDate(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Update Date
                </span>
              </label>
              {updateDate && (
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
                />
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : 'Update'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
