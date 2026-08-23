export type KnowledgeBaseVisibility = 'PRIVATE' | 'PUBLIC'
export type KnowledgeBaseStatus = 'ACTIVE' | 'DISABLED' | 'ARCHIVED'

export interface KnowledgeBase {
  id: number
  ownerId: number
  name: string
  description: string | null
  visibility: KnowledgeBaseVisibility
  status: KnowledgeBaseStatus
  createdAt: string
  updatedAt: string
}

export interface KnowledgeBasePage {
  items: KnowledgeBase[]
  total: number
  page: number
  pageSize: number
}

export interface KnowledgeBaseSummary {
  knowledgeBase: KnowledgeBase
  fileCount: number
  validDocumentCount: number
  failedDocumentCount: number
}

export interface CreateKnowledgeBaseRequest {
  name: string
  description?: string | null
  visibility?: KnowledgeBaseVisibility
}

export interface ListKnowledgeBasesRequest {
  query?: string | null
  status?: KnowledgeBaseStatus | null
  page?: number
  pageSize?: number
}

export interface KnowledgeBaseDetailRequest {
  knowledgeBaseId: number
}

export interface UpdateKnowledgeBaseRequest extends KnowledgeBaseDetailRequest {
  name?: string | null
  description?: string | null
  visibility?: KnowledgeBaseVisibility
}

export interface UpdateKnowledgeBaseStatusRequest extends KnowledgeBaseDetailRequest {
  status: KnowledgeBaseStatus
}

export interface DeleteKnowledgeBaseRequest extends KnowledgeBaseDetailRequest {
  confirmationName: string
}
