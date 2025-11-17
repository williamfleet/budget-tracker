'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { SpendingByCategory } from '@/lib/services/reports';
import { formatCurrency } from '@/lib/utils/money';

interface SpendingByCategoryChartProps {
  data: SpendingByCategory[];
}

// Color palette for the pie chart
const COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#ef4444', // red
  '#14b8a6', // teal
  '#f97316', // orange
  '#a855f7', // purple
];

export default function SpendingByCategoryChart({
  data,
}: SpendingByCategoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No spending data available for this period
      </div>
    );
  }

  // Convert data for recharts (make values positive for pie chart)
  const chartData = data.map((item) => ({
    name: item.category_name,
    value: Math.abs(item.total_spent), // Convert to positive for display
    displayValue: formatCurrency(item.total_spent), // Keep original for tooltip
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) =>
            percent ? `${name}: ${(percent * 100).toFixed(0)}%` : name
          }
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
