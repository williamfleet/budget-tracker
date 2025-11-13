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
  const totalTarget = formatCurrency(
    group.categories.reduce((sum, cat) => sum + cat.target_amount, 0)
  );

  const availableColor =
    group.totalAvailable > 0
      ? 'text-green-600'
      : group.totalAvailable < 0
      ? 'text-red-600'
      : 'text-gray-600';

  return (
    <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
      {/* Single scroll container for entire group */}
      <div className="overflow-x-auto">
        {/* Group Header - Sticky category column on mobile */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="flex sm:grid sm:grid-cols-5 sm:gap-4 px-2 sm:px-4 py-3">
            {/* Sticky category column on mobile */}
            <div className="sticky left-0 bg-gray-50 z-10 w-32 sm:w-auto flex-shrink-0 sm:col-span-1 pr-2 sm:pr-0">
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide">
                {group.name}
              </h3>
            </div>
            {/* Scrollable columns */}
            <div className="flex gap-8 sm:gap-0 sm:contents">
              <div className="w-24 sm:w-auto flex-shrink-0 sm:col-span-1 text-right">
                <span className="text-xs font-semibold text-gray-600">
                  {totalAssigned}
                </span>
              </div>
              <div className="w-24 sm:w-auto flex-shrink-0 sm:col-span-1 text-right">
                <span className="text-xs font-semibold text-gray-600">
                  {group.totalActivity !== 0 ? `-${totalActivity}` : '$0.00'}
                </span>
              </div>
              <div className="w-24 sm:w-auto flex-shrink-0 sm:col-span-1 text-right">
                <span className={`text-xs font-bold ${availableColor}`}>
                  {totalAvailable}
                </span>
              </div>
              <div className="w-24 sm:w-auto flex-shrink-0 sm:col-span-1 text-right pr-2 sm:pr-0">
                <span className="text-xs font-semibold text-gray-500">
                  {totalTarget}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Column Headers - Sticky category column on mobile */}
        <div className="bg-gray-100 border-b border-gray-200">
          <div className="flex sm:grid sm:grid-cols-5 sm:gap-4 px-2 sm:px-4 py-2">
            {/* Sticky header */}
            <div className="sticky left-0 bg-gray-100 z-10 w-32 sm:w-auto flex-shrink-0 sm:col-span-1 pr-2 sm:pr-0">
              <span className="text-xs font-semibold text-gray-600 uppercase">
                Category
              </span>
            </div>
            {/* Scrollable headers */}
            <div className="flex gap-8 sm:gap-0 sm:contents">
              <div className="w-24 sm:w-auto flex-shrink-0 sm:col-span-1 text-right">
                <span className="text-xs font-semibold text-gray-600 uppercase">
                  Assigned
                </span>
              </div>
              <div className="w-24 sm:w-auto flex-shrink-0 sm:col-span-1 text-right">
                <span className="text-xs font-semibold text-gray-600 uppercase">
                  Activity
                </span>
              </div>
              <div className="w-24 sm:w-auto flex-shrink-0 sm:col-span-1 text-right">
                <span className="text-xs font-semibold text-gray-600 uppercase">
                  Available
                </span>
              </div>
              <div className="w-24 sm:w-auto flex-shrink-0 sm:col-span-1 text-right pr-2 sm:pr-0">
                <span className="text-xs font-semibold text-gray-600 uppercase">
                  Target
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Rows */}
        <div>
          {group.categories.map((category) => (
            <CategoryRow key={category.id} category={category} />
          ))}
        </div>
      </div>
    </div>
  );
}
