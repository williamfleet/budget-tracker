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
    <div className="grid grid-cols-4 gap-4 py-3 px-4 hover:bg-gray-50 border-b border-gray-100">
      {/* Category Name */}
      <div className="col-span-1 flex items-center">
        <span className="text-sm font-medium text-gray-900">
          {category.name}
        </span>
      </div>

      {/* Assigned - Editable */}
      <div className="col-span-1 flex items-center justify-end">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-500">$</span>
            <input
              ref={inputRef}
              type="number"
              step="0.01"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              disabled={isSubmitting}
              className="w-24 px-2 py-1 text-sm text-right border border-indigo-500 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        ) : (
          <button
            onClick={handleStartEdit}
            className="text-sm text-gray-900 hover:text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded transition-colors"
          >
            {assigned}
          </button>
        )}
      </div>

      {/* Activity */}
      <div className="col-span-1 flex items-center justify-end">
        <span className="text-sm text-gray-600">
          {category.activity !== 0 ? `-${activity}` : '$0.00'}
        </span>
      </div>

      {/* Available */}
      <div className="col-span-1 flex items-center justify-end">
        <span className={`text-sm font-semibold ${availableColor}`}>
          {available}
        </span>
      </div>
    </div>
  );
}
