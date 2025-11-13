'use client';

import { useState, useEffect } from 'react';
import { Category, CategoryGroup } from '@/lib/types/budget';
import { milliunitsToDollars } from '@/lib/utils/money';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  groups: CategoryGroup[];
  category?: Category | null; // If editing, pass the category
}

export interface CategoryFormData {
  id?: string;
  name: string;
  group_id: string;
  target_amount: string;
}

export default function CategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  groups,
  category,
}: CategoryFormModalProps) {
  const [name, setName] = useState('');
  const [groupId, setGroupId] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!category;

  // Initialize form with category data if editing
  useEffect(() => {
    if (category) {
      setName(category.name);
      setGroupId(category.group_id);
      setTargetAmount(milliunitsToDollars(category.target_amount).toFixed(2));
    } else {
      setName('');
      setGroupId(groups[0]?.id || '');
      setTargetAmount('0.00');
    }
  }, [category, groups]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!name.trim()) {
        setError('Category name is required');
        setIsSubmitting(false);
        return;
      }

      if (!groupId) {
        setError('Please select a category group');
        setIsSubmitting(false);
        return;
      }

      await onSubmit({
        id: category?.id,
        name: name.trim(),
        group_id: groupId,
        target_amount: targetAmount,
      });

      // Reset form
      setName('');
      setGroupId(groups[0]?.id || '');
      setTargetAmount('0.00');
      onClose();
    } catch (err) {
      setError('Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-md sm:rounded-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              {isEditing ? 'Edit Category' : 'New Category'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
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
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Category Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Groceries"
              required
            />
          </div>

          {/* Category Group */}
          <div>
            <label
              htmlFor="group"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category Group
            </label>
            <select
              id="group"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          {/* Target Amount */}
          <div>
            <label
              htmlFor="target"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Monthly Target Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                id="target"
                step="0.01"
                min="0"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              The amount you plan to budget for this category each month
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
