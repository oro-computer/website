import { html, render } from 'fragtml'
import type { LayoutFunction } from '@domstack/static/types.js'
import type {} from './root.layout.ts'

export const parentLayout = 'root'

const redirect: LayoutFunction<{ redirect: string }, string> = ({ vars }) =>
  render(
    html`
      <main id="main">
        <section class="section">
          <div class="container">
            <div class="prose">
              <h1>This page has moved</h1>
              <p>
                You should be redirected automatically. If that doesn’t happen,
                use the link below to continue.
              </p>
              <p>
                <a
                  class="button button-primary"
                  data-redirect
                  href="${vars.redirect}"
                >
                  Continue to the page
                </a>
              </p>
              <p>
                You can also <a href="/docs/">browse the documentation</a>
                or <a href="/">return to the homepage</a>.
              </p>
            </div>
          </div>
        </section>
      </main>
    `,
  )

export default redirect

declare module '@domstack/static/types.js' {
  interface LayoutRegistry {
    redirect: {
      parentLayout: typeof parentLayout
      render: typeof redirect
    }
  }
}
