import type * as root from './root.layout.ts'
import type * as marketing from './marketing.layout.ts'
import type * as product from './product.layout.ts'
import type * as learn from './learn.layout.ts'
import type * as redirect from './redirect.layout.ts'
import type * as docs from './docs.layout.ts'
import type * as spec from './spec.layout.ts'
import type * as blogIndex from './blog-index.layout.ts'
import type * as blog from './blog.layout.ts'

// DOMStack's type registry names the renderer `render`; layout modules export it as default.
declare module '@domstack/static/types.js' {
  interface LayoutRegistry {
    root: typeof root & { render: typeof root.default }
    marketing: typeof marketing & { render: typeof marketing.default }
    product: typeof product & { render: typeof product.default }
    learn: typeof learn & { render: typeof learn.default }
    redirect: typeof redirect & { render: typeof redirect.default }
    docs: typeof docs & { render: typeof docs.default }
    spec: typeof spec & { render: typeof spec.default }
    blog: typeof blog & { render: typeof blog.default }
    'blog-index': typeof blogIndex & { render: typeof blogIndex.default }
  }
}
