'use client';

import { useState, useRef, useEffect } from 'react';
import { formatCurrency, milliunitsToDollars } from '@/lib/utils/money';
import { CategoryBudgetData } from '@/lib/types/budget';
import { updateAssignment } from '@/app/actions/assignments';

interface CategoryRowProps {
  category: CategoryBudgetData;
}

export default function CategoryRow({ category }: CategoryRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const assigned = formatCurrency(category.assigned);
  const activity = formatCurrency(Math.abs(category.activity));
  const available = formatCurrency(category.available);
  const target = formatCurrency(category.target_amount);

  // Calculate progress towards target (Assigned vs Target)
  const targetAmount = category.target_amount;
  const assignedAmount = category.assigned;
  const availableAmount = category.available;
  const progressPercentage = targetAmount > 0
    ? Math.min((assignedAmount / targetAmount) * 100, 100)
    : 0;

  // Progress bar color based on assigned vs target
  const getProgressBarColor = () => {
    if (assignedAmount >= targetAmount) {
      return 'bg-green-500';
    } else if (progressPercentage >= 50) {
      return 'bg-yellow-500';
    } else {
      return 'bg-red-500';
    }
  };

  // Available amount color (always based on available balance)
  const availableColor =
    category.available > 0
      ? 'text-green-600 dark:text-green-400'
      : category.available < 0
      ? 'text-red-600 dark:text-red-400'
      : 'text-gray-600 dark:text-gray-300';

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setEditValue(milliunitsToDollars(category.assigned).toFixed(2));
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditValue('');
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await updateAssignment({
        category_id: category.id,
        amount: editValue,
      });
      setIsEditing(false);
      setEditValue('');
    } catch (error) {
      console.error('Failed to update assignment:', error);
      alert('Failed to update assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleQuickFillToTarget = async () => {
    if (targetAmount === 0) return;

    // Calculate how much more is needed to reach target
    const amountNeeded = targetAmount - availableAmount;

    // Don't fill if already at or above target
    if (amountNeeded <= 0) return;

    // Calculate new assignment: current assigned + amount needed
    const newAssignment = category.assigned + amountNeeded;

    setIsSubmitting(true);
    try {
      await updateAssignment({
        category_id: category.id,
        amount: milliunitsToDollars(newAssignment).toFixed(2),
      });
    } catch (error) {
      console.error('Failed to fill to target:', error);
      alert('Failed to fill to target. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const rowBgColor = category.is_checking
    ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
    : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700';

  return (
    <div className={`border-b border-gray-100 dark:border-gray-700 ${rowBgColor}`}>
      <div className="py-3 px-2 sm:px-4">
        <div className="flex sm:grid sm:grid-cols-6 sm:gap-4">
          {/* Sticky category column on mobile */}
          <div className={`sticky left-0 z-10 w-32 sm:w-auto flex-shrink-0 sm:col-span-1 pr-2 sm:pr-0 flex items-center ${rowBgColor}`}>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {category.name}
              </span>
              {targetAmount > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                  {Math.round(progressPercentage)}%
                </span>
              )}
            </div>
          </div>

          {/* Scrollable columns */}
          <div className="flex gap-6 sm:gap-0 sm:contents">
          {/* Assigned - Editable with Quick Fill */}
          <div className="w-20 sm:w-auto flex-shrink-0 sm:col-span-1 flex items-center justify-end">
            <div className="flex flex-col items-end gap-1">
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">$</span>
                  <input
                    ref={inputRef}
                    type="number"
                    step="0.01"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSave}
                    disabled={isSubmitting}
                    className="w-16 sm:w-24 px-1 sm:px-2 py-1 text-xs sm:text-sm text-right border border-indigo-500 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ) : (
                <button
                  onClick={handleStartEdit}
                  className="text-xs sm:text-sm text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded transition-colors min-w-[60px] text-right"
                >
                  {assigned}
                </button>
              )}
              {!isEditing && targetAmount > 0 && availableAmount < targetAmount && (
                <button
                  onClick={handleQuickFillToTarget}
                  disabled={isSubmitting}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 dark:text-indigo-300 hover:underline disabled:opacity-50"
                  title="Fill to target"
                >
                  Fill Target
                </button>
              )}
            </div>
          </div>

          {/* Activity */}
          <div className="w-20 sm:w-auto flex-shrink-0 sm:col-span-1 flex items-center justify-end">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              {category.activity !== 0 ? `-${activity}` : '$0.00'}
            </span>
          </div>

          {/* Available */}
          <div className="w-20 sm:w-auto flex-shrink-0 sm:col-span-1 flex items-center justify-end">
            <span className={`text-xs sm:text-sm font-semibold ${availableColor}`}>
              {available}
            </span>
          </div>

          {/* Target */}
          <div className="w-20 sm:w-auto flex-shrink-0 sm:col-span-1 flex items-center justify-end">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
              {target}
            </span>
          </div>

            {/* Date */}
            <div className="w-16 sm:w-auto flex-shrink-0 sm:col-span-1 flex items-center justify-center pr-2 sm:pr-0">
              {category.charge_day ? (
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium">
                  {category.charge_day}
                </span>
              ) : (
                <span className="text-xs sm:text-sm text-gray-400 dark:text-gray-500">
                  -
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar - Only show if target is set */}
      {targetAmount > 0 && (
        <div className="px-2 sm:px-4 pb-2">
          <div className="flex sm:grid sm:grid-cols-6 sm:gap-4">
            {/* Empty space for category column */}
            <div className="hidden sm:block sm:col-span-1"></div>

            {/* Progress bar spans remaining columns */}
            <div className="w-full sm:col-span-5">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
