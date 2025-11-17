'use client';

import { useState } from 'react';
import { Debt } from '@/lib/types/debts';
import { Account } from '@/lib/types/accounts';
import { formatCurrency } from '@/lib/utils/money';
import DebtCard from './DebtCard';
import DebtFormModal from './DebtFormModal';
import PayoffStrategyComparison from './PayoffStrategyComparison';

interface DebtsPageClientProps {
  debts: Debt[];
  accounts: Account[];
  statistics: {
    total_debt: number;
    total_minimum_payment: number;
    active_debts_count: number;
    paid_off_count: number;
    highest_interest_rate: number;
    average_interest_rate: number;
  };
}

export default function DebtsPageClient({
  debts: initialDebts,
  accounts,
  statistics,
}: DebtsPageClientProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [extraPayment, setExtraPayment] = useState<number>(0);
  const [showPaidOff, setShowPaidOff] = useState(false);

  const activeDebts = initialDebts.filter((d) => d.is_active);
  const paidOffDebts = initialDebts.filter((d) => !d.is_active);

  const handleAddDebt = () => {
    setSelectedDebt(null);
    setIsFormOpen(true);
  };

  const handleEditDebt = (debt: Debt) => {
    setSelectedDebt(debt);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedDebt(null);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Debt Payoff Planner</h1>
          <button
            onClick={handleAddDebt}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
          >
            + Add Debt
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Total Debt</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(statistics.total_debt)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Min. Monthly Payment</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(statistics.total_minimum_payment)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Active Debts</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {statistics.active_debts_count}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Highest Rate</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {statistics.highest_interest_rate.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {activeDebts.length > 0 && (
        <>
          {/* Extra Payment Calculator */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Payoff Strategy Calculator</h2>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Extra Monthly Payment:
              </label>
              <input
                type="number"
                step="10"
                min="0"
                value={extraPayment / 1000}
                onChange={(e) =>
                  setExtraPayment(Math.round(parseFloat(e.target.value || '0') * 1000))
                }
                className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0.00"
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                (beyond minimum payments)
              </span>
            </div>
          </div>

          {/* Strategy Comparison */}
          <div className="mb-8">
            <PayoffStrategyComparison
              debts={activeDebts}
              extraPayment={extraPayment}
            />
          </div>
        </>
      )}

      {/* Active Debts */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Active Debts</h2>
        {activeDebts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-4">
              No active debts. Add a debt to start tracking your payoff plan.
            </p>
            <button
              onClick={handleAddDebt}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
            >
              + Add Your First Debt
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeDebts.map((debt) => (
              <DebtCard key={debt.id} debt={debt} onEdit={handleEditDebt} />
            ))}
          </div>
        )}
      </div>

      {/* Paid Off Debts */}
      {paidOffDebts.length > 0 && (
        <div className="mb-8">
          <button
            onClick={() => setShowPaidOff(!showPaidOff)}
            className="flex items-center gap-2 text-xl font-bold mb-4 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 dark:text-gray-100"
          >
            <span>{showPaidOff ? '▼' : '▶'}</span>
            <span>Paid Off Debts ({paidOffDebts.length})</span>
          </button>
          {showPaidOff && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paidOffDebts.map((debt) => (
                <DebtCard key={debt.id} debt={debt} onEdit={handleEditDebt} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      <DebtFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        debt={selectedDebt}
        accounts={accounts}
      />
    </div>
  );
}
