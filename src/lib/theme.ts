import type { Category } from './types'

const MOTIF_FILE = 'ChatGPT Image Aug 23, 2026, 11_07_49 AM (5).png'
export const HERO_ART = `/art/${encodeURI('ChatGPT Image Aug 23, 2026, 11_07_50 AM (6).png')}`
export const MOTIF_SHEET = `/art/${encodeURI(MOTIF_FILE)}`

export interface CategoryTheme {
  accent: string
  soft: string
  border: string
  /** background-position for the 8-cell motif sheet rendered at background-size: 400% 200% */
  motifPos: string
}

export const CATEGORY_THEME: Record<Category, CategoryTheme> = {
  'UIs & Components': { accent: '#315CFF', soft: 'rgba(49,92,255,0.08)', border: 'rgba(49,92,255,0.28)', motifPos: '100% 100%' },
  Dashboards: { accent: '#5B6472', soft: 'rgba(91,100,114,0.09)', border: 'rgba(91,100,114,0.30)', motifPos: '66.666% 100%' },
  Games: { accent: '#7A5CFA', soft: 'rgba(122,92,250,0.08)', border: 'rgba(122,92,250,0.28)', motifPos: '33.333% 0%' },
  'TUIs & CLIs': { accent: '#1D3557', soft: 'rgba(29,53,87,0.07)', border: 'rgba(29,53,87,0.26)', motifPos: '100% 0%' },
  'Harnesses & Evals': { accent: '#F97316', soft: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.30)', motifPos: '33.333% 100%' },
  'Agents & Automation': { accent: '#2E7D6B', soft: 'rgba(46,125,107,0.08)', border: 'rgba(46,125,107,0.28)', motifPos: '66.666% 0%' },
}

export function categoryAccent(category: Category | string): string {
  return CATEGORY_THEME[category as Category]?.accent ?? '#5B6472'
}
