import type { DemoId } from './types'

async function loadDemo(id: DemoId): Promise<string> {
  const res = await fetch(`/demos/${id}.html`)
  if (!res.ok) throw new Error(`demo artifact ${id} unavailable`)
  return res.text()
}

const Snake = () => loadDemo('snake')
const G2048 = () => loadDemo('g2048')
const Dashboard = () => loadDemo('dashboard')
const Tui = () => loadDemo('tui')
const Evaldeck = () => loadDemo('evaldeck')
const Kanban = () => loadDemo('kanban')

export const DEMOS: Record<DemoId, () => Promise<string>> = {
  snake: Snake,
  g2048: G2048,
  dashboard: Dashboard,
  tui: Tui,
  evaldeck: Evaldeck,
  kanban: Kanban,
}
