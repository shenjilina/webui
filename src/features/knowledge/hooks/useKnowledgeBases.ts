import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createKnowledgeBase,
  deleteKnowledgeBase,
  listKnowledgeBases,
  updateKnowledgeBase,
  updateKnowledgeBaseStatus
} from '../api'
import type {
  CreateKnowledgeBaseRequest,
  DeleteKnowledgeBaseRequest,
  ListKnowledgeBasesRequest,
  UpdateKnowledgeBaseRequest,
  UpdateKnowledgeBaseStatusRequest
} from '../types'

export function useKnowledgeBases(params: ListKnowledgeBasesRequest = {}) {
  const queryClient = useQueryClient()
  const queryKey = ['knowledge-bases', params] as const
  const listQuery = useQuery({ queryKey, queryFn: () => listKnowledgeBases(params) })
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['knowledge-bases'] })

  const createMutation = useMutation({
    mutationFn: (data: CreateKnowledgeBaseRequest) => createKnowledgeBase(data),
    onSuccess: () => {
      toast.success('知识库已创建')
      invalidate()
    }
  })
  const updateMutation = useMutation({
    mutationFn: (data: UpdateKnowledgeBaseRequest) => updateKnowledgeBase(data),
    onSuccess: () => {
      toast.success('知识库已更新')
      invalidate()
    }
  })
  const statusMutation = useMutation({
    mutationFn: (data: UpdateKnowledgeBaseStatusRequest) => updateKnowledgeBaseStatus(data),
    onSuccess: () => {
      toast.success('知识库状态已更新')
      invalidate()
    }
  })
  const deleteMutation = useMutation({
    mutationFn: (data: DeleteKnowledgeBaseRequest) => deleteKnowledgeBase(data),
    onSuccess: () => {
      toast.success('知识库已删除')
      invalidate()
    }
  })

  return {
    list: listQuery.data?.items ?? [],
    page: listQuery.data,
    isLoading: listQuery.isLoading,
    isFetching: listQuery.isFetching,
    isError: listQuery.isError,
    refetch: listQuery.refetch,
    create: createMutation.mutate,
    isCreating: createMutation.isPending,
    update: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    updateStatus: statusMutation.mutate,
    isUpdatingStatus: statusMutation.isPending,
    remove: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending
  }
}
