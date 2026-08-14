import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

/**
 * 浏览器环境 MSW 实例
 * 通过 Service Worker 拦截网络请求，仅在开发环境且 VITE_ENABLE_MOCK=true 时启动
 */
export const worker = setupWorker(...handlers)

/**
 * 启动 mock 服务
 * onUnhandledRequest: 'bypass' - 未匹配的请求（如静态资源）正常放行
 */
export async function startMockWorker(): Promise<void> {
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  })
  // eslint-disable-next-line no-console
  console.info('[MSW] Mock 服务已启动')
}
