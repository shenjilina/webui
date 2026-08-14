import type { StructDataItem } from '@/features/struct/types'

/** mock 结构化数据列表（可变数组，供 handlers 增删改） */
export const mockStructData: StructDataItem[] = [
  {
    id: 'struct-001',
    key: 'company_name',
    value: '示例科技有限公司',
    metadata: '{"category": "基本信息"}',
    createdAt: '2025-05-20T10:00:00.000Z',
    updatedAt: '2025-05-20T10:00:00.000Z',
  },
  {
    id: 'struct-002',
    key: 'product_version',
    value: 'v2.4.1',
    metadata: '{"category": "产品信息"}',
    createdAt: '2025-05-22T11:30:00.000Z',
    updatedAt: '2025-06-01T09:00:00.000Z',
  },
  {
    id: 'struct-003',
    key: 'support_email',
    value: 'support@example.com',
    metadata: '{"category": "联系方式"}',
    createdAt: '2025-05-25T14:20:00.000Z',
    updatedAt: '2025-05-25T14:20:00.000Z',
  },
  {
    id: 'struct-004',
    key: 'service_hours',
    value: '工作日 9:00 - 18:00',
    createdAt: '2025-06-02T08:45:00.000Z',
    updatedAt: '2025-06-02T08:45:00.000Z',
  },
]
