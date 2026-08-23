import { useEffect } from 'react'

type JsonLd = Record<string, unknown>

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertJsonLd(id: string, data: JsonLd | null) {
  const existing = document.getElementById(id)
  if (!data) {
    existing?.remove()
    return
  }
  let script = existing as HTMLScriptElement | null
  if (!script) {
    script = document.createElement('script')
    script.id = id
    script.type = 'application/ld+json'
    document.head.appendChild(script)
  }
  script.textContent = JSON.stringify(data)
}

const ORIGIN = typeof window !== 'undefined' ? window.location.origin : ''

export interface SeoInput {
  title: string
  description?: string
  path?: string
  jsonLd?: JsonLd | JsonLd[] | null
}

export function useSeo({ title, description, path, jsonLd }: SeoInput) {
  useEffect(() => {
    const fullTitle = title.includes('Forge') ? title : `${title} · Forge`
    document.title = fullTitle
    if (description) {
      upsertMeta('name', 'description', description)
      upsertMeta('property', 'og:description', description)
      upsertMeta('name', 'twitter:description', description)
    }
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('name', 'twitter:title', fullTitle)
    if (path) {
      upsertMeta('property', 'og:url', `${ORIGIN}${path}`)
    }
    if (jsonLd !== undefined) {
      const list = Array.isArray(jsonLd) ? jsonLd : [jsonLd]
      list.forEach((data, i) => upsertJsonLd(`forge-jsonld-${i}`, data))
      for (let i = list.length; i < 8; i++) upsertJsonLd(`forge-jsonld-${i}`, null)
    }
  }, [title, description, path, jsonLd])
}

export function softwareApplicationLd(app: {
  id: string
  name: string
  tagline: string
  category: string
  developer: string
  version: string
  rating: number
  ratingCount: number
  demoId?: string
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: app.name,
    applicationCategory: app.category,
    operatingSystem: 'Web',
    description: app.tagline,
    softwareVersion: app.version,
    author: { '@type': 'Organization', name: app.developer },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    ...(app.demoId
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: app.rating.toFixed(1),
            ratingCount: app.ratingCount,
            bestRating: '5',
          },
        }
      : {}),
  }
}
