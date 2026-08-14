import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useUserStore } from '@/features/auth/store/userStore'
import MainLayout from '@/app/layout/MainLayout'
import LoginPage from '@/features/auth/pages/Login'
import ProfilePage from '@/features/auth/pages/Profile'
import DocumentListPage from '@/features/document/pages/DocumentList'
import StructDataPage from '@/features/struct/pages/StructData'
import ChatPage from '@/features/chat/pages/Chat'

/** 路由守卫：需要登录则重定向到登录页 */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const isLogin = useUserStore((s) => s.isLogin)
  if (!isLogin) return <Navigate to="/login" replace />
  return <>{children}</>
}

/** 已登录时跳过登录页 */
function SkipLogin({ children }: { children: React.ReactNode }) {
  const isLogin = useUserStore((s) => s.isLogin)
  if (isLogin) return <Navigate to="/chat" replace />
  return <>{children}</>
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <SkipLogin>
        <LoginPage />
      </SkipLogin>
    ),
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <MainLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/chat" replace /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'user/profile', element: <ProfilePage /> },
      { path: 'document/list', element: <DocumentListPage /> },
      { path: 'document/struct', element: <StructDataPage /> },
    ],
  },
])
