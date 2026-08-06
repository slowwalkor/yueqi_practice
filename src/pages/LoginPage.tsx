import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { signInWithPhone, verifyOTP, signInWithWechat, enterGuestMode } = useAuth()
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const handleSendOTP = async () => {
    if (!phone.match(/^1\d{10}$/)) {
      setError('请输入正确的手机号')
      return
    }
    setSending(true)
    setError('')
    const result = await signInWithPhone(phone)
    setSending(false)
    if (result.error) {
      setError(result.error)
    } else {
      setOtpSent(true)
    }
  }

  const handleVerify = async () => {
    if (otp.length < 4) {
      setError('请输入验证码')
      return
    }
    setVerifying(true)
    setError('')
    const result = await verifyOTP(phone, otp)
    setVerifying(false)
    if (result.error) {
      setError(result.error)
    }
  }

  const handleWechat = async () => {
    setError('')
    const result = await signInWithWechat()
    if (result.error) {
      setError(result.error)
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
          {/* 手机号输入 — 底部单线 */}
          <div className="mb-5">
            <label className="text-xs text-[#4a4a4a] block mb-3" style={{ fontFamily: 'STKaiti, KaiTi, serif' }}>
              手机号登录
            </label>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="请输入手机号"
                  maxLength={11}
                  className="w-full px-0 py-2 border-0 border-b border-[#2d5016]/20 bg-transparent text-[#1a1a1a] text-base
                             placeholder:text-[#9b9b9b] focus:outline-none focus:border-[#2d5016]/50 transition-colors"
                />
              </div>
              {/* 朱砂色发送验证码按钮 */}
              <button
                onClick={handleSendOTP}
                disabled={sending || otpSent}
                className="btn-seal px-3 py-2 text-xs whitespace-nowrap disabled:opacity-50 transition-all"
              >
                {sending ? '...' : otpSent ? '已发送' : '获取验证码'}
              </button>
            </div>
          </div>

          {/* 验证码输入 */}
          {otpSent && (
            <div className="mb-5">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="请输入验证码"
                maxLength={6}
                className="w-full px-0 py-2 border-0 border-b border-[#2d5016]/20 bg-transparent text-[#1a1a1a] text-center text-lg tracking-[8px]
                           placeholder:text-[#9b9b9b] placeholder:tracking-normal focus:outline-none focus:border-[#2d5016]/50 transition-colors"
              />
              {/* 竹绿渐变大登录按钮 */}
              <button
                onClick={handleVerify}
                disabled={verifying}
                className="btn-bamboo w-full py-3 mt-4 text-base disabled:opacity-50 transition-all active:scale-95"
              >
                {verifying ? '验证中...' : '登录'}
              </button>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <p className="text-sm text-[#c0392b] text-center mb-3">
              {error}
            </p>
          )}

          {/* 分隔线 */}
          <div className="flex items-center my-5">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#2d5016]/15 to-transparent" />
            <span className="px-3 text-[11px] text-[#9b9b9b]">或</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#2d5016]/15 to-transparent" />
          </div>

          {/* 微信登录 */}
          <button
            onClick={handleWechat}
            className="w-full py-2.5 rounded-xl text-white font-semibold text-sm
                       bg-[#07c160] active:scale-95 transition-all shadow-md"
          >
            微信一键登录
          </button>
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
