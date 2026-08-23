import { del, patch, post } from '@/shared/utils/http'
import type {
  CreateKnowledgeBaseRequest,
  DeleteKnowledgeBaseRequest,
  KnowledgeBase,
  KnowledgeBaseDetailRequest,
  KnowledgeBasePage,
  KnowledgeBaseSummary,
  ListKnowledgeBasesRequest,
  UpdateKnowledgeBaseRequest,
  UpdateKnowledgeBaseStatusRequest
} from '../types'

export function createKnowledgeBase(data: CreateKnowledgeBaseRequest): Promise<KnowledgeBase> {
  return post<KnowledgeBase>('/knowledge-bases/create', data)
}

export function listKnowledgeBases(data: ListKnowledgeBasesRequest): Promise<KnowledgeBasePage> {
  return post<KnowledgeBasePage>('/knowledge-bases/list', data)
}

export function getKnowledgeBaseDetail(data: KnowledgeBaseDetailRequest): Promise<KnowledgeBase> {
  return post<KnowledgeBase>('/knowledge-bases/detail', data)
}

export function getKnowledgeBaseSummary(
  data: KnowledgeBaseDetailRequest
): Promise<KnowledgeBaseSummary> {
  return post<KnowledgeBaseSummary>('/knowledge-bases/summary', data)
}

export function updateKnowledgeBase(data: UpdateKnowledgeBaseRequest): Promise<KnowledgeBase> {
  return patch<KnowledgeBase>('/knowledge-bases/update', data)
}

export function updateKnowledgeBaseStatus(
  data: UpdateKnowledgeBaseStatusRequest
): Promise<KnowledgeBase> {
  return patch<KnowledgeBase>('/knowledge-bases/status', data)
}

export function deleteKnowledgeBase(data: DeleteKnowledgeBaseRequest): Promise<void> {
  return del<void>('/knowledge-bases/delete', data)
}
