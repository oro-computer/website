import { writeClipboard } from './clipboard.ts'

function siteRoot(): URL {
  const brand = document.querySelector<HTMLAnchorElement>('a.brand[href]')
  return new URL(brand?.href || './', location.href)
}

function llmsUrl(): string {
  const product = ['silk', 'runtime', 'sage', 'slg', 'virtnosis'].find((name) =>
    location.pathname.includes(`/${name}/`) || location.pathname.endsWith(`/${name}`),
  )
  return new URL(product ? `${product}/llms.txt` : 'llms.txt', siteRoot()).href
}

function pageMarkdownUrl(): string {
  const source = document.querySelector<HTMLElement>('[data-markdown]')
  return source?.dataset.markdown
    ? new URL(source.dataset.markdown, location.href).href
    : ''
}

export function initAskAiMenu(): void {
  const body = document.body
  if (body.dataset.askAi !== 'true' &&
      !body.classList.contains('docs-page') &&
      !body.classList.contains('docs-landing-page') &&
      !/(^|\/)docs(\/|$)/.test(location.pathname)) return

  const nav = document.querySelector('.nav')
  const header = nav?.closest<HTMLElement>('.site-header')
  if (!nav || !header || nav.querySelector('[data-ask-ai]')) return

  const menu = document.createElement('div')
  menu.className = 'menu ask-ai-menu'
  menu.dataset.askAi = 'true'
  const trigger = document.createElement('button')
  trigger.className = 'button button-quiet menu-trigger'
  trigger.type = 'button'
  trigger.textContent = 'Ask AI'
  trigger.setAttribute('aria-expanded', 'false')
  trigger.setAttribute('aria-controls', 'ask-ai-panel')
  menu.append(trigger)

  const panel = document.createElement('div')
  panel.className = 'menu-panel ask-ai-panel'
  panel.id = 'ask-ai-panel'
  panel.hidden = true

  function labelItem(item: HTMLAnchorElement | HTMLButtonElement, label: string, hint: string): void {
    item.className = 'menu-item'
    const left = document.createElement('span')
    left.textContent = label
    const right = document.createElement('small')
    right.textContent = hint
    item.append(left, right)
  }
  function link(label: string, hint: string): HTMLAnchorElement {
    const item = document.createElement('a')
    item.target = '_blank'
    item.rel = 'noreferrer'
    labelItem(item, label, hint)
    return item
  }
  function separator(): HTMLDivElement {
    const item = document.createElement('div')
    item.className = 'menu-sep'
    return item
  }

  const chatgpt = link('ChatGPT', 'New tab')
  const claude = link('Claude', 'New tab')
  const viewMd = link('View Markdown', 'Raw')
  viewMd.dataset.askAiViewMarkdown = 'true'
  const copyMd = document.createElement('button')
  copyMd.type = 'button'
  copyMd.dataset.askAiCopyMarkdown = 'true'
  labelItem(copyMd, 'Copy Markdown', 'Clipboard')
  const llms = link('Open llms.txt', 'Pack')
  const hint = document.createElement('div')
  hint.className = 'menu-hint'
  hint.textContent = 'Uses page Markdown when available.'
  panel.append(chatgpt, claude, separator(), viewMd, copyMd, separator(), llms, hint)

  // A sibling of the scrolling nav cannot be clipped by its overflow boundary.
  header.append(panel)
  const primary = nav.querySelector('.button.button-primary')
  if (primary?.parentElement === nav) nav.insertBefore(menu, primary)
  else nav.append(menu)

  function updateMenu(): void {
    const markdown = pageMarkdownUrl()
    const target = markdown || location.href
    const prompt = (name: string) =>
      `Hi ${name}! Can you please read [this page](${target}) and prepare to answer questions about it?`
    chatgpt.href = `https://chatgpt.com/?${new URLSearchParams({ prompt: prompt('ChatGPT') })}`
    claude.href = `https://claude.ai/new?${new URLSearchParams({ q: prompt('Claude') })}`
    llms.href = llmsUrl()
    viewMd.hidden = copyMd.hidden = !markdown
    if (markdown) viewMd.href = markdown
  }

  copyMd.addEventListener('click', async () => {
    const url = pageMarkdownUrl()
    if (!url) return
    let text = ''
    try {
      const response = await fetch(url)
      if (response.ok) text = await response.text()
    } catch {}
    const ok = await writeClipboard(text)
    const label = copyMd.querySelector('small')!
    label.textContent = ok ? 'Copied' : 'Failed'
    setTimeout(() => { label.textContent = 'Clipboard' }, 900)
  })

  function positionPanel(): void {
    const anchor = trigger.getBoundingClientRect()
    const bounds = header!.getBoundingClientRect()
    const width = panel.getBoundingClientRect().width
    const left = Math.max(8, Math.min(anchor.right - width, innerWidth - width - 8))
    panel.style.left = `${left - bounds.left}px`
    panel.style.top = `${anchor.bottom - bounds.top + 10}px`
  }
  function setOpen(open: boolean, focus = false): void {
    panel.hidden = !open
    trigger.setAttribute('aria-expanded', String(open))
    if (open) {
      updateMenu()
      positionPanel()
      if (focus) chatgpt.focus()
    }
  }
  function dismissOutside(event: Event): void {
    if (event.target instanceof Node && !menu.contains(event.target) && !panel.contains(event.target)) {
      setOpen(false)
    }
  }
  trigger.addEventListener('click', () => setOpen(Boolean(panel.hidden)))
  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || (event.key === 'Tab' && !event.shiftKey && !panel.hidden)) {
      event.preventDefault()
      setOpen(true, true)
    }
  })
  panel.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('a.menu-item')) setOpen(false)
  })
  panel.addEventListener('keydown', (event) => {
    if (event.key === 'Tab' && event.shiftKey && event.target === chatgpt) {
      event.preventDefault()
      trigger.focus()
    }
  })
  document.addEventListener('click', dismissOutside)
  document.addEventListener('focusin', dismissOutside)
  document.addEventListener('keydown', (event) => {
    if (!panel.hidden && event.key === 'Escape') {
      setOpen(false)
      trigger.focus()
    }
  })
  nav.addEventListener('scroll', () => { if (!panel.hidden) positionPanel() })
  addEventListener('resize', () => { if (!panel.hidden) positionPanel() })
  updateMenu()
}
