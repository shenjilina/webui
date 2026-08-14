import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:rounded-xl prose-pre:bg-muted prose-code:text-sm">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ className, children, node: _node, ref: _ref, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const isInline = !match
            if (isInline) {
              return (
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono" {...props}>
                  {children}
                </code>
              )
            }
            return (
              <div className="relative">
                <pre className={className} {...props}>
                  <code>{children}</code>
                </pre>
              </div>
            )
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto rounded-lg border">
                <table className="min-w-full divide-y divide-border">{children}</table>
              </div>
            )
          },
          th({ children }) {
            return (
              <th className="bg-muted px-4 py-2 text-left text-sm font-semibold">{children}</th>
            )
          },
          td({ children }) {
            return <td className="px-4 py-2 text-sm border-t">{children}</td>
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
