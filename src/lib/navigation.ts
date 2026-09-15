import { html, render } from 'fragtml'
export const names: Record<string, string> = {
  runtime: 'Runtime',
  silk: 'Silk',
  virtnosis: 'Virtnosis',
  sage: 'Sage',
  slg: 'slg',
}
export function header(product: string, route: string, wide: boolean): string {
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
              ]
            : []),
      ]
    : []
  const activeSubnav = sub
    .filter(([text, url]) => route === url || (text !== 'Overview' && route.startsWith(url)))
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
              ['Virtnosis', '/virtnosis/'],
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
export function footer(label: string, editorial: boolean): string {
  return render(
    editorial
      ? html`<footer class="site-footer editorial-footer">
          <div class="editorial-footer-contact">
            <span>Keep up to date</span
            ><a href="mailto:info@oro.computer">info@oro.computer</a>
          </div>
          <div class="editorial-footer-links" aria-label="Oro links">
            <a href="https://github.com/oro-computer">github</a
            ><a href="https://github.com/oro-computer/runtime">runtime</a
            ><a href="mailto:contributors@oro.computer">contributors</a>
          </div>
          <div class="editorial-footer-links">
            <a href="/docs/">Docs</a
            ><span>© <span data-year>2026</span> Oro Computer</span>
          </div>
        </footer>`
      : html`<footer class="site-footer">
          <div class="container">
            <div class="footer-inner">
              <strong>${label || 'Oro Computer'}</strong
              ><span>© <span data-year>2026</span> Oro Computer.</span>
            </div>
          </div>
        </footer>`,
  )
}
