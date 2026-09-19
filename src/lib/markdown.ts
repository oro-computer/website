import MarkdownIt from 'markdown-it'
import alerts from 'markdown-it-github-alerts'
import hljs, { type LanguageFn } from 'highlight.js'
import silk from './silk.ts'
import toml from './toml.ts'
import zig from './zig.ts'
for (const [name, language] of Object.entries({ silk, toml, zig }))
  hljs.registerLanguage(name, language as LanguageFn)
// Match the previous marked renderer's anchor algorithm, including duplicate suffixes.
export function slug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/<[!\/a-z].*?>/gi, '')
    .replace(
      /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g,
      '',
    )
    .replace(/\s/g, '-')
}
// Own the complete plugin set rather than inheriting DOMStack's defaults:
// GitHub alerts and the legacy heading IDs are the site's compatibility contract.
// Keep MarkdownIt's default tables/strikethrough, HTML and linkification; do not
// add anchor, emoji, task-list or typography plugins that change existing output.
export function markdown() {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    highlight(code, lang) {
      return lang ? highlight(code, lang) || '' : ''
    },
  })
  md.use(alerts)
  md.core.ruler.push('oro-heading-ids', (state) => {
    const used = new Set<string>()
    for (let i = 0; i < state.tokens.length; i++) {
      const token = state.tokens[i]
      if (token.type !== 'heading_open') continue
      const inline = state.tokens[i + 1]
      const text = (inline.children || [])
        .map((t) => (t.type === 'html_inline' ? '' : t.content))
        .join('')
      const base = slug(text)
      let id = base
      let n = 0
      while (used.has(id)) id = `${base}-${++n}`
      used.add(id)
      token.attrSet('id', id)
    }
  })
  return md
}

export function highlight(code: string, language: string): string | undefined {
  return hljs.getLanguage(language)
    ? hljs.highlight(code, { language, ignoreIllegals: true }).value
    : undefined
}
