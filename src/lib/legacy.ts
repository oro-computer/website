export function legacyTarget(
  raw: string,
  routes: Record<string, string>,
): string | undefined {
  const parts: string[] = []
  for (const part of raw.replace(/\\/g, '/').split('/')) {
    if (!part || part === '.') continue
    if (part === '..') {
      if (!parts.length) return
      parts.pop()
    } else parts.push(part)
  }
  let id = parts.join('/').replace(/\.(md|txt)$/, '')
  if (
    id === 'guides/toy-logger-module' &&
    Object.hasOwn(routes, 'guides/practical-logger-module')
  )
    id = 'guides/practical-logger-module'
  return Object.hasOwn(routes, id) ? routes[id] : undefined
}
