import { Navigate } from 'react-router-dom'
import { useUserStore } from '@/features/auth/store/userStore'
/** 路由守卫：需要登录则重定向到登录页 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const isLogin = useUserStore((s) => s.isLogin)
  if (!isLogin) return <Navigate to="/login" replace />
  return <>{children}</>
}

/** 已登录时跳过登录页 */
export function SkipLogin({ children }: { children: React.ReactNode }) {
  const isLogin = useUserStore((s) => s.isLogin)
  if (isLogin) return <Navigate to="/chat" replace />
  return <>{children}</>
}
