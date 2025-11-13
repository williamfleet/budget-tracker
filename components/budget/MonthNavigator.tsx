'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { formatMonth, getPreviousMonth, getNextMonth, getCurrentMonth } from '@/lib/utils/date';

interface MonthNavigatorProps {
  currentMonth: string;
}

export default function MonthNavigator({ currentMonth }: MonthNavigatorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCurrentMonth = currentMonth === getCurrentMonth();

  const handlePreviousMonth = () => {
    const prevMonth = getPreviousMonth(currentMonth);
    const params = new URLSearchParams(searchParams);
    params.set('month', prevMonth);
    router.push(`/?${params.toString()}`);
  };

  const handleNextMonth = () => {
    const nextMonth = getNextMonth(currentMonth);
    const params = new URLSearchParams(searchParams);
    params.set('month', nextMonth);
    router.push(`/?${params.toString()}`);
  };

  const handleCurrentMonth = () => {
    router.push('/');
  };

  return (
    <div className="flex items-center justify-between bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
      <button
        onClick={handlePreviousMonth}
        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
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
        <h2 className="text-base sm:text-lg font-bold text-gray-900 text-center">
          {formatMonth(currentMonth)}
        </h2>
        {!isCurrentMonth && (
          <button
            onClick={handleCurrentMonth}
            className="text-xs sm:text-sm px-2 sm:px-3 py-1 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors whitespace-nowrap"
          >
            Current
          </button>
        )}
      </div>

      <button
        onClick={handleNextMonth}
        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
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
  );
}
