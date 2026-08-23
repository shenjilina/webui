import { useEffect, useState } from 'react'
import type { KnowledgeBase, KnowledgeBaseVisibility } from '@/features/knowledge/types'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

interface KnowledgeBaseFormDialogProps {
  open: boolean
  knowledgeBase: KnowledgeBase | null
  submitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: {
    name: string
    description: string
    visibility: KnowledgeBaseVisibility
  }) => void
}

export function KnowledgeBaseFormDialog({
  open,
  knowledgeBase,
  submitting,
  onOpenChange,
  onSubmit
}: KnowledgeBaseFormDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<KnowledgeBaseVisibility>('PRIVATE')

  useEffect(() => {
    if (!open) return
    setName(knowledgeBase?.name ?? '')
    setDescription(knowledgeBase?.description ?? '')
    setVisibility(knowledgeBase?.visibility ?? 'PRIVATE')
  }, [knowledgeBase, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{knowledgeBase ? '编辑知识库' : '新建知识库'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="knowledge-base-name">名称</Label>
            <Input
              id="knowledge-base-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="knowledge-base-description">描述</Label>
            <textarea
              id="knowledge-base-description"
              className="border-input bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="knowledge-base-visibility">可见性</Label>
            <select
              id="knowledge-base-visibility"
              className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
              value={visibility}
              onChange={(event) => setVisibility(event.target.value as KnowledgeBaseVisibility)}
            >
              <option value="PRIVATE">私有</option>
              <option value="PUBLIC">公开</option>
            </select>
          </div>
          <DialogFooter>
            <Button
              onClick={() =>
                onSubmit({ name: name.trim(), description: description.trim(), visibility })
              }
              disabled={submitting || name.trim().length < 2}
            >
              {submitting ? '提交中...' : knowledgeBase ? '保存' : '创建'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
