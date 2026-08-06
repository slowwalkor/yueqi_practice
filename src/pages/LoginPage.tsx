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
    <div className="min-h-screen bg-paper-texture flex flex-col items-center justify-center px-6 page-enter">
      {/* 顶部装饰 */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🎵</div>
        <h1 className="title-brush text-3xl text-[var(--color-bamboo-dark)] mb-1">
          竹笛每日练
        </h1>
        <p className="text-sm text-[var(--color-ink-light)]">
          日课不辍 · 笛韵悠长
        </p>
        <div className="bamboo-divider w-32 mx-auto mt-4"></div>
      </div>

      {/* 登录卡片 */}
      <div className="w-full max-w-sm card-classical bg-white/80 backdrop-blur-sm p-6">
        {/* 手机号输入 */}
        <div className="mb-4">
          <label className="section-title text-sm text-[var(--color-ink)] block mb-2">
            手机号登录
          </label>
          <div className="flex gap-2">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入手机号"
              maxLength={11}
              className="flex-1 px-3 py-2.5 rounded-lg border border-[var(--color-bamboo-100)] 
                         bg-[var(--color-cream)] text-[var(--color-ink)] 
                         placeholder:text-[var(--color-ink-wash)] focus:outline-none 
                         focus:border-[var(--color-bamboo-light)] transition-colors"
            />
            <button
              onClick={handleSendOTP}
              disabled={sending || otpSent}
              className="btn-primary px-3 py-2.5 text-sm whitespace-nowrap disabled:opacity-50"
            >
              {sending ? '发送中...' : otpSent ? '已发送' : '获取验证码'}
            </button>
          </div>
        </div>

        {/* 验证码输入 */}
        {otpSent && (
          <div className="mb-4">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="请输入验证码"
              maxLength={6}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-bamboo-100)] 
                         bg-[var(--color-cream)] text-[var(--color-ink)] text-center text-lg tracking-widest
                         placeholder:text-[var(--color-ink-wash)] focus:outline-none 
                         focus:border-[var(--color-bamboo-light)] transition-colors"
            />
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="btn-primary w-full py-2.5 mt-3 text-base disabled:opacity-50"
            >
              {verifying ? '验证中...' : '登录'}
            </button>
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <p className="text-sm text-[var(--color-vermilion)] text-center mb-3">
            {error}
          </p>
        )}

        {/* 分隔线 */}
        <div className="flex items-center my-5">
          <div className="flex-1 h-px bg-[var(--color-bamboo-100)]"></div>
          <span className="px-3 text-xs text-[var(--color-ink-wash)]">或</span>
          <div className="flex-1 h-px bg-[var(--color-bamboo-100)]"></div>
        </div>

        {/* 微信登录 */}
        <button
          onClick={handleWechat}
          className="w-full py-2.5 rounded-xl text-white font-semibold text-base
                     bg-[#07c160] hover:bg-[#06ad56] active:scale-95 transition-all
                     shadow-md"
        >
          <span className="mr-2">💬</span>微信一键登录
        </button>
      </div>

      {/* 游客入口 */}
      <button
        onClick={enterGuestMode}
        className="mt-6 text-sm text-[var(--color-ink-light)] underline underline-offset-4
                   decoration-[var(--color-bamboo-100)] hover:text-[var(--color-bamboo)]
                   transition-colors"
      >
        跳过登录，先体验
      </button>

      {/* 底部装饰 */}
      <div className="mt-8 text-[var(--color-ink-wash)] text-xs text-center">
        🎋 登录后数据可云端同步
      </div>
    </div>
  )
}
