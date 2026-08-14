import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { Toaster } from 'sonner'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/app/router'
import { ErrorFallback } from '@/shared/components/ErrorFallback'
import { ENABLE_MOCK, APP_TITLE } from '@/shared/utils/constants'
import '../index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: true,
      refetchInterval: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

/** 应用标题（由环境变量注入） */
document.title = APP_TITLE

/**
 * 启动应用：仅开发环境且 VITE_ENABLE_MOCK=true 时先启动 MSW mock 服务
 * 动态 import 保证生产构建时 mock 代码被 tree-shaking 移除
 */
async function bootstrap() {
  if (import.meta.env.DEV && ENABLE_MOCK) {
    const { startMockWorker } = await import('@/mocks/browser')
    await startMockWorker()
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <Toaster position="bottom-right" richColors closeButton />
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>,
  )
}

bootstrap()
