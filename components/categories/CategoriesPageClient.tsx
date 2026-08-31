'use client';

import { useState } from 'react';
import { Category, CategoryGroup } from '@/lib/types/budget';
import CategoryFormModal, {
  CategoryFormData,
} from './CategoryFormModal';
import {
  createCategory,
  updateCategory,
  archiveCategory,
  unarchiveCategory,
} from '@/app/actions/categories';
import { formatCurrency, formatOrdinalDay } from '@/lib/utils/money';
import CategoryRow from './CategoryRow';

interface CategoriesPageClientProps {
  groups: CategoryGroup[];
  categories: Category[];
}

export default function CategoriesPageClient({
  groups,
  categories,
}: CategoriesPageClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: CategoryFormData) => {
    if (data.id) {
      await updateCategory({
        id: data.id,
        name: data.name,
        target_amount: data.target_amount,
        charge_day: data.charge_day,
        is_checking: data.is_checking,
      });
    } else {
      await createCategory({
        name: data.name,
        group_id: data.group_id,
        target_amount: data.target_amount,
        charge_day: data.charge_day,
        is_checking: data.is_checking,
      });
    }
  };

  const handleArchive = async (category: Category) => {
    if (
      confirm(
        `Archive "${category.name}"? It will no longer appear in future months, but historical data will be preserved.`
      )
    ) {
      try {
        await archiveCategory(category.id);
      } catch (error: any) {
        alert(error.message || 'Failed to archive category');
      }
    }
  };

  const handleUnarchive = async (category: Category) => {
    try {
      await unarchiveCategory(category.id);
    } catch (error: any) {
      alert(error.message || 'Failed to unarchive category');
    }
  };

  // Separate active and archived categories
  const activeCategories = categories.filter((cat) => !cat.archived);
  const archivedCategories = categories.filter((cat) => cat.archived);

  // Group active categories by group, with each group's target total
  const activeCategoriesByGroup = groups.map((group) => {
    const groupCategories = activeCategories.filter(
      (cat) => cat.group_id === group.id
    );

    return {
      group,
      categories: groupCategories,
      totalTarget: groupCategories.reduce(
        (sum, cat) => sum + cat.target_amount,
        0
      ),
    };
  });

  // Overall target total across all non-archived categories
  const totalTarget = activeCategories.reduce(
    (sum, cat) => sum + cat.target_amount,
    0
  );

  // Group archived categories by group (for collapsed view)
  const archivedCategoriesByGroup = groups.map((group) => ({
    group,
    categories: archivedCategories.filter((cat) => cat.group_id === group.id),
  }));

  return (
    <>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Categories
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Manage your budget categories and monthly targets
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm sm:text-base"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="hidden sm:inline">New Category</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>

        {/* Active Categories by Group */}
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Active Categories</h3>
            <div className="text-right">
              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Target
              </span>
              <span className="ml-2 text-lg font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(totalTarget)}
              </span>
            </div>
          </div>
          {activeCategoriesByGroup.map(({ group, categories: groupCategories, totalTarget: groupTarget }) => (
            <div
              key={group.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
            >
              {/* Group Header */}
              <div className="flex items-center justify-between gap-2 bg-gray-50 dark:bg-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                  {group.name}
                </h3>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                  {formatCurrency(groupTarget)}
                </span>
              </div>

              {/* Categories Table */}
              {groupCategories.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm">
                  No categories in this group yet
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Target
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Due Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Checking
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {groupCategories.map((category) => (
                        <CategoryRow
                          key={category.id}
                          category={category}
                          onEdit={handleEdit}
                          onArchive={handleArchive}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Archived Categories */}
        {archivedCategories.length > 0 && (
          <div className="mt-8 space-y-6">
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Archived Categories</h3>
            {archivedCategoriesByGroup.map(({ group, categories: groupCategories }) => {
              if (groupCategories.length === 0) return null;
              return (
                <div
                  key={`archived-${group.id}`}
                  className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden"
                >
                  {/* Group Header */}
                  <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                      {group.name}
                    </h3>
                  </div>

                  {/* Archived Categories Table */}
                  <div className="overflow-x-auto opacity-75">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Target
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Due Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Checking
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-50 dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {groupCategories.map((category) => (
                          <tr key={category.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                            <td className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                              {category.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                              {formatCurrency(category.target_amount)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                              {formatOrdinalDay(category.charge_day)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                              {category.is_checking ? 'Yes' : 'No'}
                            </td>
                            <td className="px-4 py-3 text-right text-sm">
                              <button
                                onClick={() => handleUnarchive(category)}
                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 font-medium"
                              >
                                Unarchive
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Category Form Modal */}
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={handleSubmit}
        groups={groups}
        category={editingCategory}
      />
    </>
  );
}
