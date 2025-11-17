'use client';

import { useState } from 'react';
import {
  SpendingByCategory,
  MonthlyTrend,
  IncomeVsExpenses,
} from '@/lib/services/reports';
import SpendingByCategoryChart from './SpendingByCategoryChart';
import MonthlyTrendsChart from './MonthlyTrendsChart';
import IncomeVsExpensesCard from './IncomeVsExpensesCard';

interface ReportsPageClientProps {
  initialSpendingByCategory: SpendingByCategory[];
  initialMonthlyTrends: MonthlyTrend[];
  initialIncomeVsExpenses: IncomeVsExpenses;
}

export default function ReportsPageClient({
  initialSpendingByCategory,
  initialMonthlyTrends,
  initialIncomeVsExpenses,
}: ReportsPageClientProps) {
  const [spendingByCategory] = useState(initialSpendingByCategory);
  const [monthlyTrends] = useState(initialMonthlyTrends);
  const [incomeVsExpenses] = useState(initialIncomeVsExpenses);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Reports & Analytics
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Insights into your spending and budgeting patterns
        </p>
      </div>

      {/* Income vs Expenses Summary */}
      <div className="mb-8">
        <IncomeVsExpensesCard data={incomeVsExpenses} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            Spending by Category
          </h3>
          <SpendingByCategoryChart data={spendingByCategory} />
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
            Monthly Trends (Last 6 Months)
          </h3>
          <MonthlyTrendsChart data={monthlyTrends} />
        </div>
      </div>
    </div>
  );
}
