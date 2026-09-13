import { load } from 'cheerio'
import { highlight } from '../lib/markdown.ts'
import { html, raw, render } from 'fragtml'
import type { LayoutFunction } from '@domstack/static/types.js'
import { header, footer } from '../lib/navigation.ts'
import { collections, type Collection } from '../lib/collections.ts'
const root: LayoutFunction<Record<string, any>, string> = ({
  vars: v,
  children,
  page,
  scripts = [],
  styles = [],
}) => {
  const collection = v.docsCollection
    ? collections[v.docsCollection as Collection]
    : undefined
  const editorial = (v.bodyClass || '').includes('editorial-layout')
  const product = collection?.product || v.product || ''
  const title = collection
    ? `${v.title} · ${v.layout === 'spec' ? 'Silk Spec' : collection.title} · Oro Computer`
    : v.title
  if (!collection && children.includes('<pre')) {
    const $ = load(children, {}, false)
    $('pre code').each((_i, el) => {
      const language = $(el)
        .attr('class')
        ?.match(/language-([\w+-]+)/)?.[1]
      if (language) {
        const highlighted = highlight($(el).text(), language)
        if (highlighted) $(el).html(highlighted).addClass('hljs')
      }
    })
    children = $.html()
  }
  const canonical = new URL(v.redirect || page.url, v.siteUrl).href
  return render(
    html`<!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${title}</title>
          <meta name="description" content="${v.description || ''}" />
          <meta name="theme-color" content="#FAF8F4" />
          <link rel="canonical" href="${canonical}" />
          <meta property="og:title" content="${title}" />
          <meta property="og:description" content="${v.description || ''}" />
          <meta property="og:url" content="${canonical}" />
          <meta property="og:type" content="website" />
          <meta
            property="og:image"
            content="https://oro.computer/docs/branding/assets/logo-full.png"
          />
          <meta name="twitter:card" content="summary" />
          <link
            rel="icon"
            type="image/png"
            href="/docs/branding/assets/logo-icon-small.png"
            sizes="32x32"
          />
          ${styles.map(
            (url) => html`<link rel="stylesheet" href="${url}" />`,
          )}${scripts.map(
            (url) => html`<script type="module" src="${url}"></script>`,
          )}
          ${v.redirect
            ? html`<noscript
                ><meta http-equiv="refresh" content="0;url=${v.redirect}"
              /></noscript>`
            : null}
        </head>
        <body
          class="${v.bodyClass ||
          (collection
            ? `site-dark docs-page ${product}-${v.layout === 'spec' ? 'spec' : 'docs'}-page`
            : '')}"
          ${v.bodyAttrs?.['data-ask-ai'] ? html`data-ask-ai="true"` : null}
        >
          <a class="skip-link" href="#main">Skip to content</a>${raw(
            header(product, page.url, editorial),
          )}${raw(children)}${raw(
            footer(v.footerLabel || collection?.title || '', editorial),
          )}
        </body>
      </html>`,
  )
}
export default root
