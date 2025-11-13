import { CategoryGroupBudgetData } from '@/lib/types/budget';
import CategoryRow from './CategoryRow';
import { formatCurrency } from '@/lib/utils/money';

interface CategoryGroupProps {
  group: CategoryGroupBudgetData;
}

export default function CategoryGroup({ group }: CategoryGroupProps) {
  const totalAssigned = formatCurrency(group.totalAssigned);
  const totalActivity = formatCurrency(Math.abs(group.totalActivity));
  const totalAvailable = formatCurrency(group.totalAvailable);

  const availableColor =
    group.totalAvailable > 0
      ? 'text-green-600'
      : group.totalAvailable < 0
      ? 'text-red-600'
      : 'text-gray-600';

  return (
    <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
      {/* Group Header - Scrollable on mobile */}
      <div className="bg-gray-50 px-2 sm:px-4 py-3 border-b border-gray-200 overflow-x-auto">
        <div className="grid grid-cols-4 gap-2 sm:gap-4 min-w-[600px] sm:min-w-0">
          <div className="col-span-1">
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide">
              {group.name}
            </h3>
          </div>
          <div className="col-span-1 text-right">
            <span className="text-xs font-semibold text-gray-600">
              {totalAssigned}
            </span>
          </div>
          <div className="col-span-1 text-right">
            <span className="text-xs font-semibold text-gray-600">
              {group.totalActivity !== 0 ? `-${totalActivity}` : '$0.00'}
            </span>
          </div>
          <div className="col-span-1 text-right">
            <span className={`text-xs font-bold ${availableColor}`}>
              {totalAvailable}
            </span>
          </div>
        </div>
      </div>

      {/* Column Headers - Scrollable on mobile */}
      <div className="px-2 sm:px-4 py-2 bg-gray-100 border-b border-gray-200 overflow-x-auto">
        <div className="grid grid-cols-4 gap-2 sm:gap-4 min-w-[600px] sm:min-w-0">
          <div className="col-span-1">
            <span className="text-xs font-semibold text-gray-600 uppercase">
              Category
            </span>
          </div>
          <div className="col-span-1 text-right">
            <span className="text-xs font-semibold text-gray-600 uppercase">
              Assigned
            </span>
          </div>
          <div className="col-span-1 text-right">
            <span className="text-xs font-semibold text-gray-600 uppercase">
              Activity
            </span>
          </div>
          <div className="col-span-1 text-right">
            <span className="text-xs font-semibold text-gray-600 uppercase">
              Available
            </span>
          </div>
        </div>
      </div>

      {/* Category Rows */}
      <div className="overflow-x-auto">
        {group.categories.map((category) => (
          <CategoryRow key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
