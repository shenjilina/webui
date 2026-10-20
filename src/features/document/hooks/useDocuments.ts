import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createDocument,
  deleteDocument,
  deleteFileSource,
  listAllDocuments,
  listAllFiles,
  parseDocument,
  retryDocuments
} from '../api'
import { useUserStore } from '@/features/auth/store/userStore'

const documentKey = (knowledgeBaseId: number | null) => ['documents', knowledgeBaseId] as const
const fileKey = (userId: number | undefined) => ['files', userId] as const

export function useDocuments(knowledgeBaseId: number | null) {
  const queryClient = useQueryClient()
  const userId = useUserStore((state) => state.userInfo?.id)
  const enabled = knowledgeBaseId !== null
  const documentQuery = useQuery({
    queryKey: documentKey(knowledgeBaseId),
    queryFn: () => listAllDocuments(knowledgeBaseId!),
    enabled,
    refetchInterval: (query) =>
      query.state.data?.some((item) => item.parseStatus === 'PARSING') ? 3000 : false
  })
  const fileQuery = useQuery({
    queryKey: fileKey(userId),
    queryFn: () => listAllFiles(),
    refetchInterval: (query) =>
      query.state.data?.some((item) => item.status === 'PARSING' || item.status === 'PARSE_PENDING')
        ? 3000
        : false,
    enabled: !!userId
  })
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['document-detail'] })
    queryClient.invalidateQueries({ queryKey: ['document-chunks'] })
    queryClient.invalidateQueries({ queryKey: documentKey(knowledgeBaseId) })
    queryClient.invalidateQueries({ queryKey: fileKey(userId) })
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
    list: documentQuery.data ?? [],
    files: fileQuery.data ?? [],
    documents: documentQuery.data ?? [],
    isLoading: documentQuery.isLoading || fileQuery.isLoading,
    isFetching: documentQuery.isFetching || fileQuery.isFetching,
    isError: documentQuery.isError,
    filesError: fileQuery.isError,
    filesLoading: fileQuery.isLoading || fileQuery.isFetching,
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
