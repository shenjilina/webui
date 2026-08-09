import { backendBaseUrl, popularLabelsDefaultLimit, searchLabelsDefaultLimit } from '@/lib/constants'
import { errorMessage } from '@/lib/utils'
import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/state'
import { navigationService } from '@/services/navigation'
import axiosInstance, { silentRefreshGuestToken } from '@/utils/axios'

// 类型定义
export type LightragNodeType = {
  id: string
  labels: string[]
  properties: Record<string, any>
}

export type LightragEdgeType = {
  id: string
  source: string
  target: string
  type: string
  properties: Record<string, any>
}

export type LightragGraphType = {
  nodes: LightragNodeType[]
  edges: LightragEdgeType[]
}

export type LightragQueueStatus = {
  available: boolean
  queue_name?: string
  max_async?: number
  max_queue_size?: number
  queued?: number
  running?: number
  in_flight?: number
  worker_count?: number
  initialized?: boolean
  submitted_total?: number
  completed_total?: number
  failed_total?: number
  cancelled_total?: number
  rejected_total?: number
}

export type LightragRoleLLMConfig = {
  binding?: string | null
  model?: string | null
  host?: string | null
  max_async?: number
  timeout?: number
  has_model_kwargs?: boolean
  metadata?: Record<string, any>
}

export type LightragStatus = {
  status: 'healthy'
  working_directory: string
  input_directory: string
  configuration: {
    llm_binding: string
    llm_binding_host: string
    llm_model: string
    embedding_binding: string
    embedding_binding_host: string
    embedding_model: string
    kv_storage: string
    doc_status_storage: string
    graph_storage: string
    vector_storage: string
    workspace?: string
    storage_workspaces?: {
      kv_storage?: string | null
      doc_status_storage?: string | null
      graph_storage?: string | null
      vector_storage?: string | null
    }
    max_graph_nodes?: string
    enable_rerank?: boolean
    rerank_binding?: string | null
    rerank_model?: string | null
    rerank_binding_host?: string | null
    rerank_max_async?: number
    rerank_timeout?: number
    summary_language: string
    force_llm_summary_on_merge: boolean
    max_parallel_insert: number
    max_async: number
    llm_timeout?: number
    embedding_func_max_async: number
    embedding_batch_num: number
    embedding_timeout?: number
    cosine_threshold: number
    min_rerank_score: number
    related_chunk_number: number
    role_llm_config?: Record<string, LightragRoleLLMConfig>
    vlm_process_enable?: boolean
    parser_routing?: string
    mineru?: {
      endpoint: string
      api_mode: 'official' | 'local' | null
      options: {
        language?: string
        enable_table?: boolean
        enable_formula?: boolean
        model_version?: string
        is_ocr?: boolean
        local_backend?: string
        local_parse_method?: string
        local_image_analysis?: boolean
      }
    }
    docling?: {
      endpoint: string
      options: {
        do_ocr?: boolean
        force_ocr?: boolean
        ocr_engine?: string
        ocr_lang?: string
        do_formula_enrichment?: boolean
      }
    }
  }
  update_status?: Record<string, any>
  core_version?: string
  api_version?: string
  auth_mode?: 'enabled' | 'disabled'
  pipeline_busy: boolean
  pipeline_active?: boolean
  pipeline_scanning?: boolean
  pipeline_destructive_busy?: boolean
  pipeline_pending_enqueues?: number
  llm_queue_status?: Record<string, LightragQueueStatus>
  embedding_queue_status?: LightragQueueStatus
  rerank_queue_status?: LightragQueueStatus
  keyed_locks?: {
    process_id: number
    cleanup_performed: {
      mp_cleaned: number
      async_cleaned: number
    }
    current_status: {
      total_mp_locks: number
      pending_mp_cleanup: number
      total_async_locks: number
      pending_async_cleanup: number
    }
  }
  webui_title?: string
  webui_description?: string
}

export type LightragDocumentsScanProgress = {
  is_scanning: boolean
  current_file: string
  indexed_count: number
  total_files: number
  progress: number
}

