import { html, render } from 'fragtml'
import type { LayoutFunction } from '@domstack/static/types.js'
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
