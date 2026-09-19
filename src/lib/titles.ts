import MarkdownIt from 'markdown-it'
import { load } from 'cheerio'

const parser = new MarkdownIt({ html: true })

/** Convert an inline Markdown title to text for navigation and document metadata. */
export function plainTitle(value: string): string {
  const $ = load(parser.renderInline(value), {}, false)
  $('img').each((_index, image) => {
    $(image).replaceWith($('<span>').text($(image).attr('alt') || ''))
  })
  return $.text().replace(/\s+/g, ' ').trim()
}

export function titleFromMarkdown(markdown: string): string {
  const tokens = parser.parse(markdown, {})
  const index = tokens.findIndex(token => token.type === 'heading_open' && token.tag === 'h1')
  return index < 0 ? '' : plainTitle(tokens[index + 1].content)
}
