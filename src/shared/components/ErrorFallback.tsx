import { AlertCircle, RefreshCw } from 'lucide-react'
import type { FallbackProps } from 'react-error-boundary'
import { Button } from '@/shared/components/ui/button'

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const errorMessage = error instanceof Error ? error.message : '发生了未知错误'
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="max-w-md text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">页面渲染异常</h2>
        <p className="text-sm text-muted-foreground">{errorMessage}</p>
        <Button onClick={resetErrorBoundary} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4" />
          重新加载
        </Button>
      </div>
    </div>
  )
}
