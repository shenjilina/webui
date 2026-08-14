import { get, post, put, del } from '@/shared/utils/http'
import type { PaginatedData } from '@/shared/utils/http'
import type {
  DocumentInfo,
  DocumentListParams,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  DocumentOption,
  VectorTaskStartResponse,
  VectorTaskStatusResponse,
  VectorTaskRetryRequest,
} from '../types'

/** 文档分页列表 */
export function getDocumentList(params: DocumentListParams): Promise<PaginatedData<DocumentInfo>> {
  return get<PaginatedData<DocumentInfo>>('/document/list', params as unknown as Record<string, unknown>)
}

/** 文档详情 */
export function getDocument(id: string): Promise<DocumentInfo> {
  return get<DocumentInfo>(`/document/${id}`)
}

/** 创建文档 */
export function createDocument(data: CreateDocumentRequest): Promise<DocumentInfo> {
  return post<DocumentInfo>('/document', data)
}

/** 更新文档 */
export function updateDocument(id: string, data: UpdateDocumentRequest): Promise<void> {
  return put<void>(`/document/${id}`, data)
}

/** 删除文档 */
export function deleteDocument(id: string): Promise<void> {
  return del<void>(`/document/${id}`)
}

/** 文件上传 */
export function uploadDocument(file: File): Promise<DocumentInfo> {
  const formData = new FormData()
  formData.append('file', file)
  return post<DocumentInfo>('/document/upload', formData)
}

/** 问答范围选择数据源 */
export function getDocumentOptions(): Promise<DocumentOption[]> {
  return get<DocumentOption[]>('/document/options')
}

/** 发起向量化任务 */
export function startVectorTask(documentId: string): Promise<VectorTaskStartResponse> {
  return post<VectorTaskStartResponse>('/vector/task/start', { documentId })
}

/** 查询任务状态 */
export function getVectorTaskStatus(taskId: string): Promise<VectorTaskStatusResponse> {
  return get<VectorTaskStatusResponse>('/vector/task/status', { taskId })
}

/** 失败任务重试 */
export function retryVectorTask(data: VectorTaskRetryRequest): Promise<void> {
  return post<void>('/vector/task/retry', data)
}
