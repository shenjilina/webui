import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { BookOpen, Send, Square } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { listAllKnowledgeBases } from '@/features/knowledge/api'
import { MarkdownRenderer } from './MarkdownRenderer'
import { useChatStore } from '../store/chatStore'
import type { ChatMessage, ReferenceItem } from '../types'
interface Props {
  messages: ChatMessage[]
  isStreaming: boolean
  onSendMessage: (question: string, knowledgeBaseId: number, topK: number) => void
  onStopStreaming: () => void
}
export function ChatInterface({ messages, isStreaming, onSendMessage, onStopStreaming }: Props) {
  const isDeleting = useChatStore((state) => state.isDeleting)
  const [input, setInput] = useState('')
  const [topK, setTopK] = useState(4)
  const end = useRef<HTMLDivElement>(null)
  const knowledgeBaseId = useChatStore((state) => state.knowledgeBaseId)
  const legacyHistory = useChatStore(
    (state) => state.currentSessionId !== null && state.conversationSessionId === null
  )
  const query = useQuery({ queryKey: ['knowledge-bases', 'all'], queryFn: listAllKnowledgeBases })
  const bases = query.data ?? []
  const selected = bases.find((item) => item.id === knowledgeBaseId)
  const canSend =
    selected?.status === 'ACTIVE' &&
    !legacyHistory &&
    !isStreaming &&
    !isDeleting &&
    input.trim().length > 0 &&
    topK >= 1 &&
    topK <= 20 &&
    Number.isInteger(topK)
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  const submit = () => {
    if (!canSend || knowledgeBaseId === null) return
    onSendMessage(input.trim(), knowledgeBaseId, topK)
    setInput('')
  }
  return (
    <div className="flex h-full min-h-0 flex-col">
      {legacyHistory && (
        <div role="status" className="border-b p-3 text-sm">
          此旧记录没有会话标识，仅供查看。
          <Button variant="outline" size="sm" onClick={() => useChatStore.getState().newSession()}>
            开始新对话
          </Button>
        </div>
      )}
      <header className="flex flex-wrap items-center gap-3 border-b p-3">
        <label className="flex items-center gap-2 text-sm">
          知识库
          <select
            aria-label="问答知识库"
            className="bg-background max-w-64 rounded-md border p-2"
            value={knowledgeBaseId ?? ''}
            disabled={isStreaming || isDeleting || query.isLoading}
            onChange={(event) =>
              useChatStore
                .getState()
                .newSession(event.target.value ? Number(event.target.value) : null)
            }
          >
            <option value="">请选择知识库</option>
            {bases.map((base) => (
              <option key={base.id} value={base.id} disabled={base.status !== 'ACTIVE'}>
                {base.name}
                {base.status !== 'ACTIVE' ? '（已停用）' : ''}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          TopK{' '}
          <input
            aria-label="检索片段数 TopK"
            type="number"
            min={1}
            max={20}
            step={1}
            className="bg-background w-16 rounded-md border p-2"
            value={topK}
            disabled={isStreaming || isDeleting}
            onChange={(event) => setTopK(Number(event.target.value))}
          />
        </label>
        <span className="text-muted-foreground text-xs">切换知识库会开始新对话</span>
        <Link className="text-primary ml-auto text-sm" to="/document/list">
          管理知识库
        </Link>
      </header>
      {query.isError && (
        <div role="alert" className="text-destructive p-3 text-sm">
          知识库加载失败{' '}
          <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
            重试
          </Button>
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center py-16 text-center">
              <BookOpen className="text-primary mb-4 h-10 w-10" />
              <h1 className="text-xl font-semibold">基于知识库，寻找可靠答案</h1>
              <p className="text-muted-foreground mt-3 text-sm">
                先选择已启用的知识库。问答按知识库隔离，支持多轮上下文与来源引用。
              </p>
              {!query.isLoading && !bases.length && (
                <Link className="text-primary mt-4 text-sm" to="/document/list">
                  创建知识库并上传文档
                </Link>
              )}
            </div>
          )}
          {messages.map((message) => (
            <article
              key={message.id}
              className={
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground ml-auto max-w-[85%] rounded-xl p-4'
                  : 'bg-muted/30 rounded-xl border p-4'
              }
            >
              <p className="mb-2 text-xs opacity-60">
                {message.role === 'user' ? '你' : '知识库助手'}
              </p>
              {message.role === 'assistant' ? (
                <MarkdownRenderer
                  content={message.content || (message.isStreaming ? '正在检索并生成…' : '')}
                />
              ) : (
                <p className="whitespace-pre-wrap">{message.content}</p>
              )}
              {message.error && (
                <p role="alert" className="text-destructive mt-3 text-sm">
                  {message.error}
                </p>
              )}
              {!!message.references?.length && <ReferencesPanel references={message.references} />}
              {!message.references?.length && !!message.sourceDocumentIds?.length && (
                <p className="text-muted-foreground mt-3 text-xs">
                  历史引用文档 ID：{message.sourceDocumentIds.join('、')}（历史接口不返回片段正文）
                </p>
              )}
              {message.isStreaming && <p className="text-muted-foreground mt-2 text-xs">生成中…</p>}
            </article>
          ))}
          <div ref={end} />
        </div>
      </div>
      <form
        className="mx-auto w-full max-w-3xl space-y-2 p-4"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <textarea
          aria-label="问题"
          className="bg-background min-h-24 w-full resize-none rounded-xl border p-3 text-sm"
          placeholder={
            selected?.status === 'ACTIVE'
              ? '输入问题，Enter 发送，Shift+Enter 换行'
              : '请先选择已启用的知识库'
          }
          maxLength={2000}
          value={input}
          disabled={isStreaming || isDeleting}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault()
              submit()
            }
          }}
        />
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground text-xs">
            {input.length}/2000 · TopK 为 1–20 · 生成内容请结合来源核实
          </span>
          {isStreaming ? (
            <Button type="button" variant="destructive" onClick={onStopStreaming}>
              <Square className="h-4 w-4" />
              停止生成
            </Button>
          ) : (
            <Button type="submit" disabled={!canSend}>
              <Send className="h-4 w-4" />
              发送
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
function ReferencesPanel({ references }: { references: ReferenceItem[] }) {
  return (
    <details className="mt-3 border-t pt-3 text-sm">
      <summary className="cursor-pointer">引用来源（{references.length}）</summary>
      <div className="mt-3 space-y-3">
        {references.map((reference, i) => (
          <div key={i} className="bg-background rounded-lg p-3">
            <p className="font-medium">{reference.title}</p>
            <p className="mt-1 text-xs whitespace-pre-wrap">{reference.snippet}</p>
            {reference.score !== null && (
              <p className="text-muted-foreground mt-1 text-xs">
                检索距离：{reference.score.toFixed(4)}（越小越相关）
              </p>
            )}
          </div>
        ))}
      </div>
    </details>
  )
}
