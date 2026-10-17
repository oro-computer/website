import { themeStorageKey } from './theme.ts'

export function initTheme(): void {
  const control = document.querySelector<HTMLButtonElement>('[data-theme-toggle]')
  if (!control) return
  const root = document.documentElement
  const system = matchMedia('(prefers-color-scheme: dark)')
  const valid = (value: string | null | undefined) => value === 'light' || value === 'dark' ? value : 'system'
  let preference = valid(root.dataset.theme)
  const isDark = () => preference === 'dark' || (preference === 'system' && system.matches)
  const apply = (value: string) => {
    preference = valid(value)
    if (preference === 'system') delete root.dataset.theme
    else root.dataset.theme = preference
    const dark = isDark()
    const next = dark ? 'light' : 'dark'
    const label = `Switch to ${next} theme`
    control.setAttribute('aria-label', label)
    control.title = label
    control.querySelectorAll<SVGElement>('[data-theme-icon]').forEach(icon => {
      icon.toggleAttribute('hidden', icon.dataset.themeIcon !== next)
    })
    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach(meta => {
      meta.content = dark ? '#11100F' : '#FAF8F4'
    })
  }
  apply(preference)
  control.hidden = false
  control.addEventListener('click', () => {
    apply(isDark() ? 'light' : 'dark')
    try {
      localStorage.setItem(themeStorageKey, preference)
    } catch {
      // A theme choice still works for this page when storage is unavailable.
    }
  })
  system.addEventListener('change', () => apply(preference))
  addEventListener('storage', event => {
    if (event.key === themeStorageKey || event.key === null) apply(valid(event.newValue))
  })
}
