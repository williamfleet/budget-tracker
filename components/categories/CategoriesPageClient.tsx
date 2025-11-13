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
import { formatCurrency } from '@/lib/utils/money';

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
      });
    } else {
      await createCategory({
        name: data.name,
        group_id: data.group_id,
        target_amount: data.target_amount,
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

  // Group active categories by group
  const activeCategoriesByGroup = groups.map((group) => ({
    group,
    categories: activeCategories.filter((cat) => cat.group_id === group.id),
  }));

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
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Categories
            </h2>
            <p className="text-sm text-gray-600 mt-1">
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
          <h3 className="text-lg font-semibold text-gray-900">Active Categories</h3>
          {activeCategoriesByGroup.map(({ group, categories: groupCategories }) => (
            <div
              key={group.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {/* Group Header */}
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 uppercase tracking-wide">
                  {group.name}
                </h3>
              </div>

              {/* Categories List */}
              <div className="divide-y divide-gray-100">
                {groupCategories.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    No categories in this group yet
                  </div>
                ) : (
                  groupCategories.map((category) => (
                    <div
                      key={category.id}
                      className="px-4 py-3 hover:bg-gray-50 flex items-center justify-between"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                          {category.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          Target: {formatCurrency(category.target_amount)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleArchive(category)}
                          className="text-orange-600 hover:text-orange-900 text-sm font-medium"
                        >
                          Archive
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Archived Categories */}
        {archivedCategories.length > 0 && (
          <div className="mt-8 space-y-6">
            <h3 className="text-lg font-semibold text-gray-600">Archived Categories</h3>
            {archivedCategoriesByGroup.map(({ group, categories: groupCategories }) => {
              if (groupCategories.length === 0) return null;
              return (
                <div
                  key={`archived-${group.id}`}
                  className="bg-gray-50 rounded-lg shadow-sm overflow-hidden"
                >
                  {/* Group Header */}
                  <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wide">
                      {group.name}
                    </h3>
                  </div>

                  {/* Archived Categories List */}
                  <div className="divide-y divide-gray-200">
                    {groupCategories.map((category) => (
                      <div
                        key={category.id}
                        className="px-4 py-3 flex items-center justify-between opacity-75"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-medium text-gray-600 truncate">
                            {category.name}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-400">
                            Target: {formatCurrency(category.target_amount)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleUnarchive(category)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          >
                            Unarchive
                          </button>
                        </div>
                      </div>
                    ))}
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
