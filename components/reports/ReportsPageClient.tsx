'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  SpendingByCategory,
  MonthlyTrend,
  IncomeVsExpenses,
} from '@/lib/services/reports';
import { Category } from '@/lib/types/budget';
import SpendingByCategoryChart from './SpendingByCategoryChart';
import MonthlyTrendsChart from './MonthlyTrendsChart';
import IncomeVsExpensesCard from './IncomeVsExpensesCard';
import { getMonthlyTrendsByCategory } from '@/app/actions/reports';
import { formatMonth, getPreviousMonth, getNextMonth, getCurrentMonth } from '@/lib/utils/date';

interface ReportsPageClientProps {
  initialSpendingByCategory: SpendingByCategory[];
  initialMonthlyTrends: MonthlyTrend[];
  initialIncomeVsExpenses: IncomeVsExpenses;
  categories: Category[];
  selectedMonth: string;
}

export default function ReportsPageClient({
  initialSpendingByCategory,
  initialMonthlyTrends,
  initialIncomeVsExpenses,
  categories,
  selectedMonth,
}: ReportsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Use props directly instead of state since they update on navigation
  const spendingByCategory = initialSpendingByCategory;
  const incomeVsExpenses = initialIncomeVsExpenses;

  const [monthlyTrends, setMonthlyTrends] = useState(initialMonthlyTrends);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [isLoadingTrends, setIsLoadingTrends] = useState(false);

  const handleCategoryChange = async (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setIsLoadingTrends(true);

    try {
      const trends = await getMonthlyTrendsByCategory(categoryId || undefined);
      setMonthlyTrends(trends);
    } catch (error) {
      console.error('Error fetching trends:', error);
    } finally {
      setIsLoadingTrends(false);
    }
  };

  const handlePreviousMonth = () => {
    const prevMonth = getPreviousMonth(selectedMonth);
    const params = new URLSearchParams(searchParams);
    params.set('month', prevMonth);
    router.push(`/reports?${params.toString()}`);
  };

  const handleNextMonth = () => {
    const nextMonth = getNextMonth(selectedMonth);
    const params = new URLSearchParams(searchParams);
    params.set('month', nextMonth);
    router.push(`/reports?${params.toString()}`);
  };

  const handleCurrentMonth = () => {
    router.push('/reports');
  };

  const isCurrentMonth = selectedMonth === getCurrentMonth();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header with Month Navigator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Reports & Analytics
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousMonth}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              aria-label="Previous month"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="hidden sm:inline">Previous</span>
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 text-center">
                {formatMonth(selectedMonth)}
              </h3>
              {!isCurrentMonth && (
                <button
                  onClick={handleCurrentMonth}
                  className="text-xs sm:text-sm px-2 sm:px-3 py-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors whitespace-nowrap"
                >
                  Current
                </button>
              )}
            </div>

            <button
              onClick={handleNextMonth}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              aria-label="Next month"
            >
              <span className="hidden sm:inline">Next</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Spending by Category
          </h3>
          <SpendingByCategoryChart data={spendingByCategory} />
        </div>

        {/* Monthly Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
              Monthly Trends (Last 6 Months)
            </h3>
            <select
              value={selectedCategoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              disabled={isLoadingTrends}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          {isLoadingTrends ? (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              Loading...
            </div>
          ) : (
            <MonthlyTrendsChart data={monthlyTrends} />
          )}
        </div>
      </div>
    </div>
  );
}
