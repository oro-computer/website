import type { LayoutFunction } from '@domstack/static/types.js'
export const parentLayout = 'root'
const layout: LayoutFunction<Record<string, unknown>, string> = ({
  children,
}) => children
export default layout
