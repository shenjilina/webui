import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  MessageSquare,
  FileText,
  Database,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  PanelLeft,
  PanelLeftClose,
  BookOpenText,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Separator } from '@/shared/components/ui/separator'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/shared/components/ui/tooltip'
import { useTheme } from '@/shared/hooks/useTheme'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { cn } from '@/shared/lib/utils'
import { ChatSessionPanel } from './components/ChatSessionPanel'

const navItems = [
  { path: '/chat', label: '智能问答', icon: MessageSquare },
  { path: '/document/list', label: '文档管理', icon: FileText },
  { path: '/document/struct', label: '结构化数据', icon: Database },
]

export default function MainLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { logout, userInfo } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const userInitial = (userInfo?.username ?? '用户').slice(0, 1).toUpperCase()
  const isChatPage = location.pathname === '/chat'

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar */}
        <aside
          className={cn(
            'hidden md:flex flex-col border-r bg-sidebar overflow-hidden transition-[width] duration-300',
            collapsed ? 'w-16' : 'w-64',
          )}
        >
          {/* 侧栏标题 + 收起/展开按钮 */}
          <div className="flex items-center pt-4 pb-1 px-2">
            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <span className="block px-2 text-base font-semibold whitespace-nowrap">工作台</span>
              </div>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn('h-7 w-7 shrink-0 text-muted-foreground', collapsed && 'mx-auto')}
                  onClick={() => setCollapsed(!collapsed)}
                >
                  {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{collapsed ? '展开侧栏' : '收起侧栏'}</TooltipContent>
            </Tooltip>
          </div>
          {/* 导航菜单 */}
          <nav className="space-y-1 px-3 pt-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                const Icon = item.icon
                return (
                  <Tooltip key={item.path}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => navigate(item.path)}
                        className={cn(
                          'flex w-full items-center gap-3 overflow-hidden rounded-lg px-3 py-2.5 text-sm whitespace-nowrap transition-colors',
                          collapsed && 'justify-center px-0',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>}
                      </button>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    )}
                  </Tooltip>
                )
              })}
          </nav>
          {/* 会话面板：仅智能问答路由下显示（新建对话 + 最近 + 会话列表）；收起时隐藏 */}
          {!collapsed && isChatPage && <ChatSessionPanel />}
          {/* 底部：当前用户信息 */}
          <div className="mt-auto p-3">
            <div className={cn('flex items-center gap-2 rounded-lg py-1.5', collapsed ? 'justify-center px-0' : 'px-2')}>
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className="text-xs">{userInitial}</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <>
                  <p className="flex-1 min-w-0 truncate text-sm font-medium whitespace-nowrap">
                    {userInfo?.username ?? '未登录'}
                  </p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => logout()}
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">退出登录</TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-64 bg-sidebar border-r">
              <div className="flex h-14 items-center justify-between px-4">
                <span className="text-sm font-semibold">RAG 知识库</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMobileOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Separator />
              <nav className="space-y-1 p-2">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); setMobileOpen(false) }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                      location.pathname === item.path
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {/* Top bar：品牌标识 + 右侧图标簇（主题切换/个人中心） */}
          <div className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <BookOpenText className="h-5 w-5" />
            <span className="text-sm font-semibold">RAG 知识库</span>
            <div className="ml-auto flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleTheme}>
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{theme === 'dark' ? '浅色模式' : '深色模式'}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 rounded-full p-0"
                    onClick={() => navigate('/user/profile')}
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs">{userInitial}</AvatarFallback>
                    </Avatar>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">个人中心</TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </TooltipProvider>
  )
}
