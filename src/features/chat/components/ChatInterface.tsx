import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Send,
  Square,
  BookOpen,
  Plus,
  Folder,
  ChevronDown,
  Check,
  Sparkles,
  FileText,
  ListOrdered
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip'
import { MarkdownRenderer } from './MarkdownRenderer'
import { useKnowledgeBases } from '@/features/knowledge/hooks/useKnowledgeBases'
import { useDocuments } from '@/features/document/hooks/useDocuments'
import { cn } from '@/shared/lib/utils'
import type { ChatMessage } from '../hooks/useChat'
import type { ReferenceItem } from '../types'

/** 快捷提问建议 */
const suggestions = [
  { icon: Sparkles, label: '帮我推荐', text: '请推荐知识库中值得重点阅读的内容' },
  { icon: FileText, label: '帮我总结', text: '请总结知识库文档的核心观点' },
  { icon: ListOrdered, label: '帮我写大纲', text: '请为知识库内容编写一份内容大纲' }
]

interface ChatInterfaceProps {
  messages: ChatMessage[]
  isStreaming: boolean
  onSendMessage: (question: string, documentIds?: string[]) => void
  onStopStreaming: () => void
}

export function ChatInterface({
  messages,
  isStreaming,
  onSendMessage,
  onStopStreaming
}: ChatInterfaceProps) {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [kbOpen, setKbOpen] = useState(false)
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const kbRef = useRef<HTMLDivElement>(null)
  const { list: knowledgeBases } = useKnowledgeBases()
  const [knowledgeBaseId, setKnowledgeBaseId] = useState<number | null>(null)
  const { list: documents } = useDocuments(knowledgeBaseId)

  useEffect(() => {
    if (knowledgeBases.length > 0 && !knowledgeBases.some((item) => item.id === knowledgeBaseId)) {
      setKnowledgeBaseId(knowledgeBases[0].id)
      setSelectedDocIds([])
    }
  }, [knowledgeBases, knowledgeBaseId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // 点击面板外部时关闭知识库选择面板
  useEffect(() => {
    if (!kbOpen) return
    const onClickOutside = (e: MouseEvent) => {
      if (kbRef.current && !kbRef.current.contains(e.target as Node)) setKbOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [kbOpen])

  const handleSubmit = () => {
    const trimmed = input.trim()
    if (!trimmed || isStreaming) return
    onSendMessage(trimmed, selectedDocIds.length > 0 ? selectedDocIds : undefined)
    setInput('')
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    // 自适应高度
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const toggleDoc = (id: string) => {
    setSelectedDocIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-primary/10 mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
                <BookOpen className="text-primary h-8 w-8" />
              </div>
              <h3 className="text-foreground text-lg font-semibold">RAG 智能问答</h3>
              <p className="text-muted-foreground mt-2 max-w-sm text-sm">
                基于知识库的智能问答，支持 Markdown 渲染、公式显示和溯源引用
              </p>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {msg.role === 'assistant' && (
                <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                  AI
                </div>
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-3',
                  msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                )}
              >
                {msg.role === 'assistant' ? (
                  <div>
                    <MarkdownRenderer content={msg.content || '...'} />
                    {msg.isStreaming && (
                      <span className="bg-foreground/60 ml-0.5 inline-block h-4 w-2 animate-pulse align-middle" />
                    )}
                    {msg.references && msg.references.length > 0 && (
                      <ReferencesPanel references={msg.references} />
                    )}
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* 输入区域：卡片式 Composer */}
      <div className="px-4 pt-2 pb-4">
        <div className="mx-auto max-w-3xl">
          <form onSubmit={handleFormSubmit}>
            <div className="bg-background focus-within:border-foreground/25 rounded-2xl border shadow-sm transition-colors">
              <textarea
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="向知识助手提问"
                rows={2}
                disabled={isStreaming}
                className="placeholder:text-muted-foreground w-full resize-none bg-transparent px-4 pt-3.5 text-sm outline-none disabled:opacity-60"
              />
              {/* 底部工具行 */}
              <div className="flex items-center gap-2 px-3 pb-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground h-8 w-8 rounded-full"
                      onClick={() => navigate('/document/list')}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">添加知识文档</TooltipContent>
                </Tooltip>
                {/* 知识库范围选择 */}
                <div className="relative" ref={kbRef}>
                  <button
                    type="button"
                    onClick={() => setKbOpen((v) => !v)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors',
                      selectedDocIds.length > 0
                        ? 'border-foreground/30 bg-muted text-foreground'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Folder className="h-3.5 w-3.5" />
                    {selectedDocIds.length > 0
                      ? `已选 ${selectedDocIds.length} 篇文档`
                      : '知识库选择'}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  {kbOpen && (
                    <div className="bg-popover absolute bottom-full left-0 z-20 mb-2 w-64 rounded-xl border p-1.5 shadow-md">
                      <p className="text-muted-foreground px-2.5 py-1.5 text-xs">
                        选择问答范围，不选则检索全部知识库
                      </p>
                      <ScrollArea className="max-h-56">
                        <div className="space-y-0.5">
                          {documents.map((opt) => {
                            const id = String(opt.id)
                            const checked = selectedDocIds.includes(id)
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => toggleDoc(id)}
                                className="hover:bg-accent flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors"
                              >
                                <span
                                  className={cn(
                                    'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                                    checked
                                      ? 'border-primary bg-primary text-primary-foreground'
                                      : 'border-border'
                                  )}
                                >
                                  {checked && <Check className="h-3 w-3" />}
                                </span>
                                <span className="min-w-0 flex-1 truncate">{opt.title}</span>
                              </button>
                            )
                          })}
                          {documents.length === 0 && (
                            <p className="text-muted-foreground px-2.5 py-2 text-xs">
                              暂无可选文档
                            </p>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
                <div className="ml-auto">
                  {isStreaming ? (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-9 w-9 rounded-lg"
                      onClick={onStopStreaming}
                    >
                      <Square className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      size="icon"
                      className="h-9 w-9 rounded-lg"
                      disabled={!input.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </form>
          {/* 快捷提问建议 */}
          <div className="mt-3 flex items-center gap-5 px-1">
            {suggestions.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => setInput(s.text)}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
              >
                <s.icon className="h-3.5 w-3.5" />
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ReferencesPanel({ references }: { references: ReferenceItem[] }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border-border/50 mt-3 border-t pt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
      >
        <BookOpen className="h-3 w-3" />
        引用来源 ({references.length})
      </button>
      {expanded && (
        <div className="mt-2 space-y-2">
          {references.map((ref, i) => (
            <div key={i} className="bg-background/50 rounded-lg p-2 text-xs">
              <p className="text-foreground font-medium">{ref.title}</p>
              <p className="text-muted-foreground mt-1 line-clamp-2">{ref.snippet}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
