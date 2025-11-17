'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { MonthlyTrend } from '@/lib/services/reports';
import { formatCurrency, milliunitsToDollars } from '@/lib/utils/money';

interface MonthlyTrendsChartProps {
  data: MonthlyTrend[];
}

export default function MonthlyTrendsChart({ data }: MonthlyTrendsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400 dark:text-gray-500">
        No trend data available
      </div>
    );
  }

  // Convert data for recharts
  const chartData = data.map((item) => ({
    month: item.month,
    Income: milliunitsToDollars(item.income),
    Expenses: milliunitsToDollars(item.expenses),
    Net: milliunitsToDollars(item.net),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip
          formatter={(value: number) => `$${value.toFixed(2)}`}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="Income"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ fill: '#10b981' }}
        />
        <Line
          type="monotone"
          dataKey="Expenses"
          stroke="#ef4444"
          strokeWidth={2}
          dot={{ fill: '#ef4444' }}
        />
        <Line
          type="monotone"
          dataKey="Net"
          stroke="#6366f1"
          strokeWidth={2}
          dot={{ fill: '#6366f1' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
