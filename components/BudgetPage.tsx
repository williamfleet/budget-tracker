'use client';

import { useState } from 'react';
import { BudgetSummary, Category, CategoryGroup } from '@/lib/types/budget';
import { Account } from '@/lib/types/accounts';
import BudgetDashboard from './budget/BudgetDashboard';
import AddTransactionButton from './transactions/AddTransactionButton';
import TransactionForm, {
  TransactionFormData,
} from './transactions/TransactionForm';
import { createTransaction } from '@/app/actions/transactions';

interface BudgetPageProps {
  budgetData: BudgetSummary;
  categories: Category[];
  groups: CategoryGroup[];
  accounts: Account[];
  currentMonth: string;
}

export default function BudgetPage({
  budgetData,
  categories,
  groups,
  accounts,
  currentMonth,
}: BudgetPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (formData: TransactionFormData) => {
    await createTransaction({
      type: formData.type,
      amount: formData.amount,
      date: formData.date,
      payee: formData.payee || null,
      category_id: formData.category_id,
      account_id: formData.account_id || null,
      memo: formData.memo || null,
    });
  };

  return (
    <>
      <BudgetDashboard budgetData={budgetData} currentMonth={currentMonth} />
      <AddTransactionButton onClick={() => setIsModalOpen(true)} />
      <TransactionForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        groups={groups}
        accounts={accounts}
        onSubmit={handleSubmit}
      />
    </>
  );
}
