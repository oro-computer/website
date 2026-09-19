import { writeClipboard } from './clipboard.ts'

export function initCodeCopy(root: ParentNode = document): void {
  for (const button of root.querySelectorAll<HTMLButtonElement>('[data-copy-code]')) {
    if (button.dataset.copyInit === 'true') continue
    button.dataset.copyInit = 'true'
    button.addEventListener('click', async () => {
      const code = button.closest('[data-code-block]')?.querySelector('pre code')
      const ok = await writeClipboard(code?.textContent)
      const previousLabel = button.getAttribute('aria-label') || 'Copy code'
      button.dataset.copyState = ok ? 'copied' : 'failed'
      button.setAttribute('aria-label', ok ? 'Copied' : 'Copy failed')
      setTimeout(() => {
        delete button.dataset.copyState
        button.setAttribute('aria-label', previousLabel)
      }, 1100)
    })
  }
}

let tabInstance = 0

function activateTab(
  set: HTMLElement,
  tabs: HTMLElement[],
  panels: HTMLElement[],
  next: number,
  { focus = false } = {},
): void {
  if (next < 0 || next >= tabs.length) return
  for (let i = 0; i < tabs.length; i += 1) {
    const on = i === next
    tabs[i].setAttribute('aria-selected', String(on))
    tabs[i].tabIndex = on ? 0 : -1
    if (panels[i]) panels[i].hidden = !on
  }
  if (focus) tabs[next].focus()
  set.dataset.activeTab = String(next)
}

function getHashTargetId(): string | null {
  const raw = location.hash
  if (!raw || raw === '#') return null
  try {
    return decodeURIComponent(raw.slice(1))
  } catch {
    return raw.slice(1)
  }
}

function hashPanelIndex(set: HTMLElement, panels: HTMLElement[]): number {
  const targetId = getHashTargetId()
  if (!targetId) return -1
  const target = set.querySelector(`#${CSS.escape(targetId)}`)
  const panel = target?.closest<HTMLElement>('.tabs-panel')
  return panel ? panels.indexOf(panel) : -1
}

function initTabSet(set: HTMLElement): void {
  if (set.dataset.tabsInit === 'true') return
  const tabList = set.querySelector('.tabs-list')
  const tabs = [...set.querySelectorAll<HTMLElement>('.tabs-tab')]
  const panels = [...set.querySelectorAll<HTMLElement>('.tabs-panel')]
  if (!tabList || !tabs.length || !panels.length) return

  const prefix = set.dataset.tabsId || `tabs-${++tabInstance}`
  set.dataset.tabsId = prefix
  tabList.setAttribute('role', 'tablist')
  tabList.setAttribute('aria-orientation', 'horizontal')

  for (let i = 0; i < tabs.length; i += 1) {
    const tab = tabs[i]
    const panel = panels[i]
    tab.setAttribute('role', 'tab')
    tab.id ||= `${prefix}-tab-${i}`
    if (panel) {
      panel.setAttribute('role', 'tabpanel')
      panel.id ||= `${prefix}-panel-${i}`
      tab.setAttribute('aria-controls', panel.id)
      panel.setAttribute('aria-labelledby', tab.id)
    }
    tab.addEventListener('click', () => {
      activateTab(set, tabs, panels, i, { focus: true })
    })
    tab.addEventListener('keydown', (event) => {
      let next = -1
      if (event.key === 'ArrowRight') next = (i + 1) % tabs.length
      else if (event.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length
      else if (event.key === 'Home') next = 0
      else if (event.key === 'End') next = tabs.length - 1
      else if (event.key === 'Enter' || event.key === ' ') next = i
      if (next === -1) return
      event.preventDefault()
      activateTab(set, tabs, panels, next, { focus: true })
    })
  }

  let active = tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true')
  if (active === -1) active = 0
  const hashIndex = hashPanelIndex(set, panels)
  if (hashIndex !== -1) active = hashIndex
  activateTab(set, tabs, panels, active)
  set.dataset.tabsInit = 'true'
}

export function initTabs(root: ParentNode = document): void {
  for (const set of root.querySelectorAll<HTMLElement>('[data-tabs]')) initTabSet(set)
}

function revealHashTab(): void {
  for (const set of document.querySelectorAll<HTMLElement>("[data-tabs][data-tabs-init='true']")) {
    const tabs = [...set.querySelectorAll<HTMLElement>('.tabs-tab')]
    const panels = [...set.querySelectorAll<HTMLElement>('.tabs-panel')]
    const index = hashPanelIndex(set, panels)
    if (index !== -1) activateTab(set, tabs, panels, index)
  }
}

let listening = false
export function initLearn(root: ParentNode = document): void {
  initCodeCopy(root)
  initTabs(root)
  if (!listening) {
    addEventListener('hashchange', revealHashTab)
    listening = true
  }
}
