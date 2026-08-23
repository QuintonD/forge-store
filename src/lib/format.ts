export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 100_000 ? 0 : 1)}K`
  return `${n}`
}

export function formatUpdated(daysAgo: number): string {
  if (daysAgo <= 0) return 'today'
  if (daysAgo === 1) return 'yesterday'
  if (daysAgo < 7) return `${daysAgo} days ago`
  if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} week${daysAgo < 14 ? '' : 's'} ago`
  const months = Math.floor(daysAgo / 30)
  return `${months} month${months === 1 ? '' : 's'} ago`
}

export function formatSize(mb: number): string {
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(mb * 1024)} KB`
}
