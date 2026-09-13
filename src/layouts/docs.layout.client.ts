import { initAskAiMenu } from '../lib/ask-ai-client.ts'
import { legacyTarget } from '../lib/legacy.ts'
import { enhanceSidebar } from '../lib/sidebar-client.ts'
import { initLearn } from '../lib/learn-client.ts'
import { renderTabs } from '../lib/tabs.ts'
import { enhanceArticle } from '../lib/article-client.ts'
const app = document.querySelector<HTMLElement>('[data-docs-app]')
if (app) {
  const routes = document.querySelector('[data-legacy-routes]')
  const old = new URLSearchParams(location.search).get('p')
  if (routes && old) {
    const map: Record<string, string> = JSON.parse(routes.textContent || '{}')
    const target = legacyTarget(old, map)
    if (target) {
      const params = new URLSearchParams(location.search)
      params.delete('p')
      location.replace(
        target + (params.size ? '?' + params : '') + location.hash,
      )
    }
  }
  const content = app.querySelector<HTMLElement>('[data-docs-content]')!
  renderTabs(content)
  initLearn(content)
  enhanceArticle(app)
  enhanceSidebar(app)
  const input = app.querySelector<HTMLInputElement>('[data-docs-search]')!
  const nav = app.querySelector<HTMLElement>('[data-docs-nav]')!
  const results = app.querySelector<HTMLElement>('[data-docs-results]')!
  input.hidden = false
  type SearchDoc = { title: string; url: string; summary: string; text: string }
  let index: Promise<SearchDoc[]> | undefined
  let version = 0
  input.addEventListener('input', async () => {
    const current = ++version
    const terms = input.value.toLowerCase().trim().split(/\s+/).filter(Boolean)
    if (!terms.length) {
      nav.hidden = false
      results.hidden = true
      return
    }
    nav.hidden = true
    results.hidden = false
    results.textContent = 'Searching…'
    try {
      index ||= fetch(app.dataset.search!)
        .then((r) => {
          if (!r.ok) throw new Error('Search unavailable')
          return r.json()
        })
        .then((data) => data.items)
      const pending = index
      // Evict failures even when the query was cleared while fetching. An older
      // request must never evict a replacement cached by a later input event.
      void pending.catch(() => {
        if (index === pending) index = undefined
      })
      const docs = await pending
      if (current !== version) return
      const scored = docs
        .map((d) => ({
          d,
          score: terms.every((t) =>
            (d.title + ' ' + d.text).toLowerCase().includes(t),
          )
            ? terms.reduce(
                (n, t) => n + (d.title.toLowerCase().includes(t) ? 10 : 1),
                0,
              )
            : 0,
        }))
        .filter((d) => d.score)
        .sort((a, b) => b.score - a.score)
        .slice(0, 20)
      results.replaceChildren()
      if (!scored.length) results.textContent = 'No results.'
      for (const { d } of scored) {
        const a = document.createElement('a')
        a.className = 'docs-search-result'
        a.href = d.url
        const title = document.createElement('strong')
        title.className = 'docs-search-result-title'
        title.textContent = d.title
        const summary = document.createElement('p')
        summary.className = 'docs-search-result-summary'
        summary.textContent = d.summary
        a.append(title, summary)
        results.append(a)
      }
    } catch {
      if (current === version) {
        results.textContent =
          'Search is unavailable. Browse the navigation below.'
        nav.hidden = false
      }
    }
  })
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      input.value = ''
      input.dispatchEvent(new Event('input'))
    }
  })
}

// Native fragment navigation can run before a tab panel becomes visible.
function revealHashTarget() {
  if (!location.hash) return
  let id: string
  try { id = decodeURIComponent(location.hash.slice(1)) } catch { return }
  requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView())
}
revealHashTarget()
addEventListener('hashchange', revealHashTarget)

initAskAiMenu()
