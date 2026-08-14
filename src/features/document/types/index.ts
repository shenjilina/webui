import type { VectorTaskStatusType, DocumentTypeType } from '@/shared/utils/constants'
import type { PaginationParams } from '@/shared/types'

/** 文档信息 */
export interface DocumentInfo {
  id: string
  title: string
  content: string
  type: DocumentTypeType
  vectorStatus: VectorTaskStatusType
  taskStatus: VectorTaskStatusType
  createdAt: string
  updatedAt: string
}

/** 文档列表请求参数 */
export interface DocumentListParams extends PaginationParams {
  keyword?: string
}

/** 创建文档请求 */
export interface CreateDocumentRequest {
  title: string
  content: string
  type: DocumentTypeType
}

/** 更新文档请求 */
export interface UpdateDocumentRequest {
  title: string
  content: string
}

/** 文档选项（问答范围选择） */
export interface DocumentOption {
  id: string
  title: string
}

/** 向量任务启动响应 */
export interface VectorTaskStartResponse {
  taskId: string
}

/** 向量任务状态响应 */
export interface VectorTaskStatusResponse {
  taskId: string
  status: VectorTaskStatusType
  documentId: string
}

/** 向量任务重试请求 */
export interface VectorTaskRetryRequest {
  taskId: string
}
