import { initSiteSearch } from '#lib/search-client.ts'
import { initRuntimeRelease } from '#lib/runtime-release-client.ts'

initSiteSearch()
void initRuntimeRelease()

const yearNode = document.querySelector('[data-year]')
if (yearNode) yearNode.textContent = String(new Date().getFullYear())

// Header wrapping and Ask AI enhancement can change its height after first paint.
const siteHeader = document.querySelector<HTMLElement>('.site-top')
if (siteHeader) {
  const updateOffset = () => {
    const sticky = getComputedStyle(siteHeader).position === 'sticky'
    document.documentElement.style.setProperty(
      '--site-top-offset', `${sticky ? siteHeader.getBoundingClientRect().height : 0}px`,
    )
  }
  updateOffset()
  new ResizeObserver(updateOffset).observe(siteHeader)
  addEventListener('resize', updateOffset)
}
