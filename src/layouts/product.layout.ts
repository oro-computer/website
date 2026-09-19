import type { LayoutFunction } from '@domstack/static/types.js'
import type {} from './root.layout.ts'
export const parentLayout = 'root'
const layout: LayoutFunction<Record<string, unknown>, string> = ({
  children,
}) => children
export default layout

declare module '@domstack/static/types.js' {
  interface LayoutRegistry {
    product: typeof import('./product.layout.ts') & { render: typeof layout }
  }
}
