'use client';

import { useState, useRef, useEffect } from 'react';
import { formatCurrency, milliunitsToDollars, formatOrdinalDay } from '@/lib/utils/money';
import { CategoryBudgetData } from '@/lib/types/budget';
import { updateAssignment } from '@/app/actions/assignments';
import { updateCategoryChargeDay, updateCategoryTarget } from '@/app/actions/categories';

interface CategoryDetailModalProps {
  category: CategoryBudgetData;
  currentMonth: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CategoryDetailModal({
  category,
  currentMonth,
  isOpen,
  onClose,
}: CategoryDetailModalProps) {
  const [isEditingAssigned, setIsEditingAssigned] = useState(false);
  const [assignedValue, setAssignedValue] = useState('');
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [targetValue, setTargetValue] = useState('');
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [dateValue, setDateValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const assignedInputRef = useRef<HTMLInputElement>(null);
  const targetInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const assigned = formatCurrency(category.assigned);
  const activity = formatCurrency(Math.abs(category.activity));
  const available = formatCurrency(category.available);
  const target = formatCurrency(category.target_amount);

  const assignedAmount = category.assigned;
  const availableAmount = category.available;
  const targetAmount = category.target_amount;

  const availablePercentage = assignedAmount > 0
    ? (availableAmount / assignedAmount) * 100
    : 0;

  const availableColor =
    category.available > 0
      ? 'text-green-600 dark:text-green-400'
      : category.available < 0
      ? 'text-red-600 dark:text-red-400'
      : 'text-gray-600 dark:text-gray-300';

  const getProgressBarColor = () => {
    if (availableAmount < -10) return 'bg-red-500';
    if (availablePercentage > 50) return 'bg-green-500';
    return 'bg-yellow-500';
  };

  // Focus inputs when entering edit mode
  useEffect(() => {
    if (isEditingAssigned && assignedInputRef.current) {
      assignedInputRef.current.focus();
      assignedInputRef.current.select();
    }
  }, [isEditingAssigned]);

  useEffect(() => {
    if (isEditingTarget && targetInputRef.current) {
      targetInputRef.current.focus();
      targetInputRef.current.select();
    }
  }, [isEditingTarget]);

  useEffect(() => {
    if (isEditingDate && dateInputRef.current) {
      dateInputRef.current.focus();
      dateInputRef.current.select();
    }
  }, [isEditingDate]);

  // Reset edit states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsEditingAssigned(false);
      setIsEditingTarget(false);
      setIsEditingDate(false);
    }
  }, [isOpen]);

  // Assigned handlers
  const handleStartEditAssigned = () => {
    setAssignedValue(milliunitsToDollars(category.assigned).toFixed(2));
    setIsEditingAssigned(true);
  };

  const handleSaveAssigned = async () => {
    setIsSubmitting(true);
    const previousValue = milliunitsToDollars(category.assigned).toFixed(2);

    try {
      await updateAssignment({
        category_id: category.id,
        amount: assignedValue,
        month: currentMonth,
      });

      window.dispatchEvent(
        new CustomEvent('assignmentChange', {
          detail: {
            category_id: category.id,
            oldAmount: previousValue,
            newAmount: assignedValue,
          },
        })
      );

      setIsEditingAssigned(false);
      setAssignedValue('');
    } catch (error) {
      console.error('Failed to update assignment:', error);
      alert('Failed to update assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Target handlers
  const handleStartEditTarget = () => {
    setTargetValue(milliunitsToDollars(category.target_amount).toFixed(2));
    setIsEditingTarget(true);
  };

  const handleSaveTarget = async () => {
    try {
      await updateCategoryTarget(category.id, targetValue);
      setIsEditingTarget(false);
    } catch (error) {
      console.error('Failed to update target:', error);
      alert('Failed to update target. Please try again.');
    }
  };

  // Date handlers
  const handleStartEditDate = () => {
    setDateValue(category.charge_day?.toString() || '');
    setIsEditingDate(true);
  };

  const handleSaveDate = async () => {
    try {
      await updateCategoryChargeDay(category.id, dateValue);
      setIsEditingDate(false);
    } catch (error) {
      console.error('Failed to update date:', error);
      alert('Failed to update date. Please try again.');
    }
  };

  // Fill to target
  const handleQuickFillToTarget = async () => {
    if (targetAmount === 0 || category.assigned === targetAmount) return;

    const previousValue = milliunitsToDollars(category.assigned).toFixed(2);
    const newAmount = milliunitsToDollars(targetAmount).toFixed(2);

    setIsSubmitting(true);
    try {
      await updateAssignment({
        category_id: category.id,
        amount: newAmount,
        month: currentMonth,
      });

      window.dispatchEvent(
        new CustomEvent('assignmentChange', {
          detail: {
            category_id: category.id,
            oldAmount: previousValue,
            newAmount: newAmount,
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

  const handleKeyDown = (
    e: React.KeyboardEvent,
    saveHandler: () => void,
    cancelHandler: () => void
  ) => {
    if (e.key === 'Enter') {
      saveHandler();
    } else if (e.key === 'Escape') {
      cancelHandler();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 sm:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal panel - slides up from bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl max-h-[85vh] overflow-y-auto">
        {/* Handle bar */}
        <div className="sticky top-0 pt-3 pb-2 flex justify-center bg-white dark:bg-gray-900 rounded-t-2xl">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="px-5 pb-8">
          {/* Header: Category name and Available */}
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 pr-8">
              {category.name}
            </h2>
            <div className="text-right flex-shrink-0">
              <p className={`text-2xl font-bold ${availableColor}`}>
                {available}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Available
              </p>
            </div>
          </div>

          {/* Progress bar */}
          {assignedAmount > 0 && (
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>{Math.round(availablePercentage)}% remaining</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
                  style={{
                    width: availableAmount < -10
                      ? '100%'
                      : `${Math.max(0, Math.min(availablePercentage, 100))}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Details grid */}
          <div className="space-y-4">
            {/* Assigned */}
            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Assigned</span>
              {isEditingAssigned ? (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">$</span>
                  <input
                    ref={assignedInputRef}
                    type="number"
                    step="0.01"
                    value={assignedValue}
                    onChange={(e) => setAssignedValue(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, handleSaveAssigned, () => setIsEditingAssigned(false))}
                    onBlur={handleSaveAssigned}
                    disabled={isSubmitting}
                    className="w-24 px-2 py-1 text-right border border-indigo-500 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              ) : (
                <button
                  onClick={handleStartEditAssigned}
                  className="text-base font-medium text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                >
                  {assigned}
                </button>
              )}
            </div>

            {/* Activity */}
            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Activity</span>
              <span className="text-base text-gray-900 dark:text-gray-100">
                {category.activity !== 0 ? `-${activity}` : '$0.00'}
              </span>
            </div>

            {/* Target */}
            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Target</span>
              {isEditingTarget ? (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">$</span>
                  <input
                    ref={targetInputRef}
                    type="number"
                    step="0.01"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, handleSaveTarget, () => setIsEditingTarget(false))}
                    onBlur={handleSaveTarget}
                    className="w-24 px-2 py-1 text-right border border-indigo-500 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              ) : (
                <button
                  onClick={handleStartEditTarget}
                  className="text-base text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                >
                  {target}
                </button>
              )}
            </div>

            {/* Due Date */}
            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Due Date</span>
              {isEditingDate ? (
                <input
                  ref={dateInputRef}
                  type="number"
                  min="1"
                  max="31"
                  value={dateValue}
                  onChange={(e) => setDateValue(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, handleSaveDate, () => setIsEditingDate(false))}
                  onBlur={handleSaveDate}
                  className="w-16 px-2 py-1 text-center border border-indigo-500 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Day"
                />
              ) : (
                <button
                  onClick={handleStartEditDate}
                  className={`text-base px-3 py-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20 ${
                    category.charge_day
                      ? 'text-gray-900 dark:text-gray-100'
                      : 'text-gray-400 dark:text-gray-500'
                  } hover:text-indigo-600 dark:hover:text-indigo-400`}
                >
                  {formatOrdinalDay(category.charge_day)}
                </button>
              )}
            </div>
          </div>

          {/* Fill Target button */}
          {targetAmount > 0 && category.assigned !== targetAmount && (
            <button
              onClick={handleQuickFillToTarget}
              disabled={isSubmitting}
              className="w-full mt-6 py-3 text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 transition-colors"
            >
              Fill to Target (+{formatCurrency(targetAmount - category.assigned)})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
