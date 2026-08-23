import { APPS, COLLECTIONS, getApp, similarApps, searchApps } from '../../../src/lib/data.ts'
import { CATEGORIES } from '../../../src/lib/types.ts'

export { APPS, COLLECTIONS, CATEGORIES, getApp, similarApps, searchApps }

export const editorsPicks = () => APPS.filter((a) => a.editorsChoice)

export const topDownloads = (n = 10) => [...APPS].sort((a, b) => b.downloads - a.downloads).slice(0, n)

export const freshest = (n = 10) => [...APPS].sort((a, b) => a.updatedDaysAgo - b.updatedDaysAgo).slice(0, n)

export const runnable = () => APPS.filter((a) => a.demoId)

export function catalogStats() {
  const demoCount = runnable().length
  return {
    listings: APPS.length,
    categories: CATEGORIES.length,
    collections: COLLECTIONS.length,
    runnableDemos: demoCount,
    demoCoverage: Math.round((demoCount / APPS.length) * 100),
    avgRating: (APPS.reduce((s, a) => s + a.rating, 0) / APPS.length).toFixed(2),
    editorsPicks: editorsPicks().length,
    perCategory: Object.fromEntries(CATEGORIES.map((c) => [c, APPS.filter((a) => a.category === c).length])),
  }
}

const pad = (x) => String(x).padStart(2, '0')

export function isoWeek(d = new Date()) {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return {
    year: date.getUTCFullYear(),
    week: Math.ceil(((date - yearStart) / 86400000 + 1) / 7),
  }
}

export function stamp(d = new Date()) {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}
