import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Navigation from '@/components/Navigation';
import CategoriesPageClient from '@/components/categories/CategoriesPageClient';
import { getCategories } from '@/lib/services/budget';

export default async function CategoriesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { groups, categories } = await getCategories(user.id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation userEmail={user.email} />

      <main className="px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <CategoriesPageClient groups={groups} categories={categories} />
      </main>
    </div>
  );
}
