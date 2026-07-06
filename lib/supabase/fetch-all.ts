const PAGE_SIZE = 1000;

interface PageQuery<T> {
  order(column: string): {
    range(from: number, to: number): PromiseLike<{ data: T[] | null; error: unknown }>;
  };
}

/**
 * Fetch every row matching a query by paging through it in chunks,
 * bypassing PostgREST's 1000-row cap on unbounded selects.
 *
 * Orders by `id` so pages are stable across requests — the table must
 * have an `id` column.
 */
export async function fetchAllRows<T = any>(
  buildQuery: () => PageQuery<T>
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await buildQuery()
      .order('id')
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) return rows;
  }
}
