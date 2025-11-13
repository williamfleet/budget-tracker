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

  // Color coding for available balance
  const availableColor =
    category.available > 0
      ? 'text-green-600'
      : category.available < 0
      ? 'text-red-600'
      : 'text-gray-600';

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

  return (
    <div className="py-3 px-2 sm:px-4 hover:bg-gray-50 border-b border-gray-100">
      <div className="flex sm:grid sm:grid-cols-5 sm:gap-4">
        {/* Sticky category column on mobile */}
        <div className="sticky left-0 bg-white hover:bg-gray-50 z-10 w-32 sm:w-auto flex-shrink-0 sm:col-span-1 pr-2 sm:pr-0 flex items-center">
          <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">
            {category.name}
          </span>
        </div>

        {/* Scrollable columns */}
        <div className="flex gap-6 sm:gap-0 sm:contents">
          {/* Assigned - Editable */}
          <div className="w-20 sm:w-auto flex-shrink-0 sm:col-span-1 flex items-center justify-end">
            {isEditing ? (
              <div className="flex items-center gap-1">
                <span className="text-xs sm:text-sm text-gray-500">$</span>
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
                className="text-xs sm:text-sm text-gray-900 hover:text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded transition-colors min-w-[60px] text-right"
              >
                {assigned}
              </button>
            )}
          </div>

          {/* Activity */}
          <div className="w-20 sm:w-auto flex-shrink-0 sm:col-span-1 flex items-center justify-end">
            <span className="text-xs sm:text-sm text-gray-600">
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
          <div className="w-20 sm:w-auto flex-shrink-0 sm:col-span-1 flex items-center justify-end pr-2 sm:pr-0">
            <span className="text-xs sm:text-sm text-gray-500">
              {target}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
