import { formatCurrency } from '@/lib/utils/money';
import { CategoryBudgetData } from '@/lib/types/budget';

interface CategoryRowProps {
  category: CategoryBudgetData;
}

export default function CategoryRow({ category }: CategoryRowProps) {
  const assigned = formatCurrency(category.assigned);
  const activity = formatCurrency(Math.abs(category.activity));
  const available = formatCurrency(category.available);

  // Color coding for available balance
  const availableColor =
    category.available > 0
      ? 'text-green-600'
      : category.available < 0
      ? 'text-red-600'
      : 'text-gray-600';

  return (
    <div className="grid grid-cols-4 gap-4 py-3 px-4 hover:bg-gray-50 border-b border-gray-100">
      {/* Category Name */}
      <div className="col-span-1 flex items-center">
        <span className="text-sm font-medium text-gray-900">
          {category.name}
        </span>
      </div>

      {/* Assigned */}
      <div className="col-span-1 flex items-center justify-end">
        <span className="text-sm text-gray-900">{assigned}</span>
      </div>

      {/* Activity */}
      <div className="col-span-1 flex items-center justify-end">
        <span className="text-sm text-gray-600">
          {category.activity !== 0 ? `-${activity}` : '$0.00'}
        </span>
      </div>

      {/* Available */}
      <div className="col-span-1 flex items-center justify-end">
        <span className={`text-sm font-semibold ${availableColor}`}>
          {available}
        </span>
      </div>
    </div>
  );
}
