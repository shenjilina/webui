import type { ChunkInfo, DocumentInfo, FileInfo } from '@/features/document/types'
import type { KnowledgeBase } from '@/features/knowledge/types'
export const mockKnowledgeBase: KnowledgeBase = {
  id: 1,
  ownerId: 1,
  name: '接口演示知识库',
  description: '仅用于本地界面预览，不代表真实 RAG 服务',
  visibility: 'PRIVATE',
  status: 'ACTIVE',
  createdAt: '2026-10-17T08:00:00Z',
  updatedAt: '2026-10-17T08:00:00Z'
}
export const mockFiles: FileInfo[] = [
  {
    id: 1,
    ownerId: 1,
    filename: '演示文档.md',
    fileType: 'md',
    mimeType: 'text/markdown',
    fileSize: 128,
    fileMd5: 'mock-only',
    status: 'SUCCESS',
    storageStatus: 'PRESENT',
    createdAt: mockKnowledgeBase.createdAt,
    updatedAt: mockKnowledgeBase.updatedAt
  }
]
export const mockDocuments: DocumentInfo[] = [
  {
    id: 1,
    fileId: 1,
    knowledgeBaseId: 1,
    title: '演示文档',
    description: '只读演示数据',
    chunkCount: 1,
    parseStatus: 'SUCCESS',
    errorMsg: null,
    vectorCleaned: false,
    fileSize: 128,
    createdAt: mockKnowledgeBase.createdAt,
    updatedAt: mockKnowledgeBase.updatedAt
  }
]
export const mockChunks: ChunkInfo[] = [
  {
    id: 1,
    chunkIndex: 0,
    content: 'RAG 先检索知识库文档片段，再将片段交给语言模型生成答案。此文本仅为本地界面演示。',
    createdAt: mockKnowledgeBase.createdAt
  }
]
