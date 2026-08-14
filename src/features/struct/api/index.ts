import { get, post, put, del } from '@/shared/utils/http'
import type { PaginatedData } from '@/shared/utils/http'
import type {
  StructDataItem,
  StructDataListParams,
  CreateStructDataRequest,
  UpdateStructDataRequest,
  BatchDeleteRequest,
} from '../types'

/** 结构化数据分页列表 */
export function getStructDataList(
  params: StructDataListParams,
): Promise<PaginatedData<StructDataItem>> {
  return get<PaginatedData<StructDataItem>>('/struct/list', params as unknown as Record<string, unknown>)
}

/** 新增条目 */
export function createStructData(data: CreateStructDataRequest): Promise<StructDataItem> {
  return post<StructDataItem>('/struct', data)
}

/** 编辑条目 */
export function updateStructData(id: string, data: UpdateStructDataRequest): Promise<void> {
  return put<void>(`/struct/${id}`, data)
}

/** 删除单条 */
export function deleteStructData(id: string): Promise<void> {
  return del<void>(`/struct/${id}`)
}

/** 批量删除 */
export function batchDeleteStructData(_data: BatchDeleteRequest): Promise<void> {
  return del<void>('/struct/batch')
}

/** 触发结构化数据向量化入库 */
export function vectorizeStructData(id: string): Promise<void> {
  return post<void>('/struct/vectorize', { id })
}
