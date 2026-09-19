import { html, render } from 'fragtml'
import type { LayoutFunction } from '@domstack/static/types.js'
import type {} from './root.layout.ts'
export const parentLayout = 'root'
const redirect: LayoutFunction<{ redirect: string }, string> = ({ vars }) =>
  render(
    html`<main id="main">
      <p>
        This page has moved.
        <a data-redirect href="${vars.redirect}">Continue to the page</a>.
      </p>
    </main>`,
  )
export default redirect

declare module '@domstack/static/types.js' {
  interface LayoutRegistry {
    redirect: typeof import('./redirect.layout.ts') & { render: typeof redirect }
  }
}
