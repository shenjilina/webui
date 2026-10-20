import { expect, it } from 'vitest'
import { collectPages } from './pagination'
it('collects every page instead of silently dropping rows after 100', async () => {
  const pages: number[] = []
  const items = await collectPages(async (page) => {
    pages.push(page)
    return { items: page === 1 ? [1, 2] : [3], total: 3, page, pageSize: 2 }
  })
  expect(items).toEqual([1, 2, 3])
  expect(pages).toEqual([1, 2])
})
