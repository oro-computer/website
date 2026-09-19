import type { LayoutFunction } from '@domstack/static/types.js'
import { html, raw, render } from 'fragtml'
export const parentLayout = 'root'
export const vars = { bodyClass: 'site-dark blog-page', product: 'blog', footerLabel: 'Oro Computer Blog' }
const layout: LayoutFunction<Record<string, unknown>, string> = ({ children }) => render(html`<main id="main" class="blog-main"><div class="blog-column">${raw(children)}</div></main>`)
export default layout
