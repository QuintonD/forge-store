import {
  Activity, Server, Wallet, TrendingUp, Leaf, Users, ChartCandlestick,
  Gamepad2, Grid3x3, Swords, Castle, Orbit, PawPrint, Music, Type,
  Layers, SquareKanban, ClipboardList, Map, Palette, Navigation,
  LayoutDashboard, FolderTree, GitBranch, Cpu, NotebookPen, Network,
  Clapperboard, FlaskConical, ShieldHalf, Gauge, Waypoints, Mail,
  Bug, Presentation, CalendarClock, SquareTerminal, Bot, Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { App } from '../lib/types'

const REGISTRY: Record<string, LucideIcon> = {
  Activity, Server, Wallet, TrendingUp, Leaf, Users, ChartCandlestick,
  Gamepad2, Grid3x3, Swords, Castle, Orbit, PawPrint, Music, Type,
  Layers, SquareKanban, ClipboardList, Map, Palette, Navigation,
  LayoutDashboard, FolderTree, GitBranch, Cpu, NotebookPen, Network,
  Clapperboard, FlaskConical, ShieldHalf, Gauge, Waypoints, Mail,
  Bug, Presentation, CalendarClock, SquareTerminal, Bot,
}

export function AppGlyph({ name, size = 20, className = '' }: { name: string; size?: number; className?: string }) {
  const Icon = REGISTRY[name] ?? Sparkles
  return <Icon size={size} className={className} strokeWidth={2.1} />
}

export function AppIcon({ app, size = 'md' }: { app: App; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const dims = {
    sm: 'h-11 w-11 rounded-[12px]',
    md: 'w-14 h-14 rounded-4',
    lg: 'w-24 h-24 rounded-[22px]',
    xl: 'w-28 h-28 rounded-[26px]',
  }[size]
  const iconSize = { sm: 18, md: 24, lg: 40, xl: 46 }[size]
  return (
    <div
      className={`${dims} relative flex shrink-0 items-center justify-center text-white ring-1 ring-inset ring-black/5`}
      style={{
        background: `linear-gradient(135deg, ${app.colors[0]}, ${app.colors[1]})`,
      }}
    >
      <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/20 to-transparent" />
      <AppGlyph name={app.icon} size={iconSize} />
    </div>
  )
}
