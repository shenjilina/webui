import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getStructDataList,
  createStructData,
  updateStructData,
  deleteStructData,
  batchDeleteStructData,
  vectorizeStructData,
} from '../api'
import type {
  StructDataListParams,
  CreateStructDataRequest,
  UpdateStructDataRequest,
} from '../types'

export function useStructData(params: StructDataListParams) {
  const queryClient = useQueryClient()

  const listQuery = useQuery({
    queryKey: ['struct-data', params],
    queryFn: () => getStructDataList(params),
    placeholderData: (prev) => prev,
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateStructDataRequest) => createStructData(data),
    onSuccess: () => {
      toast.success('条目创建成功')
      queryClient.invalidateQueries({ queryKey: ['struct-data'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStructDataRequest }) =>
      updateStructData(id, data),
    onSuccess: () => {
      toast.success('条目更新成功')
      queryClient.invalidateQueries({ queryKey: ['struct-data'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteStructData(id),
    onSuccess: () => {
      toast.success('条目已删除')
      queryClient.invalidateQueries({ queryKey: ['struct-data'] })
    },
  })

  const batchDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => batchDeleteStructData({ ids }),
    onSuccess: () => {
      toast.success('批量删除成功')
      queryClient.invalidateQueries({ queryKey: ['struct-data'] })
    },
  })

  const vectorizeMutation = useMutation({
    mutationFn: (id: string) => vectorizeStructData(id),
    onSuccess: () => {
      toast.success('向量化任务已提交')
      queryClient.invalidateQueries({ queryKey: ['struct-data'] })
    },
  })

  return {
    list: listQuery.data,
    isLoading: listQuery.isLoading,
    isFetching: listQuery.isFetching,
    refetch: listQuery.refetch,
    createItem: createMutation.mutate,
    updateItem: updateMutation.mutate,
    deleteItem: deleteMutation.mutate,
    batchDelete: batchDeleteMutation.mutate,
    vectorize: vectorizeMutation.mutate,
  }
}
