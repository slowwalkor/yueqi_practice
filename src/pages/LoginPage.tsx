import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type TabMode = 'login' | 'register'

// 将 Supabase 英文错误转为中文
function friendlyError(msg: string): string {
  if (msg === '__email_confirm__') return '注册成功！请查收邮箱确认链接后再登录'
  if (msg.includes('Invalid login credentials')) return '邮箱或密码错误'
  if (msg.includes('User already registered')) return '该邮箱已注册，请直接登录'
  if (msg.includes('Password should be at least 6 characters')) return '密码至少需要6位'
  if (msg.includes('Unable to validate email address')) return '请输入有效的邮箱地址'
  if (msg.includes('Email rate limit exceeded')) return '操作过于频繁，请稍后再试'
  return msg
}

export default function LoginPage() {
  const { signInWithEmail, signUpWithEmail, enterGuestMode } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState<TabMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email || !password) {
      setError('请填写邮箱和密码')
      return
    }

    if (tab === 'register') {
      if (password.length < 6) {
        setError('密码至少需要6位')
        return
      }
      if (password !== confirmPassword) {
        setError('两次输入的密码不一致')
        return
      }
    }

    setLoading(true)

    if (tab === 'login') {
      const result = await signInWithEmail(email, password)
      setLoading(false)
      if (result.error) {
        setError(friendlyError(result.error))
      } else {
        navigate('/')
      }
    } else {
      const result = await signUpWithEmail(email, password)
      setLoading(false)
      if (result.error) {
        const msg = friendlyError(result.error)
        if (result.error === '__email_confirm__') {
          setSuccess(msg)
        } else {
          setError(msg)
        }
      } else {
        // 没有开启邮箱确认，直接登录成功
        setSuccess('注册成功！')
        setTimeout(() => navigate('/'), 800)
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 page-enter relative overflow-hidden">
      {/* 深色水墨山水渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f1a0a] via-[#1a2e14] to-[#f0e8d8]" />
      
      {/* 山水暗纹装饰 */}
      <svg className="absolute bottom-0 left-0 right-0 opacity-[0.08]" viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice">
        <path d="M0 200 Q50 140 100 160 Q150 100 200 130 Q250 80 300 120 Q350 90 400 110 L400 200 Z" fill="white" />
        <path d="M0 200 Q80 160 150 180 Q220 140 300 160 Q360 130 400 150 L400 200 Z" fill="white" opacity="0.5" />
      </svg>

      {/* 中心内容 */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        {/* Logo区 */}
        <div className="text-center mb-8">
          {/* 竹叶 SVG */}
          <div className="mb-4">
            <svg className="w-12 h-12 mx-auto text-[#4a7c23]/80" viewBox="0 0 48 48" fill="none">
              <path d="M24 8c-6 4-8 10-6 16 2-6 8-10 14-10-4 4-6 10-4 16 2-6 6-10 12-12-6 6-8 14-6 22" 
                    stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
              <path d="M20 28c-4 2-6 6-6 10" stroke="currentColor" strokeWidth={1} strokeLinecap="round" opacity={0.6} />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-[6px]" style={{ fontFamily: 'STKaiti, KaiTi, serif' }}>
            竹韵笛声
          </h1>
          <p className="text-sm text-white/50 mt-2 tracking-widest" style={{ fontFamily: 'STKaiti, KaiTi, serif' }}>
            学笛 · 悟道 · 修心
          </p>
        </div>

        {/* 登录卡片 — 白色半透明毛玻璃 */}
        <div className="w-full rounded-2xl bg-white/85 backdrop-blur-xl p-6 shadow-xl border border-white/50">
          {/* Tab 切换 */}
          <div className="flex justify-center gap-8 mb-6">
            <button
              onClick={() => { setTab('login'); setError(''); setSuccess('') }}
              className={`relative pb-2 text-sm transition-colors ${
                tab === 'login' ? 'text-[#1a1a1a] font-semibold' : 'text-[#9b9b9b]'
              }`}
              style={{ fontFamily: 'STKaiti, KaiTi, serif' }}
            >
              登录
              {tab === 'login' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-[#c0392b] rounded-full" />
              )}
            </button>
            <button
              onClick={() => { setTab('register'); setError(''); setSuccess('') }}
              className={`relative pb-2 text-sm transition-colors ${
                tab === 'register' ? 'text-[#1a1a1a] font-semibold' : 'text-[#9b9b9b]'
              }`}
              style={{ fontFamily: 'STKaiti, KaiTi, serif' }}
            >
              注册
              {tab === 'register' && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-[#c0392b] rounded-full" />
              )}
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* 邮箱输入 */}
            <div className="mb-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入邮箱"
                className="w-full px-0 py-2 border-0 border-b border-[#2d5016]/20 bg-transparent text-[#1a1a1a] text-base
                           placeholder:text-[#9b9b9b] focus:outline-none focus:border-[#2d5016]/50 transition-colors"
              />
            </div>

            {/* 密码输入 */}
            <div className="mb-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tab === 'register' ? '请输入密码（至少6位）' : '请输入密码'}
                className="w-full px-0 py-2 border-0 border-b border-[#2d5016]/20 bg-transparent text-[#1a1a1a] text-base
                           placeholder:text-[#9b9b9b] focus:outline-none focus:border-[#2d5016]/50 transition-colors"
              />
            </div>

            {/* 确认密码（仅注册模式） */}
            {tab === 'register' && (
              <div className="mb-4">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="请确认密码"
                  className="w-full px-0 py-2 border-0 border-b border-[#2d5016]/20 bg-transparent text-[#1a1a1a] text-base
                             placeholder:text-[#9b9b9b] focus:outline-none focus:border-[#2d5016]/50 transition-colors"
                />
              </div>
            )}

            {/* 错误提示 */}
            {error && (
              <p className="text-sm text-[#c0392b] text-center mb-3">
                {error}
              </p>
            )}

            {/* 成功提示 */}
            {success && (
              <p className="text-sm text-[#27ae60] text-center mb-3">
                {success}
              </p>
            )}

            {/* 主按钮 — 竹绿渐变 */}
            <button
              type="submit"
              disabled={loading}
              className="btn-bamboo w-full py-3 mt-2 text-base disabled:opacity-50 transition-all active:scale-95"
            >
              {loading ? '处理中...' : tab === 'login' ? '登录' : '注册'}
            </button>
          </form>
        </div>

        {/* 游客入口 — 底部淡灰文字 */}
        <button
          onClick={enterGuestMode}
          className="mt-6 text-sm text-white/40 transition-colors active:text-white/60"
          style={{ fontFamily: 'STKaiti, KaiTi, serif' }}
        >
          跳过登录，先体验 →
        </button>

        {/* 底部竹叶装饰 */}
        <div className="mt-8 opacity-30">
          <svg className="w-16 h-8 text-white/60" viewBox="0 0 64 32" fill="none">
            <path d="M10 28c4-8 10-12 18-10-6 2-10 6-12 12" stroke="currentColor" strokeWidth={0.8} strokeLinecap="round" />
            <path d="M32 24c3-6 8-8 14-7-4 2-7 5-8 9" stroke="currentColor" strokeWidth={0.8} strokeLinecap="round" />
            <path d="M48 26c2-5 6-7 12-6-3 1-5 4-6 7" stroke="currentColor" strokeWidth={0.8} strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  )
}
