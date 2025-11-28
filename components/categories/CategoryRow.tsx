'use client';

import { useState } from 'react';
import { Category } from '@/lib/types/budget';
import { formatCurrency, formatOrdinalDay, milliunitsToDollars } from '@/lib/utils/money';
import { updateCategory, updateCategoryTarget } from '@/app/actions/categories';

interface CategoryRowProps {
  category: Category;
  onEdit: (category: Category) => void;
  onArchive: (category: Category) => void;
}

export default function CategoryRow({
  category,
  onEdit,
  onArchive,
}: CategoryRowProps) {
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [isEditingChecking, setIsEditingChecking] = useState(false);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [dueDate, setDueDate] = useState(category.charge_day?.toString() || '');
  const [isChecking, setIsChecking] = useState(category.is_checking);
  const [targetValue, setTargetValue] = useState('');

  const handleDueDateSave = async () => {
    try {
      await updateCategory({
        id: category.id,
        name: category.name,
        target_amount: (category.target_amount / 1000).toFixed(2),
        charge_day: dueDate,
        is_checking: category.is_checking,
      });
      setIsEditingDueDate(false);
    } catch (error: any) {
      alert(error.message || 'Failed to update due date');
      setDueDate(category.charge_day?.toString() || '');
    }
  };

  const handleCheckingSave = async (newValue: boolean) => {
    try {
      setIsChecking(newValue);
      await updateCategory({
        id: category.id,
        name: category.name,
        target_amount: (category.target_amount / 1000).toFixed(2),
        charge_day: category.charge_day?.toString() || '',
        is_checking: newValue,
      });
    } catch (error: any) {
      alert(error.message || 'Failed to update checking status');
      setIsChecking(category.is_checking);
    }
  };

  const handleDueDateKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleDueDateSave();
    } else if (e.key === 'Escape') {
      setDueDate(category.charge_day?.toString() || '');
      setIsEditingDueDate(false);
    }
  };

  const handleStartEditTarget = () => {
    setTargetValue(milliunitsToDollars(category.target_amount).toFixed(2));
    setIsEditingTarget(true);
  };

  const handleCancelEditTarget = () => {
    setIsEditingTarget(false);
    setTargetValue('');
  };

  const handleSaveTarget = async () => {
    try {
      await updateCategoryTarget(category.id, targetValue);
      setIsEditingTarget(false);
    } catch (error: any) {
      alert(error.message || 'Failed to update target amount');
      setTargetValue(milliunitsToDollars(category.target_amount).toFixed(2));
    }
  };

  const handleTargetKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTarget();
    } else if (e.key === 'Escape') {
      handleCancelEditTarget();
    }
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
        {category.name}
      </td>
      <td className="px-4 py-3 text-sm">
        {isEditingTarget ? (
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">$</span>
            <input
              type="number"
              step="0.01"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              onBlur={handleSaveTarget}
              onKeyDown={handleTargetKeyDown}
              className="w-24 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              autoFocus
            />
          </div>
        ) : (
          <button
            onClick={handleStartEditTarget}
            className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-left"
          >
            {formatCurrency(category.target_amount)}
          </button>
        )}
      </td>
      <td className="px-4 py-3 text-sm">
        {isEditingDueDate ? (
          <input
            type="number"
            min="1"
            max="31"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            onBlur={handleDueDateSave}
            onKeyDown={handleDueDateKeyDown}
            className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            autoFocus
            placeholder="Day"
          />
        ) : (
          <button
            onClick={() => setIsEditingDueDate(true)}
            className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-left"
          >
            {category.charge_day ? formatOrdinalDay(category.charge_day) : 'Set due date'}
          </button>
        )}
      </td>
      <td className="px-4 py-3 text-sm">
        <button
          onClick={() => handleCheckingSave(!isChecking)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            isChecking
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {isChecking ? 'Yes' : 'No'}
        </button>
      </td>
      <td className="px-4 py-3 text-right text-sm">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(category)}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onArchive(category)}
            className="text-orange-600 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-300 font-medium"
          >
            Archive
          </button>
        </div>
      </td>
    </tr>
  );
}
