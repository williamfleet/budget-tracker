'use client';

import { IncomeVsExpenses } from '@/lib/services/reports';
import { formatCurrency } from '@/lib/utils/money';

interface IncomeVsExpensesCardProps {
  data: IncomeVsExpenses;
}

export default function IncomeVsExpensesCard({
  data,
}: IncomeVsExpensesCardProps) {
  const netColor =
    data.net > 0
      ? 'text-green-600'
      : data.net < 0
      ? 'text-red-600'
      : 'text-gray-600';

  const netBgColor =
    data.net > 0
      ? 'bg-green-50'
      : data.net < 0
      ? 'bg-red-50'
      : 'bg-gray-50';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Total Income */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Income</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
              {formatCurrency(data.total_income)}
            </p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-full">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Total Expenses */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
              {formatCurrency(data.total_expenses)}
            </p>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Net (Income - Expenses) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Net</p>
            <p className={`text-2xl font-bold mt-2 ${netColor}`}>
              {formatCurrency(data.net)}
            </p>
          </div>
          <div className={`p-3 rounded-full ${netBgColor}`}>
            <svg
              className={`w-8 h-8 ${netColor}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
