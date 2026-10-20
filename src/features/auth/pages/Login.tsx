import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import {
  ArrowRight,
  BookOpenText,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Network,
  ShieldCheck,
  UserRound
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { useAuth } from '../hooks/useAuth'
import type { RegisterRequest } from '../types'

export default function LoginPage() {
  const { login, isLoggingIn, register: registerAccount, isRegistering } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    clearErrors,
    formState: { errors }
  } = useForm<RegisterRequest>({ shouldUnregister: true })

  const onSubmit = (data: RegisterRequest) => {
    if (isRegister)
      registerAccount({ username: data.username, email: data.email, password: data.password }, () =>
        setIsRegister(false)
      )
    else login({ username: data.username, password: data.password })
  }

  return (
    <main className="min-h-screen bg-[#f4f7f6] p-3 text-[#17332f] sm:p-5 lg:p-6">
      <div className="grid min-h-[calc(100vh-1.5rem)] overflow-hidden border border-[#d8e5df] bg-white shadow-[0_24px_70px_rgba(26,72,62,0.10)] sm:min-h-[calc(100vh-2.5rem)] lg:min-h-[calc(100vh-3rem)] lg:grid-cols-[minmax(0,1.08fr)_minmax(440px,0.92fr)]">
        <section className="relative hidden overflow-hidden bg-[#0f6a5b] p-10 text-white lg:flex lg:flex-col xl:p-14">
          <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.2)_1px,transparent_1px)] [background-size:44px_44px] opacity-20" />
          <div className="relative flex items-center gap-3">
            <div className="flex size-10 items-center justify-center bg-[#d7f0cb] text-[#0d6355]">
              <BookOpenText className="size-5" aria-hidden="true" />
            </div>
            <span className="text-base font-semibold">知识中枢</span>
          </div>
          <div className="relative my-auto max-w-lg py-16">
            <p className="mb-6 text-sm font-medium text-[#d7f0cb]">企业级 RAG 知识平台</p>
            <h1 className="text-4xl leading-[1.2] font-semibold xl:text-5xl">
              让每一份知识，
              <br />
              都产生可靠的答案。
            </h1>
            <p className="mt-7 max-w-md text-base leading-7 text-white/75">
              安全汇聚企业文档，快速检索可信信息，让团队专注于更重要的判断与创造。
            </p>
            <div className="mt-12 grid grid-cols-3 border-y border-white/20 py-6">
              <Feature icon={<Network />} title="统一检索" detail="跨源知识连接" />
              <Feature icon={<ShieldCheck />} title="权限可控" detail="数据安全访问" bordered />
              <Feature icon={<KeyRound />} title="即问即答" detail="引用可追溯" bordered />
            </div>
          </div>
          <p className="relative text-xs text-white/55">© 2026 Knowledge Hub</p>
        </section>

        <section className="flex min-h-[calc(100vh-1.5rem)] items-center justify-center px-6 py-12 sm:min-h-[calc(100vh-2.5rem)] sm:px-10 lg:min-h-0 lg:px-12 xl:px-20">
          <div className="w-full max-w-md">
            <div className="mb-11 flex items-center gap-3 lg:hidden">
              <div className="flex size-10 items-center justify-center bg-[#0f6a5b] text-white">
                <BookOpenText className="size-5" aria-hidden="true" />
              </div>
              <span className="text-base font-semibold">知识中枢</span>
            </div>
            <div className="mb-9">
              <p className="mb-3 text-sm font-medium text-[#0f6a5b]">欢迎回来</p>
              <h2 className="text-3xl leading-tight font-semibold text-[#17332f]">
                {isRegister ? '创建账号' : '登录工作空间'}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#668078]">
                使用您的账号访问企业知识库与智能问答。
              </p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-[#31514a]">
                  用户名
                </Label>
                <div className="relative">
                  <UserRound
                    className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#78938b]"
                    aria-hidden="true"
                  />
                  <Input
                    id="username"
                    autoComplete="username"
                    placeholder="输入用户名"
                    className="h-12 border-[#ccddd6] bg-[#fbfdfc] pl-11 shadow-none placeholder:text-[#91a69f] focus-visible:border-[#0f6a5b] focus-visible:ring-[#0f6a5b]/20"
                    aria-invalid={Boolean(errors.username)}
                    {...register('username', {
                      required: '请输入用户名',
                      minLength: { value: isRegister ? 3 : 1, message: '用户名至少 3 个字符' },
                      maxLength: { value: 50, message: '用户名最多 50 个字符' }
                    })}
                  />
                </div>
                {errors.username && (
                  <p className="text-destructive text-xs">{errors.username.message}</p>
                )}
              </div>
              {isRegister && (
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    maxLength={120}
                    {...register('email', { required: isRegister ? '请输入邮箱' : false })}
                  />
                  {errors.email && (
                    <p className="text-destructive text-xs">{errors.email.message}</p>
                  )}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-[#31514a]">
                  密码
                </Label>
                <div className="relative">
                  <LockKeyhole
                    className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#78938b]"
                    aria-hidden="true"
                  />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                    placeholder="输入密码"
                    className="h-12 border-[#ccddd6] bg-[#fbfdfc] px-11 shadow-none placeholder:text-[#91a69f] focus-visible:border-[#0f6a5b] focus-visible:ring-[#0f6a5b]/20"
                    aria-invalid={Boolean(errors.password)}
                    {...register('password', {
                      required: '请输入密码',
                      minLength: { value: isRegister ? 8 : 1, message: '密码至少 8 位' },
                      maxLength: { value: 128, message: '密码最多 128 位' }
                    })}
                  />
                  <button
                    type="button"
                    title={showPassword ? '隐藏密码' : '显示密码'}
                    aria-label={showPassword ? '隐藏密码' : '显示密码'}
                    className="absolute top-1/2 right-1 flex size-10 -translate-y-1/2 items-center justify-center text-[#78938b] transition-colors hover:text-[#0f6a5b]"
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-destructive text-xs">{errors.password.message}</p>
                )}
              </div>
              <Button
                type="submit"
                className="mt-3 h-12 w-full rounded-md bg-[#0f6a5b] text-sm font-semibold shadow-none hover:bg-[#0b584b]"
                disabled={isLoggingIn || isRegistering}
              >
                {isLoggingIn || isRegistering ? '提交中...' : isRegister ? '注册账号' : '登录'}
                {!isLoggingIn && <ArrowRight className="size-4" aria-hidden="true" />}
              </Button>
            </form>
            <Button
              className="mt-3 w-full"
              type="button"
              variant="ghost"
              disabled={isLoggingIn || isRegistering}
              onClick={() => {
                clearErrors()
                setIsRegister((value) => !value)
              }}
            >
              {isRegister ? '已有账号？返回登录' : '没有账号？注册'}
            </Button>
            <p className="mt-8 border-t border-[#e2ebe7] pt-5 text-xs leading-5 text-[#78938b]">
              登录即表示您同意组织的信息安全与访问管理规范。
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

function Feature({
  icon,
  title,
  detail,
  bordered = false
}: {
  icon: ReactNode
  title: string
  detail: string
  bordered?: boolean
}) {
  return (
    <div className={bordered ? 'border-l border-white/20 pl-5' : 'pr-5'}>
      <div className="mb-3 size-5 text-[#d7f0cb]" aria-hidden="true">
        {icon}
      </div>
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-xs text-white/60">{detail}</p>
    </div>
  )
}
