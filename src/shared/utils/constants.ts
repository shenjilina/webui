/** 向量任务状态枚举 */
export const VectorTaskStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILED: 'failed'
} as const

export type VectorTaskStatusType = (typeof VectorTaskStatus)[keyof typeof VectorTaskStatus]

/** 文档类型枚举 */
export const DocumentType = {
  TXT: 'txt',
  PDF: 'pdf'
} as const

export type DocumentTypeType = (typeof DocumentType)[keyof typeof DocumentType]

/** 允许上传的文件扩展名 */
export const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.docx', '.txt', '.md', '.markdown'] as const

/** 允许上传的 MIME 类型 */
export const ALLOWED_MIME_TYPES = {
  'text/plain': '.txt',
  'application/pdf': '.pdf'
} as const

/** 最大上传文件大小（10MB） */
export const MAX_FILE_SIZE = 100 * 1024 * 1024

/** 分页默认值 */
export const DEFAULT_PAGE_SIZE = 20

/* ------------------- 环境变量驱动的配置 ------------------- */

/** API 基础地址（由 VITE_API_BASE_URL 注入，默认 /api） */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/** 是否启用 MSW mock 服务（由 VITE_ENABLE_MOCK 注入） */
export const ENABLE_MOCK = import.meta.env.VITE_ENABLE_MOCK === 'true'

/** 应用标题（由 VITE_APP_TITLE 注入） */
export const APP_TITLE = import.meta.env.VITE_APP_TITLE || 'RAG 智能知识库'

/** SSE 超时时间（由 VITE_SSE_TIMEOUT 注入，默认 5 分钟） */
export const SSE_TIMEOUT = Number(import.meta.env.VITE_SSE_TIMEOUT) || 5 * 60 * 1000

/** API 请求超时时间（30 秒） */
export const API_TIMEOUT = 30_000

/** 向量任务轮询间隔（3 秒） */
export const TASK_POLL_INTERVAL = 3_000