/**
 * 指定检索模式：
 * - "naive"：执行基础搜索，不使用高级技术。
 * - "local"：聚焦于上下文相关的信息。
 * - "global"：利用全局知识。
 * - "hybrid"：结合 local 与 global 检索方法。
 * - "mix"：融合知识图谱与向量检索。
 * - "bypass"：跳过知识检索，直接调用 LLM。
 */
export type QueryMode = 'naive' | 'local' | 'global' | 'hybrid' | 'mix' | 'bypass'

export type Message = {
  role: 'user' | 'assistant' | 'system'
  content: string
  thinkingContent?: string
  displayContent?: string
  thinkingTime?: number | null
}

export type QueryRequest = {
  query: string
  /** 指定检索模式。 */
  mode: QueryMode
  /** 若为 true，仅返回检索到的上下文，不生成回答。 */
  only_need_context?: boolean
  /** 若为 true，仅返回生成的提示词，不生成回答。 */
  only_need_prompt?: boolean
  /** 定义回答格式。例如：'Multiple Paragraphs'、'Single Paragraph'、'Bullet Points'。 */
  response_type?: string
  /** 若为 true，启用流式输出以实时返回结果。 */
  stream?: boolean
  /** 检索的条目数量上限。在 'local' 模式下代表实体，在 'global' 模式下代表关系。 */
  top_k?: number
  /** 检索并在重排序后保留的文本块数量上限。 */
  chunk_top_k?: number
  /** 统一 token 控制系统中为实体上下文分配的最大 token 数。 */
  max_entity_tokens?: number
  /** 统一 token 控制系统中为关系上下文分配的最大 token 数。 */
  max_relation_tokens?: number
  /** 整个查询上下文（实体 + 关系 + 文本块 + 系统提示词）的最大总 token 预算。 */
  max_total_tokens?: number
  /**
   * 存储历史对话记录以保持上下文。
   * 格式：[{"role": "user/assistant", "content": "message"}]。
   */
  conversation_history?: Message[]
  /** 回答上下文中考虑的完整对话轮数（用户-助手配对）。 */
  history_turns?: number
  /** 用户自定义的查询提示词。若提供，将替代提示词模板中的默认值。 */
  user_prompt?: string
  /** 对检索到的文本块启用重排序。若为 true 但未配置重排序模型，将发出警告。默认为 true。 */
  enable_rerank?: boolean
}

export type QueryResponse = {
  response: string
}

export type EntityUpdateResponse = {
  status: string
  message: string
  data: Record<string, any>
  operation_summary?: {
    merged: boolean
    merge_status: 'success' | 'failed' | 'not_attempted'
    merge_error: string | null
    operation_status: 'success' | 'partial_success' | 'failure'
    target_entity: string | null
    final_entity?: string | null
    renamed?: boolean
  }
}

export type DocActionResponse = {
  status: 'success' | 'partial_success' | 'failure'
  message: string
  track_id?: string
}

export type ScanResponse = {
  status: 'scanning_started' | 'scanning_skipped_pipeline_busy'
  message: string
  track_id: string
}

export type ReprocessFailedResponse = {
  status: 'reprocessing_started'
  message: string
  track_id: string
}

export type DeleteDocResponse = {
  status: 'deletion_started' | 'busy' | 'not_allowed'
  message: string
  doc_id: string
}

export type DocStatus =
  | 'pending'
  | 'parsing'
  | 'analyzing'
  | 'processing'
  | 'preprocessed'
  | 'processed'
  | 'failed'

export type DocStatusResponse = {
  id: string
  content_summary: string
  content_length: number
  status: DocStatus
  created_at: string
  updated_at: string
  track_id?: string
  chunks_count?: number
  error_msg?: string
  metadata?: Record<string, any>
  file_path: string
}

export type DocsStatusesResponse = {
  statuses: Partial<Record<DocStatus, DocStatusResponse[]>>
}

export type TrackStatusResponse = {
  track_id: string
  documents: DocStatusResponse[]
  total_count: number
  status_summary: Record<string, number>
}

export type DocumentsRequest = {
  status_filter?: DocStatus | null
  status_filters?: DocStatus[] | null
  page: number
  page_size: number
  sort_field: 'created_at' | 'updated_at' | 'id' | 'file_path'
  sort_direction: 'asc' | 'desc'
}

