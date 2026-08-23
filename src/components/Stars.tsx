export function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  const pct = (rating / 5) * 100
  return (
    <span className="relative inline-block leading-none" title={`${rating.toFixed(1)} out of 5`}>
      <span className="flex gap-[1.5px] text-line">
        {[0, 1, 2, 3, 4].map((i) => (
          <StarSvg key={i} size={size} filled={false} />
        ))}
      </span>
      <span className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
        <span className="flex gap-[1.5px] text-[#D97706]">
          {[0, 1, 2, 3, 4].map((i) => (
            <StarSvg key={i} size={size} filled />
          ))}
        </span>
      </span>
    </span>
  )
}

function StarSvg({ size, filled }: { size: number; filled: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.8}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinejoin="round" />
    </svg>
  )
}
