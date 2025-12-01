'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, TooltipProps } from 'recharts';
import { SpendingByCategory } from '@/lib/services/reports';
import { formatCurrency } from '@/lib/utils/money';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

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

// Custom tooltip component
interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      name: string;
      value: number;
      displayValue: string;
      isOther?: boolean;
      otherBreakdown?: Array<{ name: string; value: number; displayValue: string }>;
    };
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
      <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{data.name}</p>
      <p className="text-gray-600 dark:text-gray-300">{formatCurrency(data.value)}</p>

      {data.isOther && data.otherBreakdown && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Breakdown:</p>
          <div className="max-h-48 overflow-y-auto">
            {data.otherBreakdown.map((item, index) => (
              <div key={index} className="flex justify-between items-center gap-4 text-xs py-0.5">
                <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">{item.displayValue}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function SpendingByCategoryChart({
  data,
}: SpendingByCategoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400 dark:text-gray-500">
        No spending data available for this period
      </div>
    );
  }

  // Sort data by spending (highest to lowest)
  const sortedData = [...data].sort((a, b) => Math.abs(b.total_spent) - Math.abs(a.total_spent));

  // Take top 10 categories
  const topCategories = sortedData.slice(0, 10);
  const remainingCategories = sortedData.slice(10);

  // Define chart data type
  type ChartDataItem = {
    name: string;
    value: number;
    displayValue: string;
    isOther?: boolean;
    otherBreakdown?: Array<{ name: string; value: number; displayValue: string }>;
  };

  // Convert top categories to chart data
  const chartData: ChartDataItem[] = topCategories.map((item) => ({
    name: item.category_name,
    value: Math.abs(item.total_spent),
    displayValue: formatCurrency(item.total_spent),
    isOther: false,
    otherBreakdown: undefined,
  }));

  // Add "Other" category if there are remaining categories
  if (remainingCategories.length > 0) {
    const otherTotal = remainingCategories.reduce((sum, item) => sum + Math.abs(item.total_spent), 0);
    const otherBreakdown = remainingCategories.map((item) => ({
      name: item.category_name,
      value: Math.abs(item.total_spent),
      displayValue: formatCurrency(item.total_spent),
    }));

    chartData.push({
      name: `Other (${remainingCategories.length} categories)`,
      value: otherTotal,
      displayValue: formatCurrency(otherTotal),
      isOther: true,
      otherBreakdown,
    });
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={true}
          label={({ name, percent }) =>
            percent && percent > 0.03 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
          }
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
