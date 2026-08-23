export type Category = 'Games' | 'Dashboards' | 'UIs & Components' | 'TUIs & CLIs' | 'Harnesses & Evals' | 'Agents & Automation'

export const CATEGORIES: Category[] = [
  'UIs & Components',
  'Dashboards',
  'Games',
  'TUIs & CLIs',
  'Harnesses & Evals',
  'Agents & Automation',
]

export type DemoId = 'snake' | 'g2048' | 'dashboard' | 'tui' | 'evaldeck' | 'kanban'

export interface ChangelogEntry {
  v: string
  notes: string[]
}

export interface App {
  id: string
  name: string
  tagline: string
  description: string[]
  developer: string
  category: Category
  tags: string[]
  rating: number
  ratingCount: number
  downloads: number
  sizeMB: number
  version: string
  updatedDaysAgo: number
  colors: [string, string]
  icon: string
  demoId?: DemoId
  editorsChoice?: boolean
  features: string[]
  permissions?: string[]
  changelog: ChangelogEntry[]
}
