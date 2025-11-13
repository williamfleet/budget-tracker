import { formatCurrency } from '@/lib/utils/money';

interface MoneyToAssignProps {
  amount: number; // in milliunits
  totalAvailable: number; // in milliunits
  month: string; // e.g., "November 2025"
}

export default function MoneyToAssign({
  amount,
  totalAvailable,
  month,
}: MoneyToAssignProps) {
  const formatted = formatCurrency(amount);
  const formattedAvailable = formatCurrency(totalAvailable);
  const isPositive = amount > 0;
  const isNegative = amount < 0;

  const availableColor =
    totalAvailable > 0
      ? 'text-green-600'
      : totalAvailable < 0
      ? 'text-red-600'
      : 'text-gray-900';

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Money to Assign */}
        <div className="text-center sm:text-left">
          <h2 className="text-sm font-medium text-gray-600 mb-1">
            Money to Assign
          </h2>
          <p className="text-xs text-gray-500 mb-2">{month}</p>
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
            <p className="text-xs text-gray-500 mt-1">All money assigned</p>
          )}
        </div>

        {/* Total Available */}
        <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-gray-200 pt-4 sm:pt-0 sm:pl-6">
          <h2 className="text-sm font-medium text-gray-600 mb-1">
            Total Available
          </h2>
          <p className="text-xs text-gray-500 mb-2">Across all categories</p>
          <p className={`text-2xl sm:text-3xl font-bold ${availableColor}`}>
            {formattedAvailable}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {totalAvailable >= 0
              ? 'Available to spend'
              : 'Overspent - need to cover'}
          </p>
        </div>
      </div>
    </div>
  );
}