export type PaginationInfo = {
  page: number
  page_size: number
  total_count: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export type PaginatedDocsResponse = {
  documents: DocStatusResponse[]
  pagination: PaginationInfo
  status_counts: Record<string, number>
}

export type StatusCountsResponse = {
  status_counts: Record<string, number>
}

export type AuthStatusResponse = {
  auth_configured: boolean
  access_token?: string
  token_type?: string
  auth_mode?: 'enabled' | 'disabled'
  message?: string
  core_version?: string
  api_version?: string
  webui_title?: string
  webui_description?: string
}

export type PipelineStatusResponse = {
  autoscanned: boolean
  busy: boolean
  job_name: string
  job_start?: string
  docs: number
  batchs: number
  cur_batch: number
  request_pending: boolean
  cancellation_requested?: boolean
  latest_message: string
  history_messages?: string[]
  update_status?: Record<string, any>
}

export type LoginResponse = {
  access_token: string
  token_type: string
  auth_mode?: 'enabled' | 'disabled'  // 认证模式标识
  message?: string                    // 可选消息
  core_version?: string
  api_version?: string
  webui_title?: string
  webui_description?: string
}

export const InvalidApiKeyError = 'Invalid API Key'
export const RequireApiKeError = 'API Key required'

// API 方法
export const queryGraphs = async (
  label: string,
  maxDepth: number,
  maxNodes: number
): Promise<LightragGraphType> => {
  const response = await axiosInstance.get(`/graphs?label=${encodeURIComponent(label)}&max_depth=${maxDepth}&max_nodes=${maxNodes}`)
  return response.data
}

export const getGraphLabels = async (): Promise<string[]> => {
  const response = await axiosInstance.get('/graph/label/list')
  return response.data
}

export const getPopularLabels = async (limit: number = popularLabelsDefaultLimit): Promise<string[]> => {
  const response = await axiosInstance.get(`/graph/label/popular?limit=${limit}`)
  return response.data
}

export const searchLabels = async (query: string, limit: number = searchLabelsDefaultLimit): Promise<string[]> => {
  const response = await axiosInstance.get(`/graph/label/search?q=${encodeURIComponent(query)}&limit=${limit}`)
  return response.data
}

export const checkHealth = async (): Promise<
  LightragStatus | { status: 'error'; message: string }
> => {
  try {
    const response = await axiosInstance.get('/health')
    return response.data
  } catch (error) {
    return {
      status: 'error',
      message: errorMessage(error)
    }
  }
}

export const getDocuments = async (): Promise<DocsStatusesResponse> => {
  const response = await axiosInstance.get('/documents')
  return response.data
}

export const scanNewDocuments = async (): Promise<ScanResponse> => {
  const response = await axiosInstance.post('/documents/scan')
  return response.data
}

export const reprocessFailedDocuments = async (): Promise<ReprocessFailedResponse> => {
  const response = await axiosInstance.post('/documents/reprocess_failed')
  return response.data
}

export const getDocumentsScanProgress = async (): Promise<LightragDocumentsScanProgress> => {
  const response = await axiosInstance.get('/documents/scan-progress')
  return response.data
}

export const queryText = async (request: QueryRequest): Promise<QueryResponse> => {
  const response = await axiosInstance.post('/query', request)
  return response.data
}

export const queryTextStream = async (
  request: QueryRequest,
  onChunk: (chunk: string) => void,
  onError?: (error: string) => void
) => {
  const apiKey = useSettingsStore.getState().apiKey;
  const token = localStorage.getItem('LIGHTRAG-API-TOKEN');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/x-ndjson',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }

  try {
    const response = await fetch(`${backendBaseUrl}/query/stream`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      // 专门处理 401 未授权错误
      if (response.status === 401) {
        // 检查是否处于 guest 模式
        const authStore = useAuthStore.getState();
        const currentToken = localStorage.getItem('LIGHTRAG-API-TOKEN');
        const isGuest = currentToken && authStore.isGuestMode;

        if (isGuest) {
          try {
            // guest 模式下静默刷新 token
            const newToken = await silentRefreshGuestToken();

            // 使用新 token 重试流式请求
            const retryHeaders = { ...headers };
            retryHeaders['Authorization'] = `Bearer ${newToken}`;

            const retryResponse = await fetch(`${backendBaseUrl}/query/stream`, {
              method: 'POST',
              headers: retryHeaders,
              body: JSON.stringify(request),
            });

            if (!retryResponse.ok) {
              throw new Error(`HTTP error! status: ${retryResponse.status}`);
            }

            // 重试成功，处理流式响应
            // 使用 retryResponse 重新执行流处理逻辑
            if (!retryResponse.body) {
              throw new Error('Response body is null');
            }

            const reader = retryResponse.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (line.trim()) {
                  try {
                    const parsed = JSON.parse(line);
                    if (parsed.response) {
                      onChunk(parsed.response);
                    } else if (parsed.error) {
                      onError?.(parsed.error);
                    }
                  } catch (parseError) {
                    console.error('Failed to parse JSON:', parseError, 'Line:', line);
                    onError?.(`JSON parse error: ${parseError}`);
                  }
                }
              }
            }

            // 处理缓冲区中剩余的数据
            if (buffer.trim()) {
              try {
                const parsed = JSON.parse(buffer);
                if (parsed.response) {
                  onChunk(parsed.response);
                } else if (parsed.error) {
                  onError?.(parsed.error);
                }
              } catch (parseError) {
                console.error('Failed to parse final buffer:', parseError);
              }
            }

            return; // 重试成功完成
          } catch (refreshError) {
            console.error('Failed to refresh guest token for streaming:', refreshError);
            navigationService.navigateToLogin();
            throw new Error('Failed to refresh authentication', { cause: refreshError });
          }
        }

        // 非 guest 模式：跳转登录页
        navigationService.navigateToLogin();

        // 创建特定的认证错误
        const authError = new Error('Authentication required');
        throw authError;
      }

      // 使用具体消息处理其他常见 HTTP 错误
      let errorBody = 'Unknown error';
      try {
        errorBody = await response.text(); // 尝试从响应体获取错误详情
      } catch { /* 忽略 */ }

      // 与 axios 拦截器保持一致的错误消息格式
      const url = `${backendBaseUrl}/query/stream`;
      throw new Error(
        `${response.status} ${response.statusText}\n${JSON.stringify(
          { error: errorBody }
        )}\n${url}`
      );
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break; // 流已结束
      }

      // 解码数据块并追加到缓冲区
      buffer += decoder.decode(value, { stream: true }); // stream: true 处理跨数据块分割的多字节字符

      // 处理完整的行（NDJSON）
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // 将可能不完整的行保留在缓冲区中

      for (const line of lines) {
        if (line.trim()) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.response) {
              onChunk(parsed.response);
            } else if (parsed.error && onError) {
              onError(parsed.error);
            }
          } catch (error) {
            console.error('Error parsing stream chunk:', line, error);
            if (onError) onError(`Error parsing server response: ${line}`);
          }
        }
      }
    }

    // 流结束后处理缓冲区中剩余的数据
    if (buffer.trim()) {
      try {
        const parsed = JSON.parse(buffer);
        if (parsed.response) {
          onChunk(parsed.response);
        } else if (parsed.error && onError) {
          onError(parsed.error);
        }
      } catch (error) {
        console.error('Error parsing final chunk:', buffer, error);
        if (onError) onError(`Error parsing final server response: ${buffer}`);
      }
    }

  } catch (error) {
    const message = errorMessage(error);

    // 检查是否为认证错误
    if (message === 'Authentication required') {
      // 已在 response.status === 401 分支中跳转登录页
      console.error('Authentication required for stream request');
      if (onError) {
        onError('Authentication required');
      }
      return; // 提前退出，无需进一步错误处理
    }

    // 检查错误消息中的特定 HTTP 状态码
    const statusCodeMatch = message.match(/^(\d{3})\s/);
    if (statusCodeMatch) {
      const statusCode = parseInt(statusCodeMatch[1], 10);

      // 针对特定状态码给出用户友好的提示消息
      let userMessage = message;

      switch (statusCode) {
        case 403:
          userMessage = 'You do not have permission to access this resource (403 Forbidden)';
          console.error('Permission denied for stream request:', message);
          break;
        case 404:
          userMessage = 'The requested resource does not exist (404 Not Found)';
          console.error('Resource not found for stream request:', message);
          break;
        case 429:
          userMessage = 'Too many requests, please try again later (429 Too Many Requests)';
          console.error('Rate limited for stream request:', message);
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          userMessage = `Server error, please try again later (${statusCode})`;
          console.error('Server error for stream request:', message);
          break;
        default:
          console.error('Stream request failed with status code:', statusCode, message);
      }

      if (onError) {
        onError(userMessage);
      }
      return;
    }

    // 处理网络错误（如连接被拒绝、超时等）
    if (message.includes('NetworkError') ||
        message.includes('Failed to fetch') ||
        message.includes('Network request failed')) {
      console.error('Network error for stream request:', message);
      if (onError) {
        onError('Network connection error, please check your internet connection');
      }
      return;
    }

    // 处理流处理过程中的 JSON 解析错误
    if (message.includes('Error parsing') || message.includes('SyntaxError')) {
      console.error('JSON parsing error in stream:', message);
      if (onError) {
        onError('Error processing response data');
      }
      return;
    }

    // 处理其他错误
    console.error('Unhandled stream error:', message);
    if (onError) {
      onError(message);
    } else {
      console.error('No error handler provided for stream error:', message);
    }
  }
};

