import { beforeEach, expect, it, vi } from 'vitest'
import { deleteKnowledgeBase, updateKnowledgeBase, updateKnowledgeBaseStatus } from './index'
import { del, patch } from '@/shared/utils/http'
vi.mock('@/shared/utils/http', () => ({ post: vi.fn(), patch: vi.fn(), del: vi.fn() }))
beforeEach(() => vi.clearAllMocks())
it('uses PATCH for metadata and status, DELETE with exact confirmation for removal', () => {
  updateKnowledgeBase({ knowledgeBaseId: 2, name: '产品文档' })
  expect(patch).toHaveBeenCalledWith('/knowledge-bases/update', {
    knowledgeBaseId: 2,
    name: '产品文档'
  })
  updateKnowledgeBaseStatus({ knowledgeBaseId: 2, status: 'ARCHIVED' })
  expect(patch).toHaveBeenCalledWith('/knowledge-bases/status', {
    knowledgeBaseId: 2,
    status: 'ARCHIVED'
  })
  deleteKnowledgeBase({ knowledgeBaseId: 2, confirmationName: '产品文档' })
  expect(del).toHaveBeenCalledWith('/knowledge-bases/delete', {
    knowledgeBaseId: 2,
    confirmationName: '产品文档'
  })
})
