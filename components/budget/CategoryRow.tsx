'use client';

import { useState, useRef, useEffect } from 'react';
import { formatCurrency, milliunitsToDollars, formatOrdinalDay } from '@/lib/utils/money';
import { CategoryBudgetData } from '@/lib/types/budget';
import { updateAssignment } from '@/app/actions/assignments';
import { updateCategoryChargeDay, updateCategoryTarget } from '@/app/actions/categories';

interface CategoryRowProps {
  category: CategoryBudgetData;
  currentMonth: string;
}

export default function CategoryRow({ category, currentMonth }: CategoryRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [dateValue, setDateValue] = useState(category.charge_day?.toString() || '');
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetValue, setTargetValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const targetInputRef = useRef<HTMLInputElement>(null);

  const assigned = formatCurrency(category.assigned);
  const activity = formatCurrency(Math.abs(category.activity));
  const available = formatCurrency(category.available);
  const target = formatCurrency(category.target_amount);

  // Calculate progress towards target (for display purposes)
  const targetAmount = category.target_amount;
  const assignedAmount = category.assigned;
  const availableAmount = category.available;
  const progressPercentage = targetAmount > 0
    ? Math.min((assignedAmount / targetAmount) * 100, 100)
    : 0;

  // Calculate available vs assigned for status bar
  const availablePercentage = assignedAmount > 0
    ? (availableAmount / assignedAmount) * 100
    : 0;

  // Progress bar color based on available vs assigned
  const getProgressBarColor = () => {
    // Overspent - available is negative (less than -$0.01)
    if (availableAmount < -10) { // -10 milliunits = -$0.01
      return 'bg-red-500';
    }

    // Available is more than 50% of assigned - green
    if (availablePercentage > 50) {
      return 'bg-green-500';
    }

    // Available is less than 50% of assigned - yellow
    return 'bg-yellow-500';
  };

  // Determine if we should show the progress bar
  const showProgressBar = assignedAmount > 0;

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

  // Focus date input when entering edit mode
  useEffect(() => {
    if (isEditingDate && dateInputRef.current) {
      dateInputRef.current.focus();
      dateInputRef.current.select();
    }
  }, [isEditingDate]);

  // Focus target input when entering edit mode
  useEffect(() => {
    if (isEditingTarget && targetInputRef.current) {
      targetInputRef.current.focus();
      targetInputRef.current.select();
    }
  }, [isEditingTarget]);

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

    // Store previous value for undo
    const previousValue = milliunitsToDollars(category.assigned).toFixed(2);

    try {
      await updateAssignment({
        category_id: category.id,
        amount: editValue,
        month: currentMonth,
      });

      // Emit event for undo/redo tracking with old and new values
      window.dispatchEvent(
        new CustomEvent('assignmentChange', {
          detail: {
            category_id: category.id,
            oldAmount: previousValue,
            newAmount: editValue
          },
        })
      );

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

    // Store previous value for undo
    const previousValue = milliunitsToDollars(category.assigned).toFixed(2);

    // Calculate new assignment: current assigned + amount needed
    const newAssignment = category.assigned + amountNeeded;
    const newAmount = milliunitsToDollars(newAssignment).toFixed(2);

    setIsSubmitting(true);
    try {
      await updateAssignment({
        category_id: category.id,
        amount: newAmount,
        month: currentMonth,
      });

      // Emit event for undo/redo tracking with old and new values
      window.dispatchEvent(
        new CustomEvent('assignmentChange', {
          detail: {
            category_id: category.id,
            oldAmount: previousValue,
            newAmount: newAmount
          },
        })
      );
    } catch (error) {
      console.error('Failed to fill to target:', error);
      alert('Failed to fill to target. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEditDate = () => {
    setDateValue(category.charge_day?.toString() || '');
    setIsEditingDate(true);
  };

  const handleCancelEditDate = () => {
    setIsEditingDate(false);
    setDateValue(category.charge_day?.toString() || '');
  };

  const handleSaveDate = async () => {
    try {
      await updateCategoryChargeDay(category.id, dateValue);
      setIsEditingDate(false);
    } catch (error) {
      console.error('Failed to update charge day:', error);
      alert('Failed to update charge day. Please try again.');
      setDateValue(category.charge_day?.toString() || '');
    }
  };

  const handleDateKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveDate();
    } else if (e.key === 'Escape') {
      handleCancelEditDate();
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
    } catch (error) {
      console.error('Failed to update target amount:', error);
      alert('Failed to update target amount. Please try again.');
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
              {assignedAmount > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                  {Math.round(availablePercentage)}%
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
            {isEditingTarget ? (
              <div className="flex items-center gap-1">
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">$</span>
                <input
                  ref={targetInputRef}
                  type="number"
                  step="0.01"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  onKeyDown={handleTargetKeyDown}
                  onBlur={handleSaveTarget}
                  className="w-16 sm:w-24 px-1 sm:px-2 py-1 text-xs sm:text-sm text-right border border-indigo-500 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            ) : (
              <button
                onClick={handleStartEditTarget}
                className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-2 py-1 rounded transition-colors min-w-[60px] text-right"
              >
                {target}
              </button>
            )}
          </div>

            {/* Date */}
            <div className="w-16 sm:w-auto flex-shrink-0 sm:col-span-1 flex items-center justify-center pr-2 sm:pr-0">
              {isEditingDate ? (
                <input
                  ref={dateInputRef}
                  type="number"
                  min="1"
                  max="31"
                  value={dateValue}
                  onChange={(e) => setDateValue(e.target.value)}
                  onKeyDown={handleDateKeyDown}
                  onBlur={handleSaveDate}
                  className="w-12 px-1 py-1 text-xs sm:text-sm text-center border border-indigo-500 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Day"
                />
              ) : (
                <button
                  onClick={handleStartEditDate}
                  className={`text-xs sm:text-sm ${category.charge_day ? 'text-gray-600 dark:text-gray-300 font-medium' : 'text-gray-400 dark:text-gray-500'} hover:text-indigo-600 dark:hover:text-indigo-400 px-2 py-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors`}
                >
                  {formatOrdinalDay(category.charge_day)}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar - Show to indicate funds usage */}
      {showProgressBar && (
        <div className="px-2 sm:px-4 pb-2">
          <div className="flex sm:grid sm:grid-cols-6 sm:gap-4">
            {/* Empty space for category column */}
            <div className="hidden sm:block sm:col-span-1"></div>

            {/* Progress bar spans remaining columns */}
            <div className="w-full sm:col-span-5">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
                  style={{
                    width: availableAmount < -10
                      ? '100%'
                      : `${Math.max(0, Math.min(availablePercentage, 100))}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