export const insertText = async (text: string): Promise<DocActionResponse> => {
  const response = await axiosInstance.post('/documents/text', { text })
  return response.data
}

export const insertTexts = async (texts: string[]): Promise<DocActionResponse> => {
  const response = await axiosInstance.post('/documents/texts', { texts })
  return response.data
}

export const uploadDocument = async (
  file: File,
  onUploadProgress?: (percentCompleted: number) => void
): Promise<DocActionResponse> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await axiosInstance.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    // prettier-ignore
    onUploadProgress:
      onUploadProgress !== undefined
        ? (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!)
          onUploadProgress(percentCompleted)
        }
        : undefined
  })
  return response.data
}

export const batchUploadDocuments = async (
  files: File[],
  onUploadProgress?: (fileName: string, percentCompleted: number) => void
): Promise<DocActionResponse[]> => {
  return await Promise.all(
    files.map(async (file) => {
      return await uploadDocument(file, (percentCompleted) => {
        onUploadProgress?.(file.name, percentCompleted)
      })
    })
  )
}

export const clearDocuments = async (): Promise<DocActionResponse> => {
  const response = await axiosInstance.delete('/documents')
  return response.data
}

export const clearCache = async (): Promise<{
  status: 'success' | 'fail'
  message: string
}> => {
  const response = await axiosInstance.post('/documents/clear_cache', {})
  return response.data
}

