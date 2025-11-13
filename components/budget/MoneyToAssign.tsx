import { formatCurrency } from '@/lib/utils/money';

interface MoneyToAssignProps {
  amount: number; // in milliunits
  month: string; // e.g., "November 2025"
}

export default function MoneyToAssign({ amount, month }: MoneyToAssignProps) {
  const formatted = formatCurrency(amount);
  const isPositive = amount > 0;
  const isNegative = amount < 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-3 sm:gap-0">
        <div className="text-center sm:text-left">
          <h2 className="text-sm font-medium text-gray-600 mb-1">
            Money to Assign
          </h2>
          <p className="text-xs text-gray-500">{month}</p>
        </div>
        <div className="text-center sm:text-right">
          <p
            className={`text-2xl sm:text-3xl font-bold ${
              isPositive
                ? 'text-green-600'
                : isNegative
                ? 'text-red-600'
                : 'text-gray-900'
            }`}
          >
            {formatted}
          </p>
          {isPositive && (
            <p className="text-xs text-gray-500 mt-1">
              Ready to assign to categories
            </p>
          )}
          {isNegative && (
            <p className="text-xs text-red-500 mt-1">
              Over-assigned! Adjust your budget.
            </p>
          )}
          {!isPositive && !isNegative && (
            <p className="text-xs text-gray-500 mt-1">
              All money assigned
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
