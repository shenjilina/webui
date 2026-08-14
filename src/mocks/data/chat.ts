import type { ChatSession, ReferenceItem } from '@/features/chat/types'

/** mock 会话列表（可变数组，供 handlers 增删） */
export const mockChatSessions: ChatSession[] = [
  {
    id: 'session-001',
    title: 'RAG 技术原理咨询',
    createdAt: '2025-06-10T09:00:00.000Z',
    updatedAt: '2025-06-10T09:30:00.000Z',
  },
  {
    id: 'session-002',
    title: '向量数据库选型讨论',
    createdAt: '2025-06-11T14:00:00.000Z',
    updatedAt: '2025-06-11T14:20:00.000Z',
  },
]

/** mock 流式回答分片（模拟大模型逐段输出） */
export const mockAnswerChunks: string[] = [
  '根据知识库中的文档，',
  '**RAG（检索增强生成）**',
  '是一种结合检索与生成的技术范式。\n\n',
  '其核心流程包括：\n\n',
  '1. **文档切分与向量化**：将知识库文档切分为语义完整的片段，并转换为向量存储\n',
  '2. **语义检索**：用户提问后，通过向量相似度检索出最相关的文档片段\n',
  '3. **上下文拼接与生成**：将检索结果作为上下文注入大语言模型，生成有据可依的回答\n\n',
  '这种架构的优势在于回答',
  '*可溯源*',
  '，且无需对模型进行微调即可更新知识。\n\n',
  '相关数学表达：相似度计算通常采用余弦相似度 \\(\\cos(\\theta) = \\frac{A \\cdot B}{\\|A\\|\\|B\\|}\\)。',
]

/** mock 溯源引用 */
export const mockReferences: ReferenceItem[] = [
  {
    documentId: 'doc-001',
    title: 'RAG 检索增强生成技术概述',
    snippet: 'RAG（Retrieval-Augmented Generation）是一种结合检索与生成的技术范式...',
    score: 0.92,
  },
  {
    documentId: 'doc-002',
    title: '向量数据库选型指南',
    snippet: '本文介绍主流向量数据库的特点与适用场景...',
    score: 0.85,
  },
]