export const deleteDocuments = async (
  docIds: string[],
  deleteFile: boolean = false,
  deleteLLMCache: boolean = false
): Promise<DeleteDocResponse> => {
  const response = await axiosInstance.delete('/documents/delete_document', {
    data: { doc_ids: docIds, delete_file: deleteFile, delete_llm_cache: deleteLLMCache }
  })
  return response.data
}

export const getAuthStatus = async (): Promise<AuthStatusResponse> => {
  try {
    // 为请求添加超时，避免长时间挂起
    const response = await axiosInstance.get('/auth-status', {
      timeout: 5000, // 5 秒超时
      headers: {
        'Accept': 'application/json' // 明确要求返回 JSON
      }
    });

    // 检查响应是否为 HTML（通常意味着被重定向或请求了错误的端点）
    const contentTypeHeader = response.headers['content-type'];
    const contentType = typeof contentTypeHeader === 'string' ? contentTypeHeader : '';
    if (contentType.includes('text/html')) {
      console.warn('Received HTML response instead of JSON for auth-status endpoint');
      return {
        auth_configured: true,
        auth_mode: 'enabled'
      };
    }

    // 严格校验响应数据
    if (response.data &&
        typeof response.data === 'object' &&
        'auth_configured' in response.data &&
        typeof response.data.auth_configured === 'boolean') {

      // 未配置认证时，确保存在 access token
      if (!response.data.auth_configured) {
        if (response.data.access_token && typeof response.data.access_token === 'string') {
          return response.data;
        } else {
          console.warn('Auth not configured but no valid access token provided');
        }
      } else {
        // 已配置认证时，直接返回数据
        return response.data;
      }
    }

    // 响应数据无效但收到了响应时，记录日志
    console.warn('Received invalid auth status response:', response.data);

    // 响应无效时默认视为已配置认证
    return {
      auth_configured: true,
      auth_mode: 'enabled'
    };
  } catch (error) {
    // 请求失败时，假定已配置认证
    console.error('Failed to get auth status:', errorMessage(error));
    return {
      auth_configured: true,
      auth_mode: 'enabled'
    };
  }
}

