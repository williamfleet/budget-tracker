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
      {/* Group Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-1">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
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

      {/* Column Headers */}
      <div className="grid grid-cols-4 gap-4 px-4 py-2 bg-gray-100 border-b border-gray-200">
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

      {/* Category Rows */}
      <div>
        {group.categories.map((category) => (
          <CategoryRow key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
