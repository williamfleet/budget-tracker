'use client';

import { useState } from 'react';
import { IncomeSource } from '@/lib/types/income';
import { formatCurrency, milliunitsToDollars } from '@/lib/utils/money';

interface IncomeSourceRowProps {
  source: IncomeSource;
  onUpdate: (source: IncomeSource, name: string, amount: string) => Promise<void>;
  onDelete: (source: IncomeSource) => void;
}

export default function IncomeSourceRow({
  source,
  onUpdate,
  onDelete,
}: IncomeSourceRowProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [amountValue, setAmountValue] = useState('');

  const currentAmountDollars = () =>
    milliunitsToDollars(source.amount).toFixed(2);

  const handleStartEditName = () => {
    setNameValue(source.name);
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!nameValue.trim()) {
      setIsEditingName(false);
      return;
    }

    try {
      await onUpdate(source, nameValue.trim(), currentAmountDollars());
      setIsEditingName(false);
    } catch (error: any) {
      alert(error.message || 'Failed to update income source');
      setNameValue(source.name);
    }
  };

  const handleStartEditAmount = () => {
    setAmountValue(currentAmountDollars());
    setIsEditingAmount(true);
  };

  const handleSaveAmount = async () => {
    try {
      await onUpdate(source, source.name, amountValue);
      setIsEditingAmount(false);
    } catch (error: any) {
      alert(error.message || 'Failed to update income source');
      setAmountValue(currentAmountDollars());
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      setIsEditingName(false);
    }
  };

  const handleAmountKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveAmount();
    } else if (e.key === 'Escape') {
      setIsEditingAmount(false);
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700">
      {/* Name */}
      <div className="flex-1 min-w-0">
        {isEditingName ? (
          <input
            type="text"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={handleNameKeyDown}
            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            autoFocus
          />
        ) : (
          <button
            onClick={handleStartEditName}
            className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 text-left truncate max-w-full"
          >
            {source.name}
          </button>
        )}
      </div>

      {/* Amount */}
      <div className="shrink-0">
        {isEditingAmount ? (
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">$</span>
            <input
              type="number"
              step="0.01"
              value={amountValue}
              onChange={(e) => setAmountValue(e.target.value)}
              onBlur={handleSaveAmount}
              onKeyDown={handleAmountKeyDown}
              className="w-24 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              autoFocus
            />
          </div>
        ) : (
          <button
            onClick={handleStartEditAmount}
            className="text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            {formatCurrency(source.amount)}
          </button>
        )}
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(source)}
        className="shrink-0 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-sm font-medium"
      >
        Remove
      </button>
    </div>
  );
}
