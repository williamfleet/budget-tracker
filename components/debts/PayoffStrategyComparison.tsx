'use client';

import { Debt } from '@/lib/types/debts';
import {
  calculateSnowballStrategy,
  calculateAvalancheStrategy,
  compareStrategies,
} from '@/lib/utils/debtCalculations';
import { formatCurrency } from '@/lib/utils/money';

interface PayoffStrategyComparisonProps {
  debts: Debt[];
  extraPayment: number;
}

export default function PayoffStrategyComparison({
  debts,
  extraPayment,
}: PayoffStrategyComparisonProps) {
  if (debts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        Add debts to see payoff strategy comparison
      </div>
    );
  }

  const snowball = calculateSnowballStrategy(debts, extraPayment);
  const avalanche = calculateAvalancheStrategy(debts, extraPayment);
  const comparison = compareStrategies(snowball, avalanche);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Strategy Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Snowball Strategy */}
          <div className="border-2 border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-lg">Snowball Method</h4>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Pay Smallest First
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Time:</span>
                <span className="font-medium">
                  {snowball.total_months} months
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Interest:</span>
                <span className="font-medium">
                  {formatCurrency(snowball.total_interest)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Paid:</span>
                <span className="font-medium">
                  {formatCurrency(snowball.total_paid)}
                </span>
              </div>
            </div>
            {comparison.betterStrategy === 'snowball' && (
              <div className="mt-3 bg-green-50 border border-green-200 rounded p-2 text-xs text-green-800">
                <strong>Best Strategy!</strong> Save{' '}
                {formatCurrency(comparison.savings)} and {comparison.monthsSaved}{' '}
                months
              </div>
            )}
          </div>

          {/* Avalanche Strategy */}
          <div className="border-2 border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-lg">Avalanche Method</h4>
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                Pay Highest Rate First
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Time:</span>
                <span className="font-medium">
                  {avalanche.total_months} months
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Interest:</span>
                <span className="font-medium">
                  {formatCurrency(avalanche.total_interest)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Paid:</span>
                <span className="font-medium">
                  {formatCurrency(avalanche.total_paid)}
                </span>
              </div>
            </div>
            {comparison.betterStrategy === 'avalanche' && (
              <div className="mt-3 bg-green-50 border border-green-200 rounded p-2 text-xs text-green-800">
                <strong>Best Strategy!</strong> Save{' '}
                {formatCurrency(comparison.savings)} and {comparison.monthsSaved}{' '}
                months
              </div>
            )}
          </div>
        </div>

        {/* Explanation */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
          <p className="mb-2">
            <strong>Snowball Method:</strong> Pay off smallest balances first
            for quick wins and motivation.
          </p>
          <p>
            <strong>Avalanche Method:</strong> Pay off highest interest rates
            first to save the most money.
          </p>
        </div>
      </div>

      {/* Payoff Timeline */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Payoff Timeline</h3>
        <div className="space-y-4">
          {avalanche.payoff_schedule.map((debt, index) => {
            const progress =
              ((debts.find((d) => d.id === debt.debt_id)?.original_balance || 0) -
                debt.current_balance) /
              (debts.find((d) => d.id === debt.debt_id)?.original_balance || 1);

            return (
              <div key={debt.debt_id} className="border-l-4 border-indigo-500 pl-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <span className="font-medium text-gray-900">
                      {debt.debt_name}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {debt.interest_rate}% APR
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    Month {debt.months_to_payoff}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span>Balance: {formatCurrency(debt.current_balance)}</span>
                  <span>•</span>
                  <span>Interest: {formatCurrency(debt.total_interest)}</span>
                  <span>•</span>
                  <span>Payoff: {debt.payoff_date}</span>
                </div>
                {/* Progress Bar */}
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
