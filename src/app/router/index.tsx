import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RequireAuth, SkipLogin } from './guards'
import MainLayout from '@/app/layout/MainLayout'
import LoginPage from '@/features/auth/pages/Login'
import ProfilePage from '@/features/auth/pages/Profile'
import DocumentListPage from '@/features/document/pages/DocumentList'
import StructDataPage from '@/features/struct/pages/StructData'
import ChatPage from '@/features/chat/pages/Chat'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <SkipLogin>
        <LoginPage />
      </SkipLogin>
    )
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
      { path: 'document/struct', element: <StructDataPage /> }
    ]
  }
])
