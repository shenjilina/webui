import { beforeEach, expect, it, vi } from 'vitest'
import {
  listFiles,
  listAllDocuments,
  listAllFiles,
  retryDocuments,
  listDocumentChunks
} from './index'
import { post } from '@/shared/utils/http'
vi.mock('@/shared/utils/http', () => ({ post: vi.fn() }))
beforeEach(() => vi.mocked(post).mockReset())
it('does not leak knowledgeBaseId or unknown keys into the user-level file list', () => {
  listFiles({ knowledgeBaseId: 99, page: 1, pageSize: 20 } as Parameters<typeof listFiles>[0])
  expect(post).toHaveBeenCalledWith('/files/list', { page: 1, pageSize: 20 })
})
it('fetches every document page with knowledge base isolation', async () => {
  vi.mocked(post)
    .mockResolvedValueOnce({ items: [{ id: 1 }], total: 2, page: 1, pageSize: 1 })
    .mockResolvedValueOnce({ items: [{ id: 2 }], total: 2, page: 2, pageSize: 1 })
  expect(await listAllDocuments(7)).toEqual([{ id: 1 }, { id: 2 }])
  expect(post).toHaveBeenLastCalledWith('/documents/list', {
    knowledgeBaseId: 7,
    page: 2,
    pageSize: 100
  })
})
it('fetches all files without a knowledge base filter', async () => {
  vi.mocked(post).mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 100 })
  await listAllFiles()
  expect(post).toHaveBeenCalledWith('/files/list', { page: 1, pageSize: 100 })
})
it('uses documented retry and chunk payloads', () => {
  retryDocuments(7)
  expect(post).toHaveBeenCalledWith('/documents/retry', { knowledgeBaseId: 7 })
  listDocumentChunks(3, 2, 20)
  expect(post).toHaveBeenCalledWith('/documents/chunks', { documentId: 3, page: 2, pageSize: 20 })
})
