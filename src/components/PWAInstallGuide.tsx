import { useState, useEffect } from 'react'

const DISMISSED_KEY = 'pwa-guide-dismissed'

export default function PWAInstallGuide() {
  const [visible, setVisible] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // 检测是否已安装到桌面
    const isStandalone = (window.navigator as any).standalone === true
    const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches
    const isInstalled = isStandalone || isStandaloneMedia

    // 已安装则永不显示
    if (isInstalled) return

    // 检查是否已点击"我已添加"永久关闭
    const dismissed = localStorage.getItem(DISMISSED_KEY)
    if (dismissed === 'permanent') return

    // 检查是否本次会话已关闭（稍后再说）
    const sessionDismissed = sessionStorage.getItem(DISMISSED_KEY)
    if (sessionDismissed) return

    // 检测平台
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(ios)
    setVisible(true)
  }, [])

  const handleDismissPermanent = () => {
    localStorage.setItem(DISMISSED_KEY, 'permanent')
    setVisible(false)
  }

  const handleDismissLater = () => {
    sessionStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-5 animate-fade-in">
        {/* 标题 */}
        <div className="text-center space-y-2">
          <div className="text-4xl">📱</div>
          <h2 className="text-lg font-bold text-gray-800">
            添加到主屏幕，数据永不丢失
          </h2>
          <p className="text-sm text-gray-500">
            安装为独立应用后，练习数据不会被浏览器自动清理
          </p>
        </div>

        {/* 操作指引 */}
        <div className="bg-cream rounded-xl p-4 space-y-3">
          {isIOS ? (
            <>
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">1️⃣</span>
                <p className="text-sm text-gray-700">
                  点击底部 Safari 工具栏的{' '}
                  <span className="inline-flex items-center">
                    <svg className="w-5 h-5 text-blue-500 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </span>{' '}
                  <strong>分享按钮</strong>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">2️⃣</span>
                <p className="text-sm text-gray-700">
                  向下滑动，点击 <strong>"添加到主屏幕"</strong>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">3️⃣</span>
                <p className="text-sm text-gray-700">
                  点击右上角 <strong>"添加"</strong> 确认
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">1️⃣</span>
                <p className="text-sm text-gray-700">
                  点击浏览器右上角{' '}
                  <span className="inline-flex items-center">
                    <svg className="w-5 h-5 text-gray-600 inline" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="5" r="2" />
                      <circle cx="12" cy="12" r="2" />
                      <circle cx="12" cy="19" r="2" />
                    </svg>
                  </span>{' '}
                  <strong>菜单按钮</strong>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">2️⃣</span>
                <p className="text-sm text-gray-700">
                  选择 <strong>"添加到主屏幕"</strong> 或 <strong>"安装应用"</strong>
                </p>
              </div>
            </>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="space-y-3">
          <button
            onClick={handleDismissPermanent}
            className="w-full py-3 bg-bamboo text-white rounded-xl font-bold text-base min-h-[48px] hover:bg-bamboo-dark active:scale-95 transition-all shadow-md"
          >
            我已添加 ✓
          </button>
          <button
            onClick={handleDismissLater}
            className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-medium text-sm min-h-[44px] hover:bg-gray-200 active:scale-95 transition-all"
          >
            稍后再说
          </button>
        </div>
      </div>
    </div>
  )
}
