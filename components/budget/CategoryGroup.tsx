import { CategoryGroupBudgetData } from '@/lib/types/budget';
import CategoryRow from './CategoryRow';
import { formatCurrency } from '@/lib/utils/money';

interface CategoryGroupProps {
  group: CategoryGroupBudgetData;
  currentMonth: string;
}

export default function CategoryGroup({ group, currentMonth }: CategoryGroupProps) {
  const totalAssigned = formatCurrency(group.totalAssigned);
  const totalActivity = formatCurrency(Math.abs(group.totalActivity));
  const totalAvailable = formatCurrency(group.totalAvailable);
  const totalTarget = formatCurrency(
    group.categories.reduce((sum, cat) => sum + cat.target_amount, 0)
  );

  const availableColor =
    group.totalAvailable > 0
      ? 'text-green-600 dark:text-green-400'
      : group.totalAvailable < 0
      ? 'text-red-600 dark:text-red-400'
      : 'text-gray-600 dark:text-gray-300';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-4 overflow-hidden">
      {/* Group Header */}
      <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        {/* Mobile: 3 columns */}
        <div className="grid grid-cols-3 gap-2 px-3 py-3 sm:hidden">
          <div>
            <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide truncate">
              {group.name}
            </h3>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              {totalAssigned}
            </span>
          </div>
          <div className="text-right">
            <span className={`text-xs font-bold ${availableColor}`}>
              {totalAvailable}
            </span>
          </div>
        </div>

        {/* Desktop: 6 columns */}
        <div className="hidden sm:grid sm:grid-cols-6 sm:gap-4 px-4 py-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
              {group.name}
            </h3>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              {totalAssigned}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              {group.totalActivity !== 0 ? `-${totalActivity}` : '$0.00'}
            </span>
          </div>
          <div className="text-right">
            <span className={`text-xs font-bold ${availableColor}`}>
              {totalAvailable}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {totalTarget}
            </span>
          </div>
          <div className="text-center">
            {/* Empty for Date column in header */}
          </div>
        </div>
      </div>

      {/* Column Headers */}
      <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {/* Mobile: 3 columns */}
        <div className="grid grid-cols-3 gap-2 px-3 py-2 sm:hidden">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
            Category
          </span>
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase text-right">
            Assigned
          </span>
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase text-right">
            Available
          </span>
        </div>

        {/* Desktop: 6 columns */}
        <div className="hidden sm:grid sm:grid-cols-6 sm:gap-4 px-4 py-2">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
            Category
          </span>
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase text-right">
            Assigned
          </span>
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase text-right">
            Activity
          </span>
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase text-right">
            Available
          </span>
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase text-right">
            Target
          </span>
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase text-center">
            Date
          </span>
        </div>
      </div>

      {/* Category Rows */}
      <div>
        {group.categories.map((category) => (
          <CategoryRow key={category.id} category={category} currentMonth={currentMonth} />
        ))}
      </div>
    </div>
  );
}