export const getPipelineStatus = async (): Promise<PipelineStatusResponse> => {
  const response = await axiosInstance.get('/documents/pipeline_status')
  return response.data
}

export const cancelPipeline = async (): Promise<{
  status: 'cancellation_requested' | 'not_busy'
  message: string
}> => {
  const response = await axiosInstance.post('/documents/cancel_pipeline')
  return response.data
}

export const loginToServer = async (username: string, password: string): Promise<LoginResponse> => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);
  formData.append('grant_type', 'password');

  const response = await axiosInstance.post('/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  return response.data;
}

/**
 * 更新知识图谱中实体的属性
 * @param entityName 要更新的实体名称
 * @param updatedData 包含更新属性的字典
 * @param allowRename 是否允许重命名实体（默认：false）
 * @param allowMerge 重命名为已存在的名称时，是否合并到现有实体
 * @returns 包含更新后实体信息的 Promise
 */
export const updateEntity = async (
  entityName: string,
  updatedData: Record<string, any>,
  allowRename: boolean = false,
  allowMerge: boolean = false
): Promise<EntityUpdateResponse> => {
  const response = await axiosInstance.post('/graph/entity/edit', {
    entity_name: entityName,
    updated_data: updatedData,
    allow_rename: allowRename,
    allow_merge: allowMerge
  })
  return response.data
}

/**
 * 更新知识图谱中关系的属性
 * @param sourceEntity 源实体名称
 * @param targetEntity 目标实体名称
 * @param updatedData 包含更新属性的字典
 * @returns 包含更新后关系信息的 Promise
 */
export const updateRelation = async (
  sourceEntity: string,
  targetEntity: string,
  updatedData: Record<string, any>
): Promise<DocActionResponse> => {
  const response = await axiosInstance.post('/graph/relation/edit', {
    source_id: sourceEntity,
    target_id: targetEntity,
    updated_data: updatedData
  })
  return response.data
}

/**
 * 检查实体名称是否已存在于知识图谱中
 * @param entityName 要检查的实体名称
 * @returns 返回布尔值的 Promise，表示实体是否存在
 */
export const checkEntityNameExists = async (entityName: string): Promise<boolean> => {
  try {
    const response = await axiosInstance.get(`/graph/entity/exists?name=${encodeURIComponent(entityName)}`)
    return response.data.exists
  } catch (error) {
    console.error('Error checking entity name:', error)
    return false
  }
}

/**
 * 通过跟踪 ID 获取文档的处理状态
 * @param trackId 上传、文本插入等接口返回的跟踪 ID
 * @returns 包含文档列表与汇总信息的跟踪状态响应 Promise
 */
export const getTrackStatus = async (trackId: string): Promise<TrackStatusResponse> => {
  const response = await axiosInstance.get(`/documents/track_status/${encodeURIComponent(trackId)}`)
  return response.data
}

type InFlightPaginatedDocumentRequest = {
  controller: AbortController
  promise: Promise<PaginatedDocsResponse>
  subscriberCount: number
}

const getPaginatedDocumentsRequestKey = (request: DocumentsRequest): string =>
  JSON.stringify(request)

// 对参数相同的分页文档请求进行去重（复用进行中的请求）。
// 防止因重叠的定时器/副作用，或开发环境下 React StrictMode 的双重挂载
// 导致后端被重复调用。
const inFlightPaginatedDocumentRequests = new Map<
  string,
  InFlightPaginatedDocumentRequest
>()

const releasePaginatedDocumentSubscriber = (
  requestKey: string,
  requestEntry: InFlightPaginatedDocumentRequest,
  abortIfLastSubscriber: boolean
): void => {
  requestEntry.subscriberCount = Math.max(0, requestEntry.subscriberCount - 1)

  if (requestEntry.subscriberCount !== 0) {
    return
  }

  if (inFlightPaginatedDocumentRequests.get(requestKey) === requestEntry) {
    inFlightPaginatedDocumentRequests.delete(requestKey)
  }

  if (abortIfLastSubscriber) {
    requestEntry.controller.abort()
  }
}

