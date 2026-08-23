import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createDocument,
  deleteDocument,
  deleteFileSource,
  listDocuments,
  listFiles,
  parseDocument,
  retryDocuments
} from '../api'
import type { DocumentInfo, FileInfo } from '../types'

const documentKey = (knowledgeBaseId: number | null) => ['documents', knowledgeBaseId] as const
const fileKey = (knowledgeBaseId: number | null) => ['files', knowledgeBaseId] as const

export function useDocuments(knowledgeBaseId: number | null) {
  const queryClient = useQueryClient()
  const enabled = knowledgeBaseId !== null
  const documentQuery = useQuery({
    queryKey: documentKey(knowledgeBaseId),
    queryFn: () => listDocuments({ knowledgeBaseId: knowledgeBaseId!, pageSize: 100 }),
    enabled
  })
  const fileQuery = useQuery({
    queryKey: fileKey(knowledgeBaseId),
    queryFn: () => listFiles({ knowledgeBaseId: knowledgeBaseId!, pageSize: 100 }),
    enabled
  })
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: documentKey(knowledgeBaseId) })
    // queryClient.invalidateQueries({ queryKey: fileKey(knowledgeBaseId) })
    queryClient.invalidateQueries({ queryKey: ['knowledge-base-summary', knowledgeBaseId] })
  }
  const createMutation = useMutation({
    mutationFn: createDocument,
    onSuccess: () => {
      toast.success('文档已创建')
      invalidate()
    }
  })
  const parseMutation = useMutation({
    mutationFn: parseDocument,
    onSuccess: () => {
      toast.success('解析任务已开始')
      invalidate()
    }
  })
  const retryMutation = useMutation({
    mutationFn: () => retryDocuments(knowledgeBaseId!),
    onSuccess: (result) => {
      toast.success(`已重试 ${result.queuedFileIds.length} 个失败文件`)
      invalidate()
    }
  })
  const deleteDocumentMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      toast.success('文档已删除')
      invalidate()
    }
  })
  const deleteSourceMutation = useMutation({
    mutationFn: deleteFileSource,
    onSuccess: () => {
      toast.success('源文件已物理删除')
      invalidate()
    }
  })

  return {
    list: documentQuery.data?.items ?? [],
    files: fileQuery.data?.items ?? ([] as FileInfo[]),
    documents: documentQuery.data?.items ?? ([] as DocumentInfo[]),
    isLoading: documentQuery.isLoading || fileQuery.isLoading,
    isFetching: documentQuery.isFetching || fileQuery.isFetching,
    isError: documentQuery.isError || fileQuery.isError,
    refetch: invalidate,
    create: createMutation.mutate,
    isCreating: createMutation.isPending,
    parse: parseMutation.mutate,
    isParsing: parseMutation.isPending,
    retry: retryMutation.mutate,
    isRetrying: retryMutation.isPending,
    remove: deleteDocumentMutation.mutate,
    isDeleting: deleteDocumentMutation.isPending,
    deleteSource: deleteSourceMutation.mutate,
    isDeletingSource: deleteSourceMutation.isPending
  }
}
