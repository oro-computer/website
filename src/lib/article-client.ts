import { writeClipboard } from './clipboard.js'
export function enhanceArticle(app: HTMLElement): void {
  for (const pre of app.querySelectorAll('pre')) {
    const code = pre.querySelector('code')
    if (!code) continue
    const wrapper = document.createElement('div')
    wrapper.className = 'docs-code'
    wrapper.dataset.codeBlock = 'true'
    pre.before(wrapper)
    wrapper.append(pre)
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'learn-copy'
    button.setAttribute('aria-label', 'Copy code')
    button.addEventListener('click', async () => {
      const ok = await writeClipboard(code.textContent)
      button.dataset.copyState = ok ? 'copied' : 'failed'
      button.setAttribute('aria-label', ok ? 'Copied' : 'Copy failed')
      setTimeout(() => {
        delete button.dataset.copyState
        button.setAttribute('aria-label', 'Copy code')
      }, 1100)
    })
    wrapper.prepend(button)
  }
  const links = [
    ...app.querySelectorAll<HTMLAnchorElement>('.docs-toc-list a,.spec-toc a'),
  ]
  if ('IntersectionObserver' in globalThis) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting)
        if (!visible) return
        for (const link of links) {
          const active = link.hash === '#' + visible.target.id
          link.dataset.active = String(active)
          if (active) link.setAttribute('aria-current', 'location')
          else link.removeAttribute('aria-current')
        }
      },
      { rootMargin: '-15% 0px -65% 0px' },
    )
    for (const heading of app.querySelectorAll(
      '.prose h2,.prose h3,.prose h4,.prose h5',
    ))
      observer.observe(heading)
  }
}
