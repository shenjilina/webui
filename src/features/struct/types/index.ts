import type { PaginationParams } from '@/shared/types'

/** 结构化数据条目 */
export interface StructDataItem {
  id: string
  key: string
  value: string
  metadata?: string
  createdAt: string
  updatedAt: string
}

/** 结构化数据列表请求参数 */
export interface StructDataListParams extends PaginationParams {
  keyword?: string
}

/** 创建结构化数据请求 */
export interface CreateStructDataRequest {
  key: string
  value: string
  metadata?: string
}

/** 更新结构化数据请求 */
export interface UpdateStructDataRequest {
  key: string
  value: string
  metadata?: string
}

/** 批量删除请求 */
export interface BatchDeleteRequest {
  ids: string[]
}
