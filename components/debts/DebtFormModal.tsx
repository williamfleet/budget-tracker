'use client';

import { useState, useEffect } from 'react';
import { Debt, DebtType, DEBT_TYPE_LABELS } from '@/lib/types/debts';
import { Account } from '@/lib/types/accounts';
import { createDebt, updateDebt } from '@/app/actions/debts';

interface DebtFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt?: Debt | null;
  accounts: Account[];
}

export interface DebtFormData {
  name: string;
  type: DebtType;
  balance: string;
  original_balance: string;
  interest_rate: string;
  minimum_payment: string;
  due_day: string;
  account_id: string;
  notes: string;
}

export default function DebtFormModal({
  isOpen,
  onClose,
  debt,
  accounts,
}: DebtFormModalProps) {
  const [formData, setFormData] = useState<DebtFormData>({
    name: '',
    type: 'credit_card',
    balance: '',
    original_balance: '',
    interest_rate: '',
    minimum_payment: '',
    due_day: '',
    account_id: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (debt) {
      setFormData({
        name: debt.name,
        type: debt.type,
        balance: (debt.balance / 1000).toFixed(2),
        original_balance: (debt.original_balance / 1000).toFixed(2),
        interest_rate: debt.interest_rate.toString(),
        minimum_payment: (debt.minimum_payment / 1000).toFixed(2),
        due_day: debt.due_day ? debt.due_day.toString() : '',
        account_id: debt.account_id || '',
        notes: debt.notes || '',
      });
    } else {
      setFormData({
        name: '',
        type: 'credit_card',
        balance: '',
        original_balance: '',
        interest_rate: '',
        minimum_payment: '',
        due_day: '',
        account_id: '',
        notes: '',
      });
    }
    setError(null);
  }, [debt, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let result;
      if (debt) {
        result = await updateDebt({
          id: debt.id,
          ...formData,
          is_active: debt.is_active,
          account_id: formData.account_id || null,
        });
      } else {
        result = await createDebt({
          ...formData,
          account_id: formData.account_id || null,
        });
      }

      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Failed to save debt');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">
            {debt ? 'Edit Debt' : 'Add New Debt'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Debt Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Debt Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Chase Freedom Card"
                required
              />
            </div>

            {/* Debt Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Debt Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as DebtType })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                {Object.entries(DEBT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Balance & Original Balance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Balance *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) =>
                    setFormData({ ...formData, balance: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Original Balance *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.original_balance}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      original_balance: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Interest Rate & Minimum Payment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interest Rate (%) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.interest_rate}
                  onChange={(e) =>
                    setFormData({ ...formData, interest_rate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="18.99"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Payment *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.minimum_payment}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minimum_payment: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="25.00"
                  required
                />
              </div>
            </div>

            {/* Due Day & Account */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Day (1-31)
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.due_day}
                  onChange={(e) =>
                    setFormData({ ...formData, due_day: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="15"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Linked Account
                </label>
                <select
                  value={formData.account_id}
                  onChange={(e) =>
                    setFormData({ ...formData, account_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">None</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Additional notes about this debt..."
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 font-medium"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : debt ? 'Update Debt' : 'Add Debt'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
