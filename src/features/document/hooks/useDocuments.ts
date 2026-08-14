import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getDocumentList,
  createDocument,
  updateDocument,
  deleteDocument,
  uploadDocument,
  getDocumentOptions,
} from '../api'
import type { DocumentListParams, CreateDocumentRequest, UpdateDocumentRequest } from '../types'

export function useDocuments(params: DocumentListParams) {
  const queryClient = useQueryClient()

  const listQuery = useQuery({
    queryKey: ['documents', params],
    queryFn: () => getDocumentList(params),
    placeholderData: (prev) => prev,
  })

  const optionsQuery = useQuery({
    queryKey: ['document-options'],
    queryFn: () => getDocumentOptions(),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateDocumentRequest) => createDocument(data),
    onSuccess: () => {
      toast.success('文档创建成功')
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      queryClient.invalidateQueries({ queryKey: ['document-options'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDocumentRequest }) =>
      updateDocument(id, data),
    onSuccess: () => {
      toast.success('文档更新成功')
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      toast.success('文档已删除')
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      queryClient.invalidateQueries({ queryKey: ['document-options'] })
    },
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadDocument(file),
    onSuccess: () => {
      toast.success('文件上传成功')
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      queryClient.invalidateQueries({ queryKey: ['document-options'] })
    },
    onError: (err: Error) => {
      toast.error(err.message || '上传失败')
    },
  })

  return {
    list: listQuery.data,
    isLoading: listQuery.isLoading,
    isFetching: listQuery.isFetching,
    refetch: listQuery.refetch,
    createDoc: createMutation.mutate,
    updateDoc: updateMutation.mutate,
    deleteDoc: deleteMutation.mutate,
    uploadDoc: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    docOptions: optionsQuery.data ?? [],
  }
}
