import { Badge } from '@/shared/components/ui/badge'
import { Loader2 } from 'lucide-react'
import type { VectorTaskStatusType } from '@/shared/utils/constants'
import { VectorTaskStatus } from '@/shared/utils/constants'

const statusConfig: Record<
  VectorTaskStatusType,
  {
    label: string
    variant: 'default' | 'secondary' | 'success' | 'destructive' | 'info'
    icon?: boolean
  }
> = {
  [VectorTaskStatus.PENDING]: { label: '待处理', variant: 'secondary' },
  [VectorTaskStatus.PROCESSING]: { label: '处理中', variant: 'info', icon: true },
  [VectorTaskStatus.SUCCESS]: { label: '已完成', variant: 'success' },
  [VectorTaskStatus.FAILED]: { label: '失败', variant: 'destructive' }
}

interface TaskStatusBadgeProps {
  status: VectorTaskStatusType
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig[VectorTaskStatus.PENDING]

  return (
    <Badge
      variant={config.variant as 'default' | 'secondary' | 'success' | 'destructive' | 'info'}
      className="gap-1"
    >
      {config.icon && <Loader2 className="h-3 w-3 animate-spin" />}
      {config.label}
    </Badge>
  )
}
