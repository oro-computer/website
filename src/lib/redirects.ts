import type { PageInfo } from '@domstack/static/types.js'

export type RedirectPage = {
  vars: Record<string, unknown>
  pageInfo: Pick<PageInfo, 'url'> & Partial<Pick<PageInfo, 'outputRelname'>> & {
    pageFile: Pick<PageInfo['pageFile'], 'relname'>
  }
}

export type Redirect = { from: string, to: string, source: string }

function validatePath(from: string): void {
  const invalid = () => new Error(`Invalid redirectFrom ${JSON.stringify(from)}: expected a safe same-origin URL path`)
  if (!from.startsWith('/') || from.startsWith('//')) throw invalid()
  let decoded: string
  try {
    decoded = decodeURIComponent(from)
  } catch {
    throw invalid()
  }
  // Reject encoded separators and nested escapes rather than relying on host decoding rules.
  if (/%(?:2f|5c|25)/i.test(from) || /[\s\p{Cc}?#\\]/u.test(decoded) ||
      decoded.includes('//') || decoded.split('/').some(part => part === '.' || part === '..')) {
    throw invalid()
  }
}

/** Convert a validated public alias to a relative static output name. */
export function redirectOutputName(from: string): string {
  validatePath(from)
  const relative = from.slice(1)
  return !relative || relative.endsWith('/') ? `${relative}index.html` : relative
}

/** Project source metadata only; no page bodies or rendering dependencies are needed. */
export function collectRedirects(pages: readonly RedirectPage[]): Redirect[] {
  const existingOutputs = new Map<string, string>()
  for (const { pageInfo } of pages) {
    // outputRelname is a filesystem name, not a percent-encoded URL.
    const output = pageInfo.outputRelname ?? decodeURIComponent(redirectOutputName(pageInfo.url))
    existingOutputs.set(output, pageInfo.pageFile.relname)
  }

  const owners = new Map<string, { from: string, source: string }>()
  const redirects: Redirect[] = []
  for (const { vars, pageInfo } of pages) {
    const aliases = vars.redirectFrom
    if (aliases === undefined) continue
    const source = pageInfo.pageFile.relname
    if (!Array.isArray(aliases)) throw new TypeError(`redirectFrom on ${JSON.stringify(source)} must be an array of strings`)
    for (const from of aliases) {
      if (typeof from !== 'string') throw new TypeError(`redirectFrom entries on ${JSON.stringify(source)} must be strings`)
      let output: string
      try {
        output = redirectOutputName(from)
      } catch (error) {
        throw new Error(`${(error as Error).message} on ${JSON.stringify(source)}`)
      }
      const outputKeys = [...new Set([output, decodeURIComponent(output)])]
      const owner = outputKeys.map(key => owners.get(key)).find(value => value !== undefined)
      if (owner) {
        throw new Error(`Duplicate redirectFrom ${JSON.stringify(from)} on ${JSON.stringify(source)}: ${JSON.stringify(owner.from)} on ${JSON.stringify(owner.source)} resolves to the same output ${JSON.stringify(output)}`)
      }
      const existing = outputKeys.map(key => existingOutputs.get(key)).find(value => value !== undefined)
      if (existing !== undefined) {
        throw new Error(`redirectFrom ${JSON.stringify(from)} on ${JSON.stringify(source)} collides with existing page ${JSON.stringify(existing)} at output ${JSON.stringify(output)}`)
      }
      for (const key of outputKeys) owners.set(key, { from, source })
      redirects.push({ from, to: pageInfo.url, source })
    }
  }
  return redirects.sort((a, b) => a.from < b.from ? -1 : a.from > b.from ? 1 : 0)
}
