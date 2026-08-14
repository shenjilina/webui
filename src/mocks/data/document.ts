import type { DocumentInfo } from '@/features/document/types'

/** mock 文档列表（可变数组，供 handlers 增删改） */
export const mockDocuments: DocumentInfo[] = [
  {
    id: 'doc-001',
    title: 'RAG 检索增强生成技术概述',
    content:
      'RAG（Retrieval-Augmented Generation）是一种结合检索与生成的技术范式。它通过在生成前从知识库中检索相关文档片段，将其作为上下文注入大语言模型，从而提升回答的准确性与可溯源性。\n\n## 核心流程\n1. 文档切分与向量化\n2. 语义检索\n3. 上下文拼接与生成',
    type: 'md',
    vectorStatus: 'success',
    taskStatus: 'success',
    createdAt: '2025-06-01T08:00:00.000Z',
    updatedAt: '2025-06-10T10:20:00.000Z',
  },
  {
    id: 'doc-002',
    title: '向量数据库选型指南',
    content:
      '本文介绍主流向量数据库（Milvus、Qdrant、Weaviate、FAISS）的特点与适用场景，包括索引类型、距离度量、扩展性等关键指标的对比分析。',
    type: 'pdf',
    vectorStatus: 'success',
    taskStatus: 'success',
    createdAt: '2025-06-03T09:15:00.000Z',
    updatedAt: '2025-06-03T09:15:00.000Z',
  },
  {
    id: 'doc-003',
    title: '提示词工程最佳实践',
    content:
      '提示词工程（Prompt Engineering）是提升大语言模型输出质量的关键手段。常见的技巧包括：Few-shot 示例、思维链（Chain-of-Thought）、角色设定与输出格式约束等。',
    type: 'txt',
    vectorStatus: 'processing',
    taskStatus: 'processing',
    createdAt: '2025-06-08T14:00:00.000Z',
    updatedAt: '2025-06-08T14:05:00.000Z',
  },
  {
    id: 'doc-004',
    title: '知识库问答系统部署手册',
    content:
      '本手册描述知识库问答系统的部署流程：环境准备、服务启动、健康检查与常见问题排查。',
    type: 'md',
    vectorStatus: 'pending',
    taskStatus: 'pending',
    createdAt: '2025-06-12T16:40:00.000Z',
    updatedAt: '2025-06-12T16:40:00.000Z',
  },
]
