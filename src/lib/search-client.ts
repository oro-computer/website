import { prepareSearch, searchPages, type SearchEntry } from './search.ts'

export function initSiteSearch() {
  const dialog = document.querySelector<HTMLDialogElement>('#site-search')
  const trigger = document.querySelector<HTMLButtonElement>('.site-search-trigger')
  if (!dialog || !trigger || typeof dialog.showModal !== 'function') return
  const input = dialog.querySelector<HTMLInputElement>('input')!
  const list = dialog.querySelector<HTMLUListElement>('[role=listbox]')!
  const label = dialog.querySelector<HTMLElement>('.site-search-label')!
  const message = dialog.querySelector<HTMLElement>('.site-search-message')!
  const status = dialog.querySelector<HTMLElement>('[role=status]')!
  const retry = dialog.querySelector<HTMLButtonElement>('.site-search-retry')!
  const mac = /Mac|iPhone|iPad|iPod/.test(navigator.platform)
  trigger.querySelector('kbd')!.textContent = mac ? '⌘ K' : 'Ctrl K'
  trigger.setAttribute('aria-keyshortcuts', mac ? 'Meta+K' : 'Control+K')
  trigger.hidden = false
  let previousFocus: HTMLElement | null = null
  let index: ReturnType<typeof prepareSearch> | undefined
  let pending: Promise<void> | undefined
  let failed = false
  let selected = 0
  let links: HTMLAnchorElement[] = []
  const quickLinks: SearchEntry[] = [
    { url: '/runtime/docs/', title: 'Runtime documentation', section: 'Runtime', summary: 'Build native applications with web technologies.', text: '' },
    { url: '/silk/docs/', title: 'Silk documentation', section: 'Silk', summary: 'Explore the language, compiler, and standard library.', text: '' },
    { url: '/silk/wiki/', title: 'Silk wiki', section: 'Silk', summary: 'Concepts, examples, and practical guides.', text: '' },
    { url: '/blog/', title: 'From the team', section: 'Blog', summary: 'Ideas and updates from Oro Computer.', text: '' },
  ]
  function select(next: number, scroll = false) {
    selected = next
    links.forEach((link, i) => link.setAttribute('aria-selected', String(i === next)))
    if (links[next]) {
      input.setAttribute('aria-activedescendant', links[next].id)
      if (scroll) links[next].scrollIntoView({ block: 'nearest' })
    } else input.removeAttribute('aria-activedescendant')
  }
  function render() {
    if (!dialog!.open) return
    const query = input.value.trim()
    const results = query ? (index ? searchPages(index, query) : []) : quickLinks
    label.textContent = query ? 'Results' : 'Quick links'
    list.replaceChildren()
    links = results.map((result, i) => {
      const li = document.createElement('li')
      li.setAttribute('role', 'none')
      const link = document.createElement('a')
      link.href = result.url
      link.id = `site-search-result-${i}`
      link.tabIndex = -1
      link.setAttribute('role', 'option')
      const heading = document.createElement('span')
      heading.className = 'site-search-result-heading'
      const title = document.createElement('span')
      title.className = 'site-search-result-title'
      title.textContent = result.title
      const section = document.createElement('span')
      section.className = 'site-search-result-section'
      section.textContent = result.section
      heading.append(title, section)
      const summary = document.createElement('span')
      summary.className = 'site-search-result-summary'
      summary.textContent = result.summary
      link.append(heading, summary)
      link.addEventListener('pointermove', () => select(i))
      li.append(link)
      list.append(li)
      return link
    })
    select(0)
    const error = Boolean(query && failed)
    message.hidden = results.length > 0
    message.textContent = error ? 'Search couldn’t load. Please try again.' : !index ? 'Loading search…' : `No results for “${query}”. Try a different word or a shorter phrase.`
    retry.hidden = !error
    list.setAttribute('aria-busy', String(Boolean(query && !index && !failed)))
    status.textContent = query ? error ? 'Search unavailable' : !index ? 'Loading search' : `${results.length === 12 ? 'Top ' : ''}${results.length} result${results.length === 1 ? '' : 's'}` : 'Search across Oro Computer'
  }
  function loadIndex() {
    if (index || pending) return
    failed = false
    pending = (async () => {
      try {
        const response = await fetch('/search.json')
        if (!response.ok) throw new Error('Search unavailable')
        const data: unknown = await response.json()
        if (!data || typeof data !== 'object' || !('items' in data) || !Array.isArray(data.items)) throw new Error('Invalid search index')
        index = prepareSearch(data.items.filter(item => item && typeof item === 'object'))
      } catch { failed = true }
      finally { pending = undefined; render() }
    })()
    render()
  }
  function open() {
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    input.value = ''
    dialog!.showModal()
    document.documentElement.classList.add('site-search-open')
    render()
    input.focus({ preventScroll: true })
    loadIndex()
  }
  trigger.addEventListener('click', open)
  dialog.querySelector('.site-search-close')!.addEventListener('click', () => dialog.close())
  dialog.addEventListener('close', () => {
    if (dialog.open) return
    document.documentElement.classList.remove('site-search-open')
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
  })
  dialog.addEventListener('keydown', event => {
    // Search inputs can consume Escape to clear their value before the dialog
    // receives its native cancel action. Always dismiss in a single key press.
    if (event.key === 'Escape' && !event.isComposing) {
      event.preventDefault()
      event.stopPropagation()
      dialog.close()
      return
    }
    if (event.key !== 'Tab') return
    const controls = [input, ...dialog.querySelectorAll<HTMLButtonElement>('button:not([hidden])')]
    const first = controls[0]
    const last = controls.at(-1)!
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  })
  dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect()
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close()
  })
  retry.addEventListener('click', () => { input.focus(); loadIndex() })
  input.addEventListener('input', render)
  input.addEventListener('keydown', event => {
    if (event.isComposing) return
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (links.length) select((selected + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length, true)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      links[selected]?.click()
    }
  })
  document.addEventListener('keydown', event => {
    if ((event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && !event.isComposing && event.key.toLowerCase() === 'k') {
      event.preventDefault()
      if (!event.repeat) dialog.open ? dialog.close() : open()
    }
  })
}
