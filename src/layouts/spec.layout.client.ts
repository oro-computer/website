import { initAskAiMenu } from '#lib/ask-ai-client.ts'
import { enhanceSidebar } from '#lib/sidebar-client.ts'
import { enhanceArticle } from '#lib/article-client.ts'
const app = document.querySelector<HTMLElement>('[data-spec-app]')
if (app) {
  enhanceArticle(app)
  enhanceSidebar(app)
  const input = app.querySelector<HTMLInputElement>('[data-spec-search]')!
  input.hidden = false
  input.addEventListener('input', () => {
    for (const item of app.querySelectorAll<HTMLElement>('[data-spec-toc] a'))
      item.hidden = !item.textContent
        ?.toLowerCase()
        .includes(input.value.toLowerCase().trim())
  })
  const p = new URLSearchParams(location.search).get('p')
  if (p && !/^spec\/2026(?:\.md)?$/.test(p))
    location.replace('/silk/docs/?p=' + encodeURIComponent(p) + location.hash)
}

initAskAiMenu()
