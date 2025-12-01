import { BudgetSummary } from '@/lib/types/budget';
import MoneyToAssign from './MoneyToAssign';
import CategoryGroup from './CategoryGroup';
import MonthNavigator from './MonthNavigator';
import { formatMonth } from '@/lib/utils/date';

interface BudgetDashboardProps {
  budgetData: BudgetSummary;
  currentMonth: string;
}

export default function BudgetDashboard({ budgetData, currentMonth }: BudgetDashboardProps) {
  const formattedMonth = formatMonth(currentMonth);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Month Navigation */}
      <MonthNavigator currentMonth={currentMonth} />

      {/* Money to Assign Section */}
      <MoneyToAssign
        amount={budgetData.moneyToAssign}
        totalAvailable={budgetData.totalAvailable}
        month={formattedMonth}
      />

      {/* Category Groups */}
      <div className="space-y-4">
        {budgetData.groups.map((group) => (
          <CategoryGroup key={group.id} group={group} currentMonth={currentMonth} />
        ))}
      </div>

      {/* Summary Footer */}
      {budgetData.groups.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            No budget categories found. Please set up your categories.
          </p>
        </div>
      )}
    </div>
  );
}