const subscribeToPaginatedDocumentsRequest = (
  request: DocumentsRequest
): {
  requestKey: string
  requestEntry: InFlightPaginatedDocumentRequest
  release: (abortIfLastSubscriber: boolean) => void
} => {
  const requestKey = getPaginatedDocumentsRequestKey(request)
  let requestEntry = inFlightPaginatedDocumentRequests.get(requestKey)

  if (!requestEntry) {
    const controller = new AbortController()
    requestEntry = {
      controller,
      subscriberCount: 0,
      promise: paginatedDocumentsPost(request, controller)
        .finally(() => {
          if (inFlightPaginatedDocumentRequests.get(requestKey) === requestEntry) {
            inFlightPaginatedDocumentRequests.delete(requestKey)
          }
        })
    }
    inFlightPaginatedDocumentRequests.set(requestKey, requestEntry)
  }

  requestEntry.subscriberCount += 1

  let released = false
  const release = (abortIfLastSubscriber: boolean): void => {
    if (released) {
      return
    }
    released = true
    releasePaginatedDocumentSubscriber(
      requestKey,
      requestEntry,
      abortIfLastSubscriber
    )
  }

  return {
    requestKey,
    requestEntry,
    release
  }
}

const defaultPaginatedDocumentsPost = async (
  request: DocumentsRequest,
  controller: AbortController
): Promise<PaginatedDocsResponse> => {
  const response = await axiosInstance.post('/documents/paginated', request, {
    signal: controller.signal
  })
  return response.data
}

let paginatedDocumentsPost = defaultPaginatedDocumentsPost

export const abortDocumentsPaginated = (request: DocumentsRequest): void => {
  const requestKey = getPaginatedDocumentsRequestKey(request)
  const inFlightRequest = inFlightPaginatedDocumentRequests.get(requestKey)

  if (!inFlightRequest) {
    return
  }

  inFlightPaginatedDocumentRequests.delete(requestKey)
  inFlightRequest.controller.abort()
}

export const __resetPaginatedDocumentRequestsForTests = (): void => {
  for (const { controller } of inFlightPaginatedDocumentRequests.values()) {
    controller.abort()
  }
  inFlightPaginatedDocumentRequests.clear()
  paginatedDocumentsPost = defaultPaginatedDocumentsPost
}

export const __setPaginatedDocumentsPostForTests = (
  post: typeof defaultPaginatedDocumentsPost
): void => {
  paginatedDocumentsPost = post
}

/**
 * 分页获取文档
 * @param request 分页请求参数
 * @returns 分页文档响应的 Promise
 */
export const getDocumentsPaginated = async (request: DocumentsRequest): Promise<PaginatedDocsResponse> => {
  const { requestEntry, release } = subscribeToPaginatedDocumentsRequest(request)

  try {
    return await requestEntry.promise
  } finally {
    release(false)
  }
}

export const getDocumentsPaginatedWithTimeout = (
  request: DocumentsRequest,
  timeoutMs: number = 30000,
  errorMsg: string = 'Document fetch timeout'
): Promise<PaginatedDocsResponse> => {
  const { requestEntry, release } = subscribeToPaginatedDocumentsRequest(request)

  return new Promise<PaginatedDocsResponse>((resolve, reject) => {
    let timedOut = false
    const timeoutId = setTimeout(() => {
      timedOut = true
      release(true)
      reject(new Error(errorMsg))
    }, timeoutMs)

    requestEntry.promise
      .then(response => {
        if (timedOut) {
          return
        }
        clearTimeout(timeoutId)
        release(false)
        resolve(response)
      })
      .catch(error => {
        if (timedOut) {
          return
        }
        clearTimeout(timeoutId)
        release(false)
        reject(error)
      })
  })
}

/**
 * 按状态统计文档数量
 * @returns 状态计数响应的 Promise
 */
export const getDocumentStatusCounts = async (): Promise<StatusCountsResponse> => {
  const response = await axiosInstance.get('/documents/status_counts')
  return response.data
}
