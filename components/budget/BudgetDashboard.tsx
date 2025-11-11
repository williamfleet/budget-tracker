import { BudgetSummary } from '@/lib/types/budget';
import MoneyToAssign from './MoneyToAssign';
import CategoryGroup from './CategoryGroup';
import { formatMonth, getCurrentMonth } from '@/lib/utils/date';

interface BudgetDashboardProps {
  budgetData: BudgetSummary;
}

export default function BudgetDashboard({ budgetData }: BudgetDashboardProps) {
  const currentMonth = getCurrentMonth();
  const formattedMonth = formatMonth(currentMonth);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Money to Assign Section */}
      <MoneyToAssign amount={budgetData.moneyToAssign} month={formattedMonth} />

      {/* Category Groups */}
      <div className="space-y-4">
        {budgetData.groups.map((group) => (
          <CategoryGroup key={group.id} group={group} />
        ))}
      </div>

      {/* Summary Footer */}
      {budgetData.groups.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">
            No budget categories found. Please set up your categories.
          </p>
        </div>
      )}
    </div>
  );
}
