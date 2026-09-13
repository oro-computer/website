/** The static sidebar remains usable when scripting is unavailable. */
export function enhanceSidebar(app: HTMLElement): void {
  const sidebar = app.querySelector<HTMLElement>('.docs-sidebar')!
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'button button-quiet docs-sidebar-toggle'
  button.textContent = 'Browse documentation'
  button.setAttribute('aria-expanded', 'false')
  const nav = sidebar.querySelector<HTMLElement>('nav')!
  nav.id = 'documentation-navigation'
  nav.tabIndex = 0
  button.setAttribute('aria-controls', nav.id)
  sidebar.prepend(button)
  sidebar.dataset.collapsed = 'true'
  button.addEventListener('click', () => {
    const expanded = sidebar.dataset.collapsed === 'true'
    sidebar.dataset.collapsed = String(!expanded)
    button.setAttribute('aria-expanded', String(expanded))
  })
  sidebar.querySelector('input')?.addEventListener('input', () => {
    sidebar.dataset.collapsed = 'false'
    button.setAttribute('aria-expanded', 'true')
  })
}
