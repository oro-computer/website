export interface SearchEntry {
  url: string
  title: string
  summary: string
  section: string
  text: string
}
export interface SiteSearchData { siteSearch: { items: SearchEntry[] } }

export function prepareSearch(items: SearchEntry[]) {
  return items.filter(item =>
    ['url', 'title', 'summary', 'section', 'text'].every(key => typeof item[key as keyof SearchEntry] === 'string') &&
    /^\/(?!\/)/.test(item.url) && !/[\\\s]/.test(item.url),
  ).map(item => ({
    item,
    title: item.title.toLocaleLowerCase('en'),
    summary: item.summary.toLocaleLowerCase('en'),
    haystack: `${item.title} ${item.summary} ${item.section} ${item.text}`.toLocaleLowerCase('en'),
  }))
}

export function searchPages(index: ReturnType<typeof prepareSearch>, query: string, limit = 12): SearchEntry[] {
  const phrase = query.toLocaleLowerCase('en').trim().replace(/\s+/g, ' ')
  if (!phrase) return []
  const terms = phrase.split(' ')
  const meaningful = terms.filter(term => !['silk', 'runtime', 'docs', 'wiki', 'blog'].includes(term))
  const rankedTerms = meaningful.length ? meaningful : terms
  const rankedPhrase = rankedTerms.join(' ')
  return index.flatMap(entry => {
    if (!terms.every(term => entry.haystack.includes(term))) return []
    const score = (entry.title === rankedPhrase ? 1000 : entry.title.startsWith(rankedPhrase) ? 500 : entry.title.includes(rankedPhrase) ? 250 : 0) +
      rankedTerms.reduce((sum, term) => sum + (entry.title.includes(term) ? 40 : entry.summary.includes(term) ? 10 : 1), 0)
    return [{ item: entry.item, score }]
  }).sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, 'en') || a.item.url.localeCompare(b.item.url, 'en'))
    .slice(0, limit).map(result => result.item)
}
