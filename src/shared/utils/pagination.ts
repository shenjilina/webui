interface Page<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}
export async function collectPages<T>(fetchPage: (page: number) => Promise<Page<T>>): Promise<T[]> {
  const items: T[] = []
  for (let page = 1; ; page += 1) {
    const result = await fetchPage(page)
    items.push(...result.items)
    if (items.length >= result.total || result.items.length === 0) return items
  }
}
