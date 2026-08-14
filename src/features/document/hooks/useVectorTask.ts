import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { startVectorTask, getVectorTaskStatus, retryVectorTask } from '../api'
import { VectorTaskStatus, TASK_POLL_INTERVAL } from '@/shared/utils/constants'
import type { VectorTaskStatusType } from '@/shared/utils/constants'

export function useVectorTask() {
  const queryClient = useQueryClient()

  const startMutation = useMutation({
    mutationFn: (documentId: string) => startVectorTask(documentId),
    onSuccess: (res) => {
      toast.success('向量化任务已提交')
      // 开始轮询任务状态
      startPolling(res.taskId)
    },
  })

  const retryMutation = useMutation({
    mutationFn: (taskId: string) => retryVectorTask({ taskId }),
    onSuccess: () => {
      toast.success('任务重试已提交')
    },
  })

  const startPolling = (taskId: string) => {
    const interval = setInterval(async () => {
      try {
        const status = await getVectorTaskStatus(taskId)
        queryClient.invalidateQueries({ queryKey: ['documents'] })

        if (
          status.status === VectorTaskStatus.SUCCESS ||
          status.status === VectorTaskStatus.FAILED
        ) {
          clearInterval(interval)
          if (status.status === VectorTaskStatus.SUCCESS) {
            toast.success('向量化完成')
          } else {
            toast.error('向量化失败')
          }
        }
      } catch {
        clearInterval(interval)
      }
    }, TASK_POLL_INTERVAL)

    // 5 分钟后超时停止轮询
    setTimeout(() => clearInterval(interval), 5 * 60 * 1000)
  }

  return {
    startTask: startMutation.mutate,
    retryTask: retryMutation.mutate,
    isStarting: startMutation.isPending,
    getStatus: (taskId: string) => getVectorTaskStatus(taskId),
    pollStatus: (status: VectorTaskStatusType) =>
      status === VectorTaskStatus.PROCESSING || status === VectorTaskStatus.PENDING,
  }
}
