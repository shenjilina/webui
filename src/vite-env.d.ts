/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API 基础地址，如 /api 或 https://api.example.com/api */
  readonly VITE_API_BASE_URL: string
  /** 是否启用 MSW mock 服务（'true'/'false'） */
  readonly VITE_ENABLE_MOCK: string
  /** 应用标题 */
  readonly VITE_APP_TITLE: string
  /** SSE 流式超时时间（毫秒） */
  readonly VITE_SSE_TIMEOUT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.css' {
  const content: Record<string, string>
  export default content
}
