import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

export function OfflineBanner() {
  const [online, setOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const up = () => setOnline(true)
    const down = () => setOnline(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => {
      window.removeEventListener('online', up)
      window.removeEventListener('offline', down)
    }
  }, [])

  if (online) return null
  return (
    <div role="status" className="flex items-center justify-center gap-2 bg-[#F97316]/10 px-4 py-2 text-center text-[12px] font-semibold text-[#B45309]">
      <WifiOff size={13} aria-hidden />
      You&rsquo;re offline — browsing still works, installs and sync resume when you reconnect.
    </div>
  )
}
