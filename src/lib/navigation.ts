import { html, render } from 'fragtml'

export const names: Record<string, string> = {
  runtime: 'Runtime',
  silk: 'Silk',
}

export function header(
  product: string,
  route: string,
  wide: boolean,
): string {
  const label = names[product]
  const sub = label
    ? [
        ['Overview', `/${product}/`],
        ...(['runtime', 'silk'].includes(product)
          ? [['Learn', `/${product}/learn/`]]
          : []),
        ['Docs', `/${product}/docs/`],
        ...(product === 'silk'
          ? [
              ['Spec', '/silk/spec/2026/'],
              ['Wiki', '/silk/wiki/'],
            ]
          : product === 'runtime'
            ? [
                ['JavaScript APIs', '/runtime/docs/javascript/overview/'],
                ['CLI', '/runtime/docs/cli/oroc/'],
                ['Download', 'https://www.npmjs.com/package/@oro-computer/runtime'],
              ]
            : []),
      ]
    : []
  const activeSubnav = sub
    .filter(
      ([text, url]) =>
        route === url || (text !== 'Overview' && route.startsWith(url)),
    )
    .sort((a, b) => b[1].length - a[1].length)[0]?.[1]
  return render(
    html`<header class="site-top" id="top">
      <div class="${wide ? 'container container-wide' : 'container'}">
        <div class="site-header">
          <a class="brand" href="/"
            ><img
              class="brand-mark"
              src="/docs/branding/assets/logo-icon.png"
              alt="Oro Computer logo"
              width="32"
              height="32"
            /><span class="brand-name">oro</span></a
          >
          <nav class="nav" aria-label="Primary navigation">
            ${[
              ['Runtime', '/runtime/'],
              ['Silk', '/silk/'],
              ['Blog', '/blog/'],
              ['Docs', '/docs/'],
              ['Contact', 'mailto:info@oro.computer'],
            ].map(
              ([text, url]) =>
                html`<a
                  href="${url}"
                  ${route.startsWith(url) ? html`aria-current="page"` : null}
                  >${text}</a
                >`,
            )}
            <button type="button" class="site-search-trigger" aria-label="Search site" aria-haspopup="dialog" aria-controls="site-search" hidden>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>
              <span>Search</span><kbd aria-hidden="true">Ctrl K</kbd>
            </button>
          </nav>
          ${label
            ? html`<div
                class="site-subnav"
                aria-label="${label} section navigation"
              >
                <div class="site-subnav-label">Inside</div>
                <div class="site-subnav-parent">${label}</div>
                <nav class="site-subnav-links" aria-label="${label} pages">
                  ${sub.map(
                    ([text, url]) =>
                      html`<a
                        href="${url}"
                        ${url === activeSubnav
                          ? html`aria-current="page"`
                          : null}
                        >${text}</a
                      >`,
                  )}
                </nav>
              </div>`
            : null}
        </div>
      </div>
    </header>`,
  )
}

export function footer(editHref?: string): string {
  return render(html`<footer class="site-footer">
    <div class="container">
      <div class="footer-top">
        <div><a class="footer-wordmark" href="/">oro<span>computer</span></a><p>Open tools. Native possibilities.</p></div>
        <nav aria-label="Technology links"><a href="/runtime/">Oro Runtime</a><a href="/silk/">Silk</a><a href="/docs/">Documentation</a><a href="/blog/">Blog</a></nav>
        <nav aria-label="Community links"><a href="https://github.com/oro-computer">GitHub ↗</a><a href="mailto:info@oro.computer">Get in touch ↗</a><a href="mailto:contributors@oro.computer">Contribute ↗</a></nav>
      </div>
      <div class="footer-meta"><span>© <span data-year>2026</span> Oro Computer</span>${editHref ? html`<a class="page-edit" href="${editHref}">Edit this page</a>` : null}</div>
    </div>
  </footer>`)
}
