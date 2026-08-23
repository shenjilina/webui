import { useEffect, useState } from 'react'
import type { KnowledgeBase } from '@/features/knowledge/types'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'

interface DeleteKnowledgeBaseDialogProps {
  knowledgeBase: KnowledgeBase | null
  deleting: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (confirmationName: string) => void
}

export function DeleteKnowledgeBaseDialog({
  knowledgeBase,
  deleting,
  onOpenChange,
  onConfirm
}: DeleteKnowledgeBaseDialogProps) {
  const [confirmationName, setConfirmationName] = useState('')
  useEffect(() => setConfirmationName(''), [knowledgeBase])
  return (
    <Dialog open={knowledgeBase !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>删除知识库</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-sm">
          此操作不可撤销。请输入“{knowledgeBase?.name}”确认。
        </p>
        <Input
          value={confirmationName}
          onChange={(event) => setConfirmationName(event.target.value)}
        />
        <DialogFooter>
          <Button
            variant="destructive"
            disabled={!knowledgeBase || deleting || confirmationName !== knowledgeBase.name}
            onClick={() => onConfirm(confirmationName)}
          >
            删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
